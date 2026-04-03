#file handles all the url path dealing with the reviews app.
from django.urls import path
from . import views

urlpatterns = [
    path('reviews/', views.getReviews),
]