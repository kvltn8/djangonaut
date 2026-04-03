#file handles all the url path dealing with the reviews app.
from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.Productlist),
    path('products/<int:pk>/', views.product_details),

]