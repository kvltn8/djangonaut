from djoser.serializers import UserCreateSerializer as BaseUserSerializer #
from rest_framework import serializers
from .models import Customers

class UserCreateSerializer(BaseUserSerializer):
  class Meta(BaseUserSerializer.Meta):
    fields=['id', 'first_name','last_name', 'email', 'username','password']

class CustomersSerializer(serializers.ModelSerializer):
  class Meta:
    model = Customers
    fields=['id', 'user_id', 'phone_number', 'city', 'country', 'delivery_address', 'loyalty_points']