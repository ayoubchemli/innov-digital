from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r"users", views.UserViewSet)
router.register(r"documents", views.DocumentViewSet)
router.register(r"templates", views.FormTemplateViewSet)
router.register(r"submissions", views.FormSubmissionViewSet)

# URL patterns for the API
urlpatterns = [
    path("", include(router.urls)),
    path("submit-form/", views.SubmitFormView.as_view(), name="submit-form"),
    path("api-auth/", include("rest_framework.urls")),
]
