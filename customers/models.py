from django.db import models
from django.contrib.auth.models import AbstractUser

class Users(AbstractUser):#
  email = models.EmailField(unique=True)
  

class Customers(models.Model):#handles the business logic
  city = models.CharField(max_length=255)
  country = models.CharField(max_length=100)
  loyalty_points =models.SmallIntegerField()
  delivery_address = models.TextField()
  phone_number = models.CharField(max_length=10)
  user_id = models.OneToOneField(Users, on_delete=models.CASCADE, related_name="Customer")
  
  