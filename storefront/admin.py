from django.contrib import admin
from .models import  *

admin.site.register([Category])

class ReviewInline(admin.TabularInline):
  model =Review 
  extra = 1
@admin.register( Products)
class ProductAdmin(admin.ModelAdmin):
  list_display = ["name", "price", "stock_quantity", "category_id"]
  list_editable = [ "price", "stock_quantity"]
  list_select_related = ["category_id"]
  inlines =[ReviewInline]


class OrderItemsInline(admin.TabularInline):
  model = OrderItems
  extra = 1
@admin.register(Orders)
class OrdersAdmin(admin.ModelAdmin):
  list_display = ["status", "customerid"]
  list_select_related = ["customerid"]
  inlines = [OrderItemsInline]

class CartItemsInline(admin.TabularInline):
  model = CartItems
  extra = 1
@admin.register(Carts)
class CartsAdmin(admin.ModelAdmin):
  list_display = ["id", "items"]
  list_prefetch_related = ["items"]
  inlines = [CartItemsInline]

