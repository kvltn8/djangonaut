from django.contrib import admin
from django import forms
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
from .storage import uploadproductimage

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

class ProductsImageForm(forms.ModelForm):
    image = forms.ImageField(required=False)

    class Meta:
        model = ProductsImage
        fields = "__all__"

    def save(self, commit=True):
        instance = super().save(commit=False)

        uploaded_file = self.cleaned_data.get("image")

        if uploaded_file:
            image_url = uploadproductimage(uploaded_file)
            instance.image = image_url

        if commit:
            instance.save()

        return instance
class ProductImageInline(admin.TabularInline):
    model = ProductsImage
    form = ProductsImageForm
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