import logging

from django import forms
from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Carts,
    CartItems,
    Category,
    OrderItems,
    Orders,
    Products,
    ProductsImage,
    Review,
)
from .storage import (
    ImageUploadError,
    deleteproductimage,
    uploadproductimage,
    validate_image_file,
)

logger = logging.getLogger(__name__)


def safe_delete_image(url):
    """Remove a file from Supabase without breaking Django Admin."""
    if not url:
        return

    try:
        deleteproductimage(url)
    except Exception:
        logger.exception("Could not delete image from storage: %s", url)


# -------------------------
# Category
# -------------------------

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "title")
    search_fields = ("title",)


# -------------------------
# Product inlines
# -------------------------

class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0


class ProductsImageForm(forms.ModelForm):
    """Inline form: pick a file, it is uploaded to storage and the URL saved."""

    image_file = forms.ImageField(
        required=False,
        label="Upload image",
        help_text="JPG, PNG or WebP, up to 5 MB.",
    )

    class Meta:
        model = ProductsImage
        exclude = ("image",)

    def clean_image_file(self):
        uploaded = self.cleaned_data.get("image_file")
        if uploaded:
            try:
                validate_image_file(uploaded)
            except ImageUploadError as exc:
                raise forms.ValidationError(str(exc))
        return uploaded

    def save(self, commit=True):
        instance = super().save(commit=False)
        uploaded_file = self.cleaned_data.get("image_file")

        if uploaded_file:
            # Remember the previous file so the admin can delete it *after*
            # the new URL has been saved safely.
            instance._old_image_url = instance.image if instance.pk else None

            try:
                uploaded_file.seek(0)
                instance.image = uploadproductimage(uploaded_file)
            except ImageUploadError as exc:
                raise forms.ValidationError(str(exc))

        if commit:
            instance.save()
            safe_delete_image(getattr(instance, "_old_image_url", None))

        return instance


class ProductImageInline(admin.TabularInline):
    model = ProductsImage
    form = ProductsImageForm
    extra = 1
    fields = ("preview", "image_file")
    readonly_fields = ("preview",)

    @admin.display(description="Current image")
    def preview(self, obj):
        if obj and obj.image:
            return format_html(
                '<img src="{}" width="80" height="80" '
                'style="object-fit: cover; border-radius: 5px;" />',
                obj.image,
            )
        return "No image"


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
    list_editable = ("price", "stock_quantity")
    list_select_related = ("category_id",)
    search_fields = ("name",)
    inlines = [ReviewInline, ProductImageInline]

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("images")

    @admin.display(description="Image")
    def thumbnail(self, obj):
        images = list(obj.images.all())

        if images and images[0].image:
            return format_html(
                '<img src="{}" width="60" height="60" '
                'style="object-fit: cover; border-radius: 5px;" />',
                images[0].image,
            )
        return "No image"

    def save_formset(self, request, form, formset, change):
        """Save inline rows, upload new images and clean up replaced/deleted ones."""
        # commit=False makes Django hand back the changed objects without
        # saving them, and fills formset.deleted_objects.
        instances = formset.save(commit=False)

        for obj in formset.deleted_objects:
            url = obj.image if isinstance(obj, ProductsImage) else None
            obj.delete()
            safe_delete_image(url)

        for instance in instances:
            instance.save()
            # Only set by ProductsImageForm when a replacement file was uploaded.
            safe_delete_image(getattr(instance, "_old_image_url", None))

        formset.save_m2m()


# -------------------------
# Orders & carts (read-mostly)
# -------------------------

class OrderItemInline(admin.TabularInline):
    model = OrderItems
    extra = 0


@admin.register(Orders)
class OrdersAdmin(admin.ModelAdmin):
    list_display = ("id", "customerid", "status", "created_at")
    list_filter = ("status",)
    inlines = [OrderItemInline]


class CartItemInline(admin.TabularInline):
    model = CartItems
    extra = 0


@admin.register(Carts)
class CartsAdmin(admin.ModelAdmin):
    list_display = ("id", "created_at")
    inlines = [CartItemInline]
