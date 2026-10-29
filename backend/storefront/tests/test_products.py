import pytest
from model_bakery import baker
from rest_framework import status

from customers.models import Users
from storefront.models import CartItems, Carts, Orders, Products


@pytest.mark.django_db
class TestOrders:
    def test_if_user_is_anon(self, anon):
        assert anon.get("/orders/").status_code == status.HTTP_401_UNAUTHORIZED

    def test_if_user_is_authenticated(self, user_client):
        assert user_client.get("/orders/").status_code == status.HTTP_200_OK

    def test_checkout_turns_cart_into_order_and_reduces_stock(self, user_client):
        product = baker.make(Products, price=1000, stock_quantity=5)
        cart = baker.make(Carts)
        baker.make(CartItems, cart_id=cart, product_id=product, quantity=2)
        r = user_client.post("/orders/", {"cart_id": str(cart.id)}, format="json")
        assert r.status_code == status.HTTP_201_CREATED, r.data
        assert r.data["status"] == "P" and float(r.data["total"]) == 2000
        product.refresh_from_db()
        assert product.stock_quantity == 3
        assert not Carts.objects.filter(pk=cart.pk).exists()

    def test_users_only_see_their_own_orders(self, user_client):
        mine = baker.make(Orders, customerid=user_client.user.Customer)
        baker.make(Orders, customerid=baker.make(Users).Customer)
        ids = [o["id"] for o in user_client.get("/orders/").data]
        assert ids == [mine.id]

    def test_users_cannot_change_order_status(self, user_client):
        mine = baker.make(Orders, customerid=user_client.user.Customer)
        r = user_client.patch(f"/orders/{mine.id}/", {"status": "C"}, format="json")
        assert r.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
        mine.refresh_from_db()
        assert mine.status == "P"
