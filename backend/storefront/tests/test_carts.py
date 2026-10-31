import pytest
from model_bakery import baker
from rest_framework import status

from storefront.models import CartItems, Carts, ProductsImage, Products


@pytest.fixture
def product():
    p = baker.make(Products, name="Linen Abaya", price=9500, stock_quantity=5)
    baker.make(ProductsImage, product_id=p, image="https://cdn.example/a.jpg")
    return p


@pytest.fixture
def cart(anon):
    return anon.post("/carts/", {}, format="json").data["id"]


@pytest.mark.django_db
class TestCarts:
    def test_create_cart(self, anon):
        r = anon.post("/carts/", {}, format="json")
        assert r.status_code == status.HTTP_201_CREATED and r.data["items"] == []

    def test_carts_cannot_be_listed(self, anon, cart):
        assert anon.get("/carts/").status_code == status.HTTP_405_METHOD_NOT_ALLOWED

    def test_add_item_returns_product_image_and_stock(self, anon, cart, product):
        r = anon.post(f"/carts/{cart}/cartitems/", {"product_id": product.id, "quantity": 2}, format="json")
        assert r.status_code == status.HTTP_201_CREATED, r.data
        got = anon.get(f"/carts/{cart}/").data["items"][0]
        assert got["quantity"] == 2
        assert got["product"]["image"] == "https://cdn.example/a.jpg"
        assert got["product"]["stock_quantity"] == 5

    def test_adding_same_product_twice_merges_instead_of_erroring(self, anon, cart, product):
        for _ in range(2):
            r = anon.post(f"/carts/{cart}/cartitems/", {"product_id": product.id, "quantity": 1}, format="json")
            assert r.status_code == status.HTTP_201_CREATED, r.data
        items = CartItems.objects.filter(cart_id=cart)
        assert items.count() == 1 and items.first().quantity == 2

    def test_cannot_exceed_stock(self, anon, cart, product):
        anon.post(f"/carts/{cart}/cartitems/", {"product_id": product.id, "quantity": 4}, format="json")
        r = anon.post(f"/carts/{cart}/cartitems/", {"product_id": product.id, "quantity": 2}, format="json")
        assert r.status_code == status.HTTP_400_BAD_REQUEST
        assert "left in stock" in str(r.data)

    def test_rejects_zero_quantity_and_sold_out(self, anon, cart, product):
        assert anon.post(f"/carts/{cart}/cartitems/", {"product_id": product.id, "quantity": 0}, format="json").status_code == 400
        sold_out = baker.make(Products, stock_quantity=0, price=1)
        assert anon.post(f"/carts/{cart}/cartitems/", {"product_id": sold_out.id, "quantity": 1}, format="json").status_code == 400

    def test_update_and_delete_item(self, anon, cart, product):
        item = anon.post(f"/carts/{cart}/cartitems/", {"product_id": product.id, "quantity": 1}, format="json").data
        r = anon.patch(f"/carts/{cart}/cartitems/{item['id']}/", {"quantity": 3}, format="json")
        assert r.status_code == 200 and r.data["quantity"] == 3
        assert anon.patch(f"/carts/{cart}/cartitems/{item['id']}/", {"quantity": 99}, format="json").status_code == 400
        assert anon.delete(f"/carts/{cart}/cartitems/{item['id']}/").status_code == 204

    def test_items_are_scoped_to_their_cart(self, anon, cart, product):
        other = anon.post("/carts/", {}, format="json").data["id"]
        item = anon.post(f"/carts/{cart}/cartitems/", {"product_id": product.id, "quantity": 1}, format="json").data
        assert anon.get(f"/carts/{other}/cartitems/").data == []
        assert anon.delete(f"/carts/{other}/cartitems/{item['id']}/").status_code == 404

    def test_unknown_or_malformed_cart_is_404(self, anon, product):
        for bad in ("00000000-0000-0000-0000-000000000000", "not-a-uuid"):
            r = anon.post(f"/carts/{bad}/cartitems/", {"product_id": product.id, "quantity": 1}, format="json")
            assert r.status_code == 404
