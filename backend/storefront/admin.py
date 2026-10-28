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
from .storage import deleteproductimage, uploadproductimage

logger = logging.getLogger(__name__)


def safe_delete_image(url):
    """Remove a file from Supabase without breaking Django Admin."""
    if not url:
        return

    try:
        deleteproductimage(url)
    except Exception:
        logger.exception(
            "Could not delete image from storage: %s",
            url,
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


class ProductsImageForm(forms.ModelForm):
    image_file = forms.ImageField(
        required=False,
        label="Upload image",
    )

    class Meta:
        model = ProductsImage
        exclude = ("image",)

    def save(self, commit=True):
        instance = super().save(commit=False)
        uploaded_file = self.cleaned_data.get("image_file")

        if uploaded_file:
            old_url = instance.image if instance.pk else None

            uploaded_file.seek(0)
            new_url = uploadproductimage(uploaded_file)

            if not new_url:
                raise forms.ValidationError(
                    "The image upload failed. No image URL was returned."
                )

            instance.image = new_url

            # Save the new URL before removing the previous image.
            if commit:
                instance.save()
                safe_delete_image(old_url)

        if commit and not uploaded_file:
            instance.save()

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

class ProductAdminForm(forms.ModelForm):
    class Meta:
        model = Products
        fields = "__all__"


@admin.register(Products)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm

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
        return (
            super()
            .get_queryset(request)
            .prefetch_related("images")
        )

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
        """Save inline rows and clean up deleted Supabase images."""

        # Process deletions before saving the remaining inline rows.
        for obj in formset.deleted_objects:
            url = obj.image if isinstance(obj, ProductsImage) else None
            obj.delete()
            safe_delete_image(url)

        # Save each inline through its own ModelForm so that
        # Products