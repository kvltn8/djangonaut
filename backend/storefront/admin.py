from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Category,
    Products,
    ProductsImage,
    Review,
    Orders,
    OrderItems,
    Carts,
    CartItems,
)


# -------------------------
# Category
# -------------------------

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "title")
    search_fields = ("title",)


# -------------------------
# Product Inlines
# -------------------------

class ReviewInline(admin.TabularInline):
    model = Review
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductsImage
    extra = 1


# -------------------------
# Products
# -------------------------

@admin.register(Products)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "thumbnail",
        "name",
        "price",
        "stock_quantity",
        "category_id",
    )

    list_editable = (
        "price",
        "stock_quantity",
    )

    list_select_related = (
        "category_id",
    )

    search_fields = (
        "name",
    )

    inlines = [
        ReviewInline,
        ProductImageInline,
    ]

    @admin.display(description="Image")
    def thumbnail(self, obj):
        image = obj.images.first()

        if image and image.image:
            return format_html(
                '<img src="{}" width="60" height="60" '
                'style="object-fit: cover; border-radius: 5px;" />',
                image.image,
            )

        return "No image"


# -------------------------
# Order Items Inline
# -------------------------

class OrderItemsInline(admin.TabularInline):
    model = OrderItems
    extra = 1


# -------------------------
# Orders
# -------------------------

@admin.register(Orders)
class OrdersAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "status",
        "customerid",
    )

    list_select_related = (
        "customerid",
    )

    inlines = [
        OrderItemsInline,
    ]


# -------------------------
# Cart Items Inline
# -------------------------

class CartItemsInline(admin.TabularInline):
    model = CartItems
    extra = 1


# -------------------------
# Carts
# -------------------------

@admin.register(Carts)
class CartsAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "created_at",
    )

    inlines = [
        CartItemsInline,
    ]