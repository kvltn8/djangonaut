from django.db import models

# Create your models here.
class Review(models.Model):
  
  description = models.TextField()
  ratings = models.SmallIntegerField()
  created_at = models.DateTimeField(auto_now_add= True)