import pytest
from rest_framework.test import APIClient
from rest_framework import status


from model_bakery  import baker
from storefront.models  import Products, Category



@pytest.mark.django_db
class TestProducts:
 def test_list_products(self):
    client = APIClient()
    response = client.get("/products/")
    
    assert response.status_code == status.HTTP_200_OK
 def test_product_creation(self):
   category = baker.make(Category)
   products = {
        "name": "Laptop",
        "descprition": "Gaming laptop",
       "price": 1200,
        "stock_quantity": 20,
        "category_id": category.id,
    }
   client = APIClient()
   response = client.post("/products/",products, format="json")
   print(response.data)
   assert response.status_code == status.HTTP_201_CREATED
 def test_if_data_is_invalid(self):
   #products = baker. make(Products)
   products = {
     "title": "Laptop"
   }
   client = APIClient()
   response = client.post("/products/", products, format="json")
   assert response.status_code == status.HTTP_400_BAD_REQUEST


