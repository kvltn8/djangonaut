from django.db import models
from django.contrib.auth.models import AbstractUser

class Users(AbstractUser):#
  email = models.EmailField(unique=True)
  

class Customers(models.Model):#handles the business logic
  city = models.CharField(max_length=255, null= True)
  country = models.CharField(max_length=100, null= True)
  loyalty_points =models.SmallIntegerField(null = True)
  delivery_address = models.TextField(null = True)
  phone_number = models.CharField(max_length=10, null = True)
  user_id = models.OneToOneField(Users, on_delete=models.CASCADE, related_name="Customer")
  
  