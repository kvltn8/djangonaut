from django.db import models
from uuid import uuid4
from customers.models  import Customers


# Create your models here.

class Category(models.Model):
  title=models.CharField(max_length=100)
  def __str__(self):
    return self.title

class Products(models.Model):
  name =models.CharField(max_length=100)
  descprition = models.TextField()
  price= models.DecimalField(max_digits=5, decimal_places=0)
  stock_quantity=models.SmallIntegerField()
  created_at=models.DateTimeField(auto_now_add=True)
  updated_at=models.DateTimeField(auto_now=True)
  category_id=models.ForeignKey(Category, on_delete=models.PROTECT,related_name="product", null=True) 
  def __str__(self):
    return self.name
  
class ProductsImage(models.Model):
  product_id=models.ForeignKey(Products, on_delete=models.CASCADE, related_name="images")#reverse relationship(use pre fetch related)
  image=models.ImageField(upload_to="storefront/media")

class Review(models.Model):
  name = models.CharField(max_length=50)
  comment = models.TextField()
  created_at=models.DateTimeField(auto_now_add=True)
  product_id=models.ForeignKey(Products,on_delete=models.CASCADE,related_name="product_review")

  #foriegnkey is reference to the parent pk 

  #H/W - Order, order items , cart cart items

class Orders(models.Model):

  STATUS_PENDING = 'P'
  STATUS_FAILED = 'F'
  STATUS_APPROVED ='A'
  STATUS_COMPLETED ='C'

  STATUS_CHOICES ={
    (STATUS_PENDING,"Pending"),
    (STATUS_FAILED,"Failed"),
    (STATUS_APPROVED, "Approved"),
    (STATUS_COMPLETED, "Completed")
  } 
  customerid = models.ForeignKey(Customers,on_delete=models.CASCADE,related_name="order_history" )
  status=models.CharField(max_length=1, choices=STATUS_CHOICES,default=STATUS_PENDING) 

class OrderItems(models.Model):
  orderid=models.ForeignKey(Orders,on_delete=models.CASCADE, related_name="items")
  product_id=models.ForeignKey(Products,on_delete=models.CASCADE,related_name="product_ordered")
  quantity=models.SmallIntegerField()
  unitprice=models.DecimalField(max_digits=20,decimal_places=2)

class Carts(models.Model):
  id = models.UUIDField(primary_key=True, default=uuid4)
  created_at=models.DateTimeField(auto_now_add=True)


class CartItems(models.Model):
  cart_id=models.ForeignKey(Carts, on_delete=models.CASCADE,related_name="items")
  product_id=models.ForeignKey(Products,on_delete=models.CASCADE,related_name="cart_item")
  quantity=models.SmallIntegerField()
  class Meta: 
    unique_together=[['cart_id','product_id']]


  