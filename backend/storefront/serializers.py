from django.db import transaction
from rest_framework import serializers
from .models import Products,Review,Orders,OrderItems,Carts,CartItems,Category,ProductsImage
from .services import OrderService
from .storage import uploadproductimage

class CategorySerializer(serializers.ModelSerializer):
   product=serializers.StringRelatedField(read_only=True,many=True)
   class Meta:
     model=Category
     fields=['id','title','product']

class ProductsImageSerializer(serializers.ModelSerializer):
    upload = serializers.ImageField(write_only = True) 
    image = serializers.URLField(read_only = True)                                           
    class Meta:
      model=ProductsImage
      fields=['id','image','upload']  

    def create(self, validated_data):
        product_id= self.context['product_id']
        file =  validated_data.pop("upload")#stored in the bucket
        url = uploadproductimage(file)#stored in the tablein  supabase.
        return ProductsImage.objects.create(product_id_id=product_id, image = url)

class ProductsSerializer(serializers.ModelSerializer):
  #id=serializers.IntegerField(read_only=True)
  images=ProductsImageSerializer(many=True , read_only=True)
  class Meta:
    model = Products
    fields=['id','category_id','name','descprition', 'price','stock_quantity','images']


class ReviewSerializer(serializers.ModelSerializer):
    #product_id=serializers.BigIntegerField()
    class Meta:
      model=Review
      fields=['id','name','comment']

    def create(self, validated_data):#overiding create method
      product_id =self.context['product_id']
      #Product = Products.objects.get(pk=product_id)
      return Review.objects.create(product_id_id= product_id, **validated_data)

class OrderItemsSerializer(serializers.ModelSerializer):
    totalAmount = serializers.SerializerMethodField()
    class Meta:
        model=OrderItems
        fields=['id','product_id','quantity','unitprice','totalAmount']
    def get_totalAmount(self, obj):
        return obj.quantity * obj.unitprice
    def create(self,validated_data):
       order=self.context['order_id']
       return OrderItems.objects.create(orderid=order, **validated_data)
        
class OrdersSerializer(serializers.ModelSerializer):
    customerid = serializers.StringRelatedField(read_only=True)
    items = OrderItemsSerializer(many = True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Orders
        fields = ['id', 'customerid', 'status', 'items', 'total']
    def get_total(self, obj):
        return sum(item.quantity * item.unitprice for item in obj.items.all())
    # view and calculate totals

class CreateOrderSerializer(serializers.Serializer):#Function in services.py to create an  order
    cart_id = serializers.UUIDField()
    def save(self, **kwargs):
        order = OrderService.create_order(
            user_id = self.context['user_id'],
            cart_id = self.validated_data['cart_id'],
        )
        self.instance =order
        return order
class CartItemProductSerializers(serializers.ModelSerializer):
   class Meta:
      model=Products
      fields=['name', 'price', 'image']

class CartItemsSerializer(serializers.ModelSerializer):
    product=CartItemProductSerializers(source="product_id",read_only=True)
    class Meta:
        model=CartItems
        fields=['id', 'cart_id','product_id','product','quantity']
        extra_kwargs = {
            "product_id": {"write_only":True}
        }

class CartsSerializer(serializers.ModelSerializer):
    id=serializers.UUIDField(read_only=True)
    items=CartItemsSerializer(many=True, read_only=True)
    class Meta:
        model=Carts
        fields=['id','items']
        


