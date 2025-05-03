from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse
from .forms import UserRegistrationForm, ProfileUpdateForm, MFASetupForm, MFAVerifyForm
from .models import User, Profile
from .mfa_utils import (
    generate_mfa_secret,
    verify_mfa_token,
    generate_mfa_qr_code_base64,
)


def register_view(request):
    """Handle user registration"""
    if request.method == "POST":
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, "Account created successfully. Please log in.")
            return redirect("accounts:login")
    else:
        form = UserRegistrationForm()

    return render(request, "accounts/register.html", {"form": form})


def login_view(request):
    """Handle user login with MFA if enabled"""
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        # First step of authentication
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Check if MFA is enabled for the user
            if user.mfa_enabled:
                # Store user ID in session for the second step
                request.session["mfa_user_id"] = user.id
                return redirect("accounts:mfa_verify")
            else:
                # No MFA, complete login
                login(request, user)
                messages.success(request, f"Welcome back, {user.username}!")
                return redirect("home")
        else:
            messages.error(request, "Invalid username or password.")

    return render(request, "accounts/login.html")


@login_required
def logout_view(request):
    """Handle user logout"""
    logout(request)
    messages.success(request, "You have been logged out.")
    return redirect("home")


@login_required
def profile_view(request):
    """Display and update user profile"""
    if request.method == "POST":
        form = ProfileUpdateForm(
            request.POST, instance=request.user.profile, user=request.user
        )
        if form.is_valid():
            form.save()
            messages.success(request, "Your profile has been updated.")
            return redirect("accounts:profile")
    else:
        form = ProfileUpdateForm(instance=request.user.profile, user=request.user)

    return render(request, "accounts/profile.html", {"form": form})


@login_required
def mfa_setup_view(request):
    """Setup MFA for a user"""
    # Check if MFA is already enabled
    if request.user.mfa_enabled:
        messages.info(request, "MFA is already enabled for your account.")
        return redirect("accounts:profile")

    # Generate a new secret if not already in session
    if "mfa_secret" not in request.session:
        request.session["mfa_secret"] = generate_mfa_secret()

    secret = request.session["mfa_secret"]
    qr_code = generate_mfa_qr_code_base64(request.user, secret)

    if request.method == "POST":
        form = MFASetupForm(request.POST)
        if form.is_valid():
            verification_code = form.cleaned_data["verification_code"]

            # Verify the code
            if verify_mfa_token(secret, verification_code):
                # Save the secret to the user's account
                request.user.mfa_secret = secret
                request.user.mfa_enabled = True
                request.user.save()

                # Clean up session
                if "mfa_secret" in request.session:
                    del request.session["mfa_secret"]

                messages.success(request, "MFA has been enabled for your account.")
                return redirect("accounts:profile")
            else:
                messages.error(request, "Invalid verification code. Please try again.")
    else:
        form = MFASetupForm()

    return render(
        request,
        "accounts/mfa_setup.html",
        {"form": form, "qr_code": qr_code, "secret": secret},
    )


def mfa_verify_view(request):
    """Verify MFA token during login"""
    # Check if we have a user in session
    if "mfa_user_id" not in request.session:
        messages.error(request, "Authentication error. Please login again.")
        return redirect("accounts:login")

    # Get the user
    try:
        user = User.objects.get(id=request.session["mfa_user_id"])
    except User.DoesNotExist:
        messages.error(request, "Authentication error. Please login again.")
        return redirect("accounts:login")

    if request.method == "POST":
        form = MFAVerifyForm(request.POST)
        if form.is_valid():
            verification_code = form.cleaned_data["verification_code"]

            # Verify the code
            if verify_mfa_token(user.mfa_secret, verification_code):
                # Complete login
                login(request, user)

                # Clean up session
                if "mfa_user_id" in request.session:
                    del request.session["mfa_user_id"]

                messages.success(request, f"Welcome back, {user.username}!")
                return redirect("home")
            else:
                messages.error(request, "Invalid verification code. Please try again.")
    else:
        form = MFAVerifyForm()

    return render(request, "accounts/mfa_verify.html", {"form": form})


@login_required
def disable_mfa_view(request):
    """Disable MFA for the current user"""
    if not request.user.mfa_enabled:
        messages.info(request, "MFA is not enabled for your account.")
        return redirect("accounts:profile")

    if request.method == "POST":
        # Confirm with password
        password = request.POST.get("password")
        if request.user.check_password(password):
            # Disable MFA
            request.user.mfa_enabled = False
            request.user.mfa_secret = None
            request.user.save()

            messages.success(request, "MFA has been disabled for your account.")
            return redirect("accounts:profile")
        else:
            messages.error(request, "Incorrect password. MFA not disabled.")

    return render(request, "accounts/disable_mfa.html")
