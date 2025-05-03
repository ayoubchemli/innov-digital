from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()


class UserRegistrationForm(UserCreationForm):
    """Form for user registration"""

    USER_TYPE_CHOICES = User.USER_TYPE_CHOICES

    user_type = forms.ChoiceField(choices=USER_TYPE_CHOICES)
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2", "user_type")

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        user.user_type = self.cleaned_data["user_type"]

        if commit:
            user.save()
            # Create profile
            Profile.objects.create(user=user)

        return user


class ProfileUpdateForm(forms.ModelForm):
    """Form for updating user profile"""

    class Meta:
        model = Profile
        fields = ["phone", "address"]

    def __init__(self, *args, **kwargs):
        user = kwargs.pop("user", None)
        super().__init__(*args, **kwargs)

        if user and user.is_bank_agent():
            self.fields["employee_id"] = forms.CharField(max_length=50, required=False)
            self.fields["department"] = forms.CharField(max_length=100, required=False)

        if user and user.is_client():
            self.fields["client_id"] = forms.CharField(max_length=50, required=False)
            self.fields["account_number"] = forms.CharField(
                max_length=50, required=False
            )


class MFASetupForm(forms.Form):
    """Form for setting up MFA"""

    verification_code = forms.CharField(
        max_length=6,
        min_length=6,
        required=True,
        widget=forms.TextInput(attrs={"placeholder": "Enter 6-digit code"}),
    )


class MFAVerifyForm(forms.Form):
    """Form for verifying MFA during login"""

    verification_code = forms.CharField(
        max_length=6,
        min_length=6,
        required=True,
        widget=forms.TextInput(attrs={"placeholder": "Enter 6-digit code"}),
    )
