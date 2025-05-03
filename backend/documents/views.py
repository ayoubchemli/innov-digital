from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse
from django.http import HttpResponseForbidden
from django.db import transaction
from .models import Document, FormTemplate, FormField, FormSubmission, FormResponse
from .forms import DocumentForm, FormTemplateForm, FormFieldFormSet, FormSubmissionForm


@login_required
def document_list(request):
    """Display list of documents based on user type"""
    if request.user.is_bank_agent():
        # Bank agents see documents they created
        documents = Document.objects.filter(created_by=request.user)
    else:
        # Clients see documents shared with them
        documents = Document.objects.filter(client=request.user)

    context = {"documents": documents, "is_agent": request.user.is_bank_agent()}
    return render(request, "documents/document_list.html", context)


@login_required
def document_create(request):
    """Create a new document"""
    if not request.user.is_bank_agent():
        messages.error(request, "Only bank agents can create documents.")
        return redirect("documents:document_list")

    if request.method == "POST":
        form = DocumentForm(request.POST, request.FILES, user=request.user)
        if form.is_valid():
            document = form.save(commit=False)
            document.created_by = request.user
            document.status = "sent"
            document.save()
            messages.success(
                request, f"Document '{document.title}' has been created and sent."
            )
            return redirect("documents:document_list")
    else:
        form = DocumentForm(user=request.user)

    return render(request, "documents/document_form.html", {"form": form})


@login_required
def document_detail(request, pk):
    """View document details"""
    document = get_object_or_404(Document, pk=pk)

    # Check permissions
    if not (request.user == document.created_by or request.user == document.client):
        return HttpResponseForbidden("You don't have permission to view this document.")

    # Update status if client is viewing
    if request.user == document.client and document.status == "sent":
        document.status = "viewed"
        document.save()

    return render(request, "documents/document_detail.html", {"document": document})


@login_required
def form_template_list(request):
    """Display list of form templates for bank agents"""
    if not request.user.is_bank_agent():
        messages.error(request, "Only bank agents can access form templates.")
        return redirect("documents:document_list")

    templates = FormTemplate.objects.filter(created_by=request.user)
    return render(
        request, "documents/form_template_list.html", {"templates": templates}
    )


@login_required
def form_template_create(request):
    """Create a new form template with fields"""
    if not request.user.is_bank_agent():
        messages.error(request, "Only bank agents can create form templates.")
        return redirect("documents:document_list")

    if request.method == "POST":
        form = FormTemplateForm(request.POST)
        formset = FormFieldFormSet(request.POST)

        if form.is_valid() and formset.is_valid():
            with transaction.atomic():
                template = form.save(commit=False)
                template.created_by = request.user
                template.save()

                # Save formset with the template instance
                formset.instance = template
                formset.save()

                messages.success(
                    request, f"Form template '{template.title}' has been created."
                )
                return redirect("documents:form_template_list")
    else:
        form = FormTemplateForm()
        formset = FormFieldFormSet()

    return render(
        request, "documents/form_template_form.html", {"form": form, "formset": formset}
    )


@login_required
def form_template_edit(request, pk):
    """Edit an existing form template"""
    template = get_object_or_404(FormTemplate, pk=pk, created_by=request.user)

    if request.method == "POST":
        form = FormTemplateForm(request.POST, instance=template)
        formset = FormFieldFormSet(request.POST, instance=template)

        if form.is_valid() and formset.is_valid():
            with transaction.atomic():
                form.save()
                formset.save()
                messages.success(
                    request, f"Form template '{template.title}' has been updated."
                )
                return redirect("documents:form_template_list")
    else:
        form = FormTemplateForm(instance=template)
        formset = FormFieldFormSet(instance=template)

    return render(
        request,
        "documents/form_template_form.html",
        {"form": form, "formset": formset, "template": template},
    )


@login_required
def form_template_delete(request, pk):
    """Delete a form template"""
    template = get_object_or_404(FormTemplate, pk=pk, created_by=request.user)

    if request.method == "POST":
        template_name = template.title
        template.delete()
        messages.success(request, f"Form template '{template_name}' has been deleted.")
        return redirect("documents:form_template_list")

    return render(
        request, "documents/form_template_confirm_delete.html", {"template": template}
    )


@login_required
def form_send(request, template_id):
    """Send a form to a client"""
    if not request.user.is_bank_agent():
        messages.error(request, "Only bank agents can send forms.")
        return redirect("documents:document_list")

    template = get_object_or_404(FormTemplate, pk=template_id, created_by=request.user)

    if request.method == "POST":
        # Create a document linking the form to the client
        client_id = request.POST.get("client")
        title = request.POST.get("title") or f"Form: {template.title}"
        description = request.POST.get("description") or template.description

        from django.contrib.auth import get_user_model

        User = get_user_model()
        client = get_object_or_404(User, pk=client_id, user_type="client")

        document = Document.objects.create(
            title=title,
            description=description,
            created_by=request.user,
            client=client,
            status="sent",
        )

        # Store the form template ID in the document's description
        document.description = f"{description}\n\nForm Template ID: {template.id}"
        document.save()

        messages.success(request, f"Form '{title}' has been sent to {client.username}.")
        return redirect("documents:document_list")

    # Get all clients
    from django.contrib.auth import get_user_model

    User = get_user_model()
    clients = User.objects.filter(user_type="client")

    return render(
        request, "documents/form_send.html", {"template": template, "clients": clients}
    )


@login_required
def form_fill(request, document_id):
    """Fill out a form as a client"""
    document = get_object_or_404(Document, pk=document_id, client=request.user)

    # Extract template ID from description
    import re

    template_id_match = re.search(r"Form Template ID: (\d+)", document.description)
    if not template_id_match:
        messages.error(request, "This document does not contain a valid form.")
        return redirect("documents:document_detail", pk=document_id)

    template_id = template_id_match.group(1)
    template = get_object_or_404(FormTemplate, pk=template_id)

    if request.method == "POST":
        form = FormSubmissionForm(request.POST, template=template)

        if form.is_valid():
            with transaction.atomic():
                # Create form submission
                submission = FormSubmission.objects.create(
                    template=template, client=request.user
                )

                # Create responses for each field
                for field in template.fields.all():
                    field_id = f"field_{field.id}"
                    value = form.cleaned_data.get(field_id, "")

                    FormResponse.objects.create(
                        submission=submission, field=field, value=str(value)
                    )

                # Update document status
                document.status = "completed"
                document.save()

                messages.success(request, "Form has been submitted successfully.")
                return redirect("documents:document_list")
    else:
        form = FormSubmissionForm(template=template)

    return render(
        request,
        "documents/form_fill.html",
        {"form": form, "document": document, "template": template},
    )


@login_required
def form_submission_detail(request, submission_id):
    """View form submission details"""
    submission = get_object_or_404(FormSubmission, pk=submission_id)

    # Check permissions
    if not (
        request.user.is_bank_agent()
        and submission.template.created_by == request.user
        or request.user == submission.client
    ):
        return HttpResponseForbidden(
            "You don't have permission to view this submission."
        )

    responses = FormResponse.objects.filter(submission=submission)

    return render(
        request,
        "documents/form_submission_detail.html",
        {"submission": submission, "responses": responses},
    )
