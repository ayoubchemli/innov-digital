from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("profile/", views.profile_view, name="profile"),
    path("mfa/setup/", views.mfa_setup_view, name="mfa_setup"),
    path("mfa/verify/", views.mfa_verify_view, name="mfa_verify"),
    path("mfa/disable/", views.disable_mfa_view, name="disable_mfa"),
]
