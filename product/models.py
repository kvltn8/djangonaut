from django.db import models

# Create your models here.
class Product(models.Model):
  title = models.CharField(max_length=50) #varchar
  price = models.BigIntegerField()
  description = models.TextField()
  updated_at = models.DateTimeField(auto_now=True)
  created_at = models.DateTimeField(auto_now_add=True)
  