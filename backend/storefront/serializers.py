from django.db import transaction
from rest_framework import serializers
from .models import Products,Review,Orders,OrderItems,Carts,CartItems,Category,ProductsImage
from .services import OrderService
from .storage import ImageUploadError, uploadproductimage

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
        try:
            url = uploadproductimage(file)#stored in the tablein  supabase.
        except ImageUploadError as exc:
            raise serializers.ValidationError({"upload": str(exc)})
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
      extra_kwargs={'comment': {'max_length': 1000}}

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
    image = serializers.SerializerMethodField()

    class Meta:
        model=Products
        fields=['id','name','price','stock_quantity','image']

    def get_image(self, obj):
        # `images` is prefetched by the view, so use .all() (no extra query).
        images = list(obj.images.all())
        return images[0].image if images else None


class CartItemsSerializer(serializers.ModelSerializer):
    product=CartItemProductSerializers(source="product_id",read_only=True)

    class Meta:
        model=CartItems
        fields=['id', 'cart_id','product_id','product','quantity']
        read_only_fields=['cart_id']
        extra_kwargs = {
            "product_id": {"write_only":True},
            "quantity": {"min_value": 1},
        }
        # The cart comes from the URL (/carts/<id>/cartitems/), and adding a
        # product that is already in the cart increases its quantity, so the
        # default unique-together validator must not run.
        validators = []

    def validate(self, attrs):
        if self.instance is not None:
            product = self.instance.product_id
            quantity = attrs.get('quantity', self.instance.quantity)
            already = 0
        else:
            product = attrs['product_id']
            quantity = attrs['quantity']
            already = CartItems.objects.filter(
                cart_id=self.context['cart_id'], product_id=product
            ).values_list('quantity', flat=True).first() or 0

        if product.stock_quantity < 1:
            raise serializers.ValidationError(f"{product.name} is sold out.")
        if already + quantity > product.stock_quantity:
            raise serializers.ValidationError(f"Only {product.stock_quantity} of {product.name} left in stock.")
        return attrs

    def create(self, validated_data):
        cart_id = self.context['cart_id']
        product = validated_data['product_id']
        quantity = validated_data['quantity']
        item, created = CartItems.objects.get_or_create(
            cart_id_id=cart_id, product_id=product, defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save(update_fields=['quantity'])
        return item

    def update(self, instance, validated_data):
        # Only the quantity can change; to swap products, remove and re-add.
        instance.quantity = validated_data.get('quantity', instance.quantity)
        instance.save(update_fields=['quantity'])
        return instance

class CartsSerializer(serializers.ModelSerializer):
    id=serializers.UUIDField(read_only=True)
    items=CartItemsSerializer(many=True, read_only=True)
    class Meta:
        model=Carts
        fields=['id','items']
