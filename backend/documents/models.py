from django.db import models
from users.models import User

class Document(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    file = models.FileField(upload_to='documents/', null=True, blank=True)
    form_data = models.JSONField(null=True, blank=True)  # For forms
    sender = models.ForeignKey(User, related_name='sent_documents', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='received_documents', on_delete=models.CASCADE)
    submitted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
