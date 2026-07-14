from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.viewsets import ModelViewSet,GenericViewSet
from rest_framework.mixins import CreateModelMixin,ListModelMixin,RetrieveModelMixin
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from .models import Products,Review,Orders,OrderItems,Carts,CartItems,Category,ProductsImage
from .serializers import ProductsSerializer,ReviewSerializer,OrdersSerializer,OrderItemsSerializer,CartsSerializer,CartItemsSerializer,CategorySerializer,ProductsImageSerializer
from customers.models import Customers
from .filters import ProductFilters, ReviewFilters
from .pagination import defaultPagination

#For category

class CategoryViewSet(ModelViewSet):
    queryset=Category.objects.prefetch_related("product").all()
    serializer_class=CategorySerializer


#For products
class ProductsViewSet(ModelViewSet):
    queryset = Products.objects.select_related("category_id").prefetch_related("images","product_review").all()

    serializer_class = ProductsSerializer
    filter_backends=[DjangoFilterBackend,OrderingFilter]
    filterset_class=ProductFilters
    pagination_class=defaultPagination
    ordering_fields=['price']

    #For ProductsImage

class ProductsImageViewSet(ModelViewSet):
    serializer_class=ProductsImageSerializer
    queryset=ProductsImage.objects.all()
    def get_queryset(self):
        return ProductsImage.objects.filter(product_id=self.kwargs['products_pk'])

    def get_serializer_context(self):
        return {'product_id': self.kwargs['products_pk']}

#for Reviews

class ReviewViewSet(ModelViewSet):
    #queryset = Review.objects.prefetch_related('product_id').all()
    serializer_class=ReviewSerializer
    filter_backends=[DjangoFilterBackend]
    filterset_class=ReviewFilters


    def get_queryset(self):
        return Review.objects.filter(product_id=self.kwargs['products_pk'])
    def get_serializer_context(self):#
        return {'product_id':self.kwargs['products_pk']}
    

#for Orders
class OrdersViewSet(ModelViewSet):
    queryset=Orders.objects.all()
    serializer_class=OrdersSerializer
    permission_classes=[IsAuthenticated]
    def perform_create(self, serializer):
        customer = Customers.objects.get(user_id=self.request.user)
        serializer.save(customerid=customer) 
#for orderitems
class  OrderItemsViewSet(ModelViewSet):
    serializer_class=OrderItemsSerializer
    queryset=OrderItems.objects.all()
    def get_serializer_context(self):
        return{'order_id':self.kwargs['orders_pk']}
    def get_queryset(self):
        return OrderItems.objects.filter(orderid=self.kwargs['orders_pk'])
#for orderitems
#for carts
class CartsViewSet(CreateModelMixin,GenericViewSet,ListModelMixin,RetrieveModelMixin):
    queryset=Carts.objects.all()
    serializer_class=CartsSerializer

#for CartItems
class CartItemsViewSet(ModelViewSet):
    queryset=CartItems.objects.prefetch_related('cart_id','product_id').all()
    serializer_class=CartItemsSerializer

