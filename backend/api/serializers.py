from rest_framework import serializers
from django.contrib.auth import get_user_model
from documents.models import (
    Document,
    FormTemplate,
    FormField,
    FormSubmission,
    FormResponse,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user model"""

    class Meta:
        model = User
        fields = ["id", "username", "email", "user_type", "first_name", "last_name"]
        read_only_fields = ["id", "user_type"]


class ClientSerializer(serializers.ModelSerializer):
    """Serializer for client users"""

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = fields


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for documents"""

    created_by = UserSerializer(read_only=True)
    client = ClientSerializer(read_only=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "title",
            "description",
            "file",
            "created_by",
            "client",
            "created_at",
            "updated_at",
            "status",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]


class DocumentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating documents"""

    class Meta:
        model = Document
        fields = ["id", "title", "description", "file", "client"]
        read_only_fields = ["id"]


class FormFieldSerializer(serializers.ModelSerializer):
    """Serializer for form fields"""

    class Meta:
        model = FormField
        fields = ["id", "label", "field_type", "required", "options", "order"]


class FormTemplateSerializer(serializers.ModelSerializer):
    """Serializer for form templates"""

    fields = FormFieldSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = FormTemplate
        fields = [
            "id",
            "title",
            "description",
            "created_by",
            "created_at",
            "updated_at",
            "fields",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]


class FormTemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating form templates"""

    fields = FormFieldSerializer(many=True)

    class Meta:
        model = FormTemplate
        fields = ["id", "title", "description", "fields"]
        read_only_fields = ["id"]

    def create(self, validated_data):
        fields_data = validated_data.pop("fields")
        template = FormTemplate.objects.create(**validated_data)

        for field_data in fields_data:
            FormField.objects.create(template=template, **field_data)

        return template


class FormResponseSerializer(serializers.ModelSerializer):
    """Serializer for form responses"""

    field_label = serializers.CharField(source="field.label", read_only=True)
    field_type = serializers.CharField(source="field.field_type", read_only=True)

    class Meta:
        model = FormResponse
        fields = ["id", "field", "field_label", "field_type", "value"]


class FormSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for form submissions"""

    responses = FormResponseSerializer(many=True, read_only=True)
    client = UserSerializer(read_only=True)
    template = FormTemplateSerializer(read_only=True)

    class Meta:
        model = FormSubmission
        fields = ["id", "template", "client", "submitted_at", "responses"]
        read_only_fields = fields


class FormSubmitSerializer(serializers.Serializer):
    """Serializer for submitting a form"""

    template_id = serializers.IntegerField()
    responses = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField(), allow_empty=False)
    )

    def validate_template_id(self, value):
        """Validate the template exists"""
        try:
            FormTemplate.objects.get(pk=value)
        except FormTemplate.DoesNotExist:
            raise serializers.ValidationError("Form template does not exist")
        return value

    def validate_responses(self, value):
        """Validate responses match template fields"""
        template_id = self.initial_data.get("template_id")
        try:
            template = FormTemplate.objects.get(pk=template_id)
            field_ids = set(template.fields.values_list("id", flat=True))

            for response in value:
                if "field_id" not in response:
                    raise serializers.ValidationError(
                        "Each response must have a field_id"
                    )

                try:
                    field_id = int(response["field_id"])
                    if field_id not in field_ids:
                        raise serializers.ValidationError(
                            f"Field {field_id} does not belong to this template"
                        )
                except ValueError:
                    raise serializers.ValidationError("field_id must be an integer")

                if "value" not in response:
                    raise serializers.ValidationError("Each response must have a value")
        except FormTemplate.DoesNotExist:
            # Will be caught by validate_template_id
            pass

        return value
