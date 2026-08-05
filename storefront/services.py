from django.db import transaction
from rest_framework.exceptions import ValidationError
from .models import Orders, OrderItems, Carts, CartItems, Products
from customers.models import Customers

class OrderService:
    @staticmethod
    @transaction.atomic
    def create_order(user_id, cart_id): # to create an order you must be a logged in user and have an active cart
        if not Carts.objects.filter(pk=cart_id).exists():
            raise ValidationError("Cart does not exist.")
        cart_items = CartItems.objects.filter(cart_id=cart_id)
