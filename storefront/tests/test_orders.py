import pytest 
from rest_framework.test import APIClient
from rest_framework import status

from model_bakery import baker
from customers.models import Users,Customers
from storefront.models import Orders


@pytest.mark.django_db
class TestOrders:
  def test_if_user_is_anon(self):
    client = APIClient()
    response = client.get("/orders/")#this is act
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

  def test_if_user_is_authenticated(self):
    user = baker.make(Users)
    client = APIClient()
    client.force_authenticate(user=user)#simulating logged in user.
    response = client.get("/orders/")
    assert response.status_code == status.HTTP_200_OK

  def test_if_data_is_valid(self):
    user = baker.make(Users)
    customer = baker.make(Customers, user_id=user)
    order = {
      "customerid": customer.id,
      "status": "C",
    }
    client = APIClient()
    client.force_authenticate(user= user)
    response = client.post("/orders/",order)
    assert response.status_code == status.HTTP_201_CREATED
