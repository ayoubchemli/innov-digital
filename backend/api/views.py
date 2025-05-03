from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from documents.models import (
    Document,
    FormTemplate,
    FormField,
    FormSubmission,
    FormResponse,
)
from .serializers import (
    UserSerializer,
    ClientSerializer,
    DocumentSerializer,
    DocumentCreateSerializer,
    FormTemplateSerializer,
    FormTemplateCreateSerializer,
    FormSubmissionSerializer,
    FormSubmitSerializer,
)

User = get_user_model()


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner
        return obj.created_by == request.user


class IsBankAgent(permissions.BasePermission):
    """
    Custom permission to only allow bank agents.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_bank_agent()


class IsClient(permissions.BasePermission):
    """
    Custom permission to only allow clients.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_client()


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing users"""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter users based on user type"""
        user = self.request.user
        if user.is_bank_agent():
            # Bank agents can see all clients
            return User.objects.filter(user_type="client")
        return User.objects.filter(pk=user.pk)  # Clients can only see themselves


class DocumentViewSet(viewsets.ModelViewSet):
    """API endpoint for managing documents"""

    queryset = Document.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return DocumentCreateSerializer
        return DocumentSerializer

    def get_queryset(self):
        """Filter documents based on user type"""
        user = self.request.user
        if user.is_bank_agent():
            return Document.objects.filter(created_by=user)
        return Document.objects.filter(client=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, status="sent")

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        """Update document status"""
        document = self.get_object()
        status = request.data.get("status")

        if status not in dict(Document.STATUS_CHOICES):
            return Response(
                {"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST
            )

        document.status = status
        document.save()

        serializer = self.get_serializer(document)
        return Response(serializer.data)


class FormTemplateViewSet(viewsets.ModelViewSet):
    """API endpoint for managing form templates"""

    queryset = FormTemplate.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsBankAgent, IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return FormTemplateCreateSerializer
        return FormTemplateSerializer

    def get_queryset(self):
        """Bank agents can only see their own templates"""
        return FormTemplate.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def send_to_client(self, request, pk=None):
        """Send a form template to a client"""
        template = self.get_object()
        client_id = request.data.get("client_id")
        title = request.data.get("title", f"Form: {template.title}")
        description = request.data.get("description", template.description)

        # Validate client
        try:
            client = User.objects.get(pk=client_id, user_type="client")
        except User.DoesNotExist:
            return Response(
                {"error": "Client not found"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Create document
        document = Document.objects.create(
            title=title,
            description=f"{description}\n\nForm Template ID: {template.id}",
            created_by=request.user,
            client=client,
            status="sent",
        )

        serializer = DocumentSerializer(document)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FormSubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for viewing form submissions"""

    queryset = FormSubmission.objects.all()
    serializer_class = FormSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter submissions based on user type"""
        user = self.request.user
        if user.is_bank_agent():
            # Bank agents can see submissions for their templates
            return FormSubmission.objects.filter(template__created_by=user)
        # Clients can see their own submissions
        return FormSubmission.objects.filter(client=user)


class SubmitFormView(generics.CreateAPIView):
    """API endpoint for submitting a form"""

    serializer_class = FormSubmitSerializer
    permission_classes = [permissions.IsAuthenticated, IsClient]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        template_id = serializer.validated_data["template_id"]
        responses_data = serializer.validated_data["responses"]

        template = get_object_or_404(FormTemplate, pk=template_id)

        with transaction.atomic():
            # Create submission
            submission = FormSubmission.objects.create(
                template=template, client=request.user
            )

            # Create responses
            for response_data in responses_data:
                field_id = int(response_data["field_id"])
                value = response_data["value"]

                field = get_object_or_404(FormField, pk=field_id, template=template)
                FormResponse.objects.create(
                    submission=submission, field=field, value=value
                )

            # Update any associated documents
            documents = Document.objects.filter(
                client=request.user,
                description__contains=f"Form Template ID: {template_id}",
                status__in=["sent", "viewed"],
            )
            for document in documents:
                document.status = "completed"
                document.save()

        submission_serializer = FormSubmissionSerializer(submission)
        return Response(submission_serializer.data, status=status.HTTP_201_CREATED)
