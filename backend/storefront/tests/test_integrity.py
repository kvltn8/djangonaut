import pytest
from django.core.cache import cache
from model_bakery import baker
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle

from customers.models import Users
from storefront.models import Category, OrderItems, Orders, Products, Review


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()


@pytest.mark.django_db
class TestSafeDeletes:
    def test_ordered_product_cannot_be_deleted_and_history_survives(self, staff_client):
        product = baker.make(Products, price=100, stock_quantity=3)
        order = baker.make(Orders, customerid=baker.make(Users).Customer)
        baker.make(OrderItems, orderid=order, product_id=product, quantity=1, unitprice=100)
        r = staff_client.delete(f"/products/{product.id}/")
        assert r.status_code == status.HTTP_409_CONFLICT
        assert Products.objects.filter(pk=product.pk).exists()
        assert OrderItems.objects.count() == 1

    def test_unordered_product_can_be_deleted(self, staff_client):
        product = baker.make(Products, price=100, stock_quantity=3)
        assert staff_client.delete(f"/products/{product.id}/").status_code == status.HTTP_204_NO_CONTENT

    def test_category_with_products_returns_409_not_500(self, staff_client):
        category = baker.make(Category)
        baker.make(Products, category_id=category, price=1, stock_quantity=1)
        assert staff_client.delete(f"/category/{category.id}/").status_code == status.HTTP_409_CONFLICT

    def test_only_staff_can_delete(self, user_client, anon):
        product = baker.make(Products, price=1, stock_quantity=1)
        assert user_client.delete(f"/products/{product.id}/").status_code == status.HTTP_403_FORBIDDEN
        assert anon.delete(f"/products/{product.id}/").status_code in (401, 403)


@pytest.mark.django_db
class TestReviews:
    def test_anyone_can_post_and_read(self, anon):
        product = baker.make(Products, price=1, stock_quantity=1)
        r = anon.post(f"/products/{product.id}/review/", {"name": "Amina", "comment": "Lovely fabric"}, format="json")
        assert r.status_code == status.HTTP_201_CREATED
        assert anon.get(f"/products/{product.id}/review/").status_code == 200

    def test_overlong_comment_rejected(self, anon):
        product = baker.make(Products, price=1, stock_quantity=1)
        r = anon.post(f"/products/{product.id}/review/", {"name": "A", "comment": "x" * 1001}, format="json")
        assert r.status_code == status.HTTP_400_BAD_REQUEST

    def test_posting_is_rate_limited_but_reading_is_not(self, anon, monkeypatch):
        monkeypatch.setitem(ScopedRateThrottle.THROTTLE_RATES, "reviews", "2/min")
        product = baker.make(Products, price=1, stock_quantity=1)
        url = f"/products/{product.id}/review/"
        codes = [anon.post(url, {"name": "A", "comment": "ok"}, format="json").status_code for _ in range(3)]
        assert codes == [201, 201, 429]
        assert all(anon.get(url).status_code == 200 for _ in range(5))

    def test_regular_user_cannot_delete_reviews(self, user_client):
        product = baker.make(Products, price=1, stock_quantity=1)
        review = baker.make(Review, product_id=product)
        assert user_client.delete(f"/products/{product.id}/review/{review.id}/").status_code == status.HTTP_403_FORBIDDEN
