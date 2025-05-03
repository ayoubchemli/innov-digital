from django.db import models
from django.conf import settings
import uuid
import os


def document_file_path(instance, filename):
    """Generate file path for new document"""
    ext = filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join("uploads/documents/", filename)


class Document(models.Model):
    """Document model for files shared between bank and clients"""

    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("sent", "Sent"),
        ("viewed", "Viewed"),
        ("completed", "Completed"),
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to=document_file_path, blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_documents",
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_documents",
        limit_choices_to={"user_type": "client"},
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")

    def __str__(self):
        return self.title


class FormTemplate(models.Model):
    """Template for forms that can be sent to clients"""

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={"user_type": "agent"},
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class FormField(models.Model):
    """Individual fields within a form template"""

    FIELD_TYPE_CHOICES = (
        ("text", "Text Input"),
        ("textarea", "Text Area"),
        ("number", "Number"),
        ("date", "Date"),
        ("select", "Select"),
        ("checkbox", "Checkbox"),
    )

    template = models.ForeignKey(
        FormTemplate, on_delete=models.CASCADE, related_name="fields"
    )
    label = models.CharField(max_length=255)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES)
    required = models.BooleanField(default=False)
    options = models.TextField(
        blank=True, help_text="Comma-separated options for select fields"
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.template.title} - {self.label}"


class FormSubmission(models.Model):
    """Completed form submitted by a client"""

    template = models.ForeignKey(FormTemplate, on_delete=models.CASCADE)
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={"user_type": "client"},
    )
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.template.title} - {self.client.username}"


class FormResponse(models.Model):
    """Individual field responses in a form submission"""

    submission = models.ForeignKey(
        FormSubmission, on_delete=models.CASCADE, related_name="responses"
    )
    field = models.ForeignKey(FormField, on_delete=models.CASCADE)
    value = models.TextField()

    def __str__(self):
        return f"{self.field.label}: {self.value[:50]}"
