from rest_framework import serializers
from .models import Products,Review,Orders,OrderItems,Carts,CartItems,Category,ProductsImage

class CategorySerializer(serializers.ModelSerializer):
   product=serializers.StringRelatedField(read_only=True,many=True)
   class Meta:
     model=Category
     fields=['title','product']

class ProductsImageSerializer(serializers.ModelSerializer):
                                                                                                
    class Meta:
      model=ProductsImage
      fields=['id','image']  #remove product

    def create(self, validated_data):
        product_id= self.context['product_id']
        return ProductsImage.objects.create(product_id_id=product_id, **validated_data)

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

    class Meta:
        model = Orders
        fields = ['id', 'customerid', 'status']
    

class CartItemProductSerializers(serializers.ModelSerializer):
   class Meta:
      model=Products
      fields=['name', 'price']

class CartItemsSerializer(serializers.ModelSerializer):
    product_id=CartItemProductSerializers(read_only=True)
    class Meta:
        model=CartItems
        fields=['id', 'cart_id','product_id', 'quantity']


class CartsSerializer(serializers.ModelSerializer):
    id=serializers.UUIDField(read_only=True)
    items=CartItemsSerializer(many=True, read_only=True)
    class Meta:
        model=Carts
        fields=['id','items']
        


