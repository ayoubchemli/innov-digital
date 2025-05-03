from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Custom user model with user type field"""

    USER_TYPE_CHOICES = (
        ("client", "Client"),
        ("agent", "Bank Agent"),
    )

    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default="client",
    )

    # MFA related fields
    mfa_enabled = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=255, blank=True, null=True)

    def is_bank_agent(self):
        return self.user_type == "agent"

    def is_client(self):
        return self.user_type == "client"


class Profile(models.Model):
    """User profile with additional information"""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    # For bank agents
    employee_id = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=100, blank=True)

    # For clients
    client_id = models.CharField(max_length=50, blank=True)
    account_number = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.user.username}'s profile"
