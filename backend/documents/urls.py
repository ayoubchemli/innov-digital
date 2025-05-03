from django.urls import path
from . import views

app_name = "documents"

urlpatterns = [
    # Document management
    path("", views.document_list, name="document_list"),
    path("create/", views.document_create, name="document_create"),
    path("<int:pk>/", views.document_detail, name="document_detail"),
    # Form templates
    path("templates/", views.form_template_list, name="form_template_list"),
    path("templates/create/", views.form_template_create, name="form_template_create"),
    path(
        "templates/<int:pk>/edit/", views.form_template_edit, name="form_template_edit"
    ),
    path(
        "templates/<int:pk>/delete/",
        views.form_template_delete,
        name="form_template_delete",
    ),
    path("templates/<int:template_id>/send/", views.form_send, name="form_send"),
    # Form submission
    path("<int:document_id>/fill/", views.form_fill, name="form_fill"),
    path(
        "submissions/<int:submission_id>/",
        views.form_submission_detail,
        name="form_submission_detail",
    ),
]
