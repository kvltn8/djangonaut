import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from model_bakery import baker
from PIL import Image
from rest_framework import status

from storefront import serializers as storefront_serializers
from storefront.models import Category, Products, ProductsImage

PRODUCT = {"name": "Classic Abaya", "descprition": "Black crepe abaya", "price": 8900, "stock_quantity": 20}


def png_file(name="a.png"):
    buf = io.BytesIO()
    Image.new("RGB", (10, 10), "white").save(buf, "PNG")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/png")


@pytest.mark.django_db
class TestProducts:
    def test_list_products_is_public(self, anon):
        assert anon.get("/products/").status_code == status.HTTP_200_OK

    def test_search_by_name(self, anon):
        baker.make(Products, name="Linen Abaya", descprition="x", price=1, stock_quantity=1)
        baker.make(Products, name="Leather Sandals", descprition="x", price=1, stock_quantity=1)
        r = anon.get("/products/", {"search": "abaya"})
        assert [p["name"] for p in r.data["results"]] == ["Linen Abaya"]

    def test_anonymous_cannot_create(self, anon):
        category = baker.make(Category)
        r = anon.post("/products/", {**PRODUCT, "category_id": category.id}, format="json")
        assert r.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)

    def test_regular_user_cannot_create(self, user_client):
        r = user_client.post("/products/", PRODUCT, format="json")
        assert r.status_code == status.HTTP_403_FORBIDDEN

    def test_staff_can_create(self, staff_client):
        category = baker.make(Category)
        r = staff_client.post("/products/", {**PRODUCT, "category_id": category.id}, format="json")
        assert r.status_code == status.HTTP_201_CREATED

    def test_invalid_data(self, staff_client):
        assert staff_client.post("/products/", {"title": "Laptop"}, format="json").status_code == status.HTTP_400_BAD_REQUEST

    def test_anonymous_cannot_delete(self, anon):
        product = baker.make(Products)
        assert anon.delete(f"/products/{product.id}/").status_code in (401, 403)
        assert Products.objects.filter(pk=product.pk).exists()


@pytest.mark.django_db
class TestProductImages:
    def test_staff_upload_saves_url(self, staff_client, monkeypatch):
        monkeypatch.setattr(storefront_serializers, "uploadproductimage", lambda f: "https://cdn.example/x.png")
        product = baker.make(Products)
        r = staff_client.post(f"/products/{product.id}/images/", {"upload": png_file()}, format="multipart")
        assert r.status_code == status.HTTP_201_CREATED, r.data
        assert ProductsImage.objects.get(product_id=product).image == "https://cdn.example/x.png"

    def test_storage_failure_is_a_readable_400_not_a_500(self, staff_client, monkeypatch):
        from storefront.storage import ImageUploadError

        def boom(_):
            raise ImageUploadError("Image storage is not configured.")

        monkeypatch.setattr(storefront_serializers, "uploadproductimage", boom)
        product = baker.make(Products)
        r = staff_client.post(f"/products/{product.id}/images/", {"upload": png_file()}, format="multipart")
        assert r.status_code == status.HTTP_400_BAD_REQUEST
        assert "not configured" in str(r.data)

    def test_anonymous_cannot_upload(self, anon):
        product = baker.make(Products)
        r = anon.post(f"/products/{product.id}/images/", {"upload": png_file()}, format="multipart")
        assert r.status_code in (401, 403)

    def test_admin_inline_saves_new_image(self, monkeypatch, admin_client):
        """Regression: admin.py used to end mid-comment, so inline uploads were never saved."""
        from storefront import admin as storefront_admin

        monkeypatch.setattr(storefront_admin, "uploadproductimage", lambda f: "https://cdn.example/new.png")
        monkeypatch.setattr(storefront_admin, "validate_image_file", lambda f: None)
        category = baker.make(Category)
        product = baker.make(Products, price=10, stock_quantity=3, category_id=category)
        data = {
            "name": product.name, "descprition": product.descprition, "price": "10", "stock_quantity": "3",
            "category_id": str(category.id),
            "product_review-TOTAL_FORMS": "0", "product_review-INITIAL_FORMS": "0",
            "product_review-MIN_NUM_FORMS": "0", "product_review-MAX_NUM_FORMS": "1000",
            "images-TOTAL_FORMS": "1", "images-INITIAL_FORMS": "0",
            "images-MIN_NUM_FORMS": "0", "images-MAX_NUM_FORMS": "1000",
            "images-0-image_file": png_file(),
        }
        r = admin_client.post(f"/admin/storefront/products/{product.id}/change/", data)
        assert r.status_code == 302, getattr(r, "context", None) and r.context["adminform"].form.errors
        assert list(ProductsImage.objects.filter(product_id=product).values_list("image", flat=True)) == ["https://cdn.example/new.png"]