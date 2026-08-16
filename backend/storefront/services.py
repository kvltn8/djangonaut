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
        if not cart_items.exists():
            raise ValidationError("Cart is empty")
        customer = Customers.objects.get(user_id = user_id)
        order = Orders.objects.create(customerid = customer)
        cart_items = cart_items.select_related("product_id")
        product_ids = [item.product_id_id for item in cart_items]
        products = Products.objects.select_for_update().order_by("id").in_bulk(product_ids)
        #now converting/processing cartitems into orderitems
        order_items = []
        for item in cart_items:
            product = products[item.product_id_id]
            if product.stock_quantity < item.quantity:
                raise ValidationError(f"Not enough stock for {product.name}")
            product.stock_quantity -= item.quantity
            order_items.append(OrderItems(
                orderid = order,
                product_id = product,
                unitprice = product.price,
                quantity = item.quantity,
            ))
        OrderItems.objects.bulk_create(order_items)
        Products.objects.bulk_update(products.values(),["stock_quantity"])
        Carts.objects.filter(pk = cart_id).delete()
        return order




