from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.viewsets import ModelViewSet,GenericViewSet
from rest_framework.mixins import CreateModelMixin,ListModelMixin,RetrieveModelMixin
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Prefetch
from rest_framework import status
from rest_framework.response import Response
from .models import Products,Review,Orders,OrderItems,Carts,CartItems,Category,ProductsImage
from .serializers import ProductsSerializer,ReviewSerializer,OrdersSerializer,OrderItemsSerializer,CartsSerializer,CartItemsSerializer,CategorySerializer,ProductsImageSerializer,CreateOrderSerializer
from customers.models import Customers
from .filters import ProductFilters, ReviewFilters
from .pagination import defaultPagination
from .permissions import IsAdminOrReadOnly, IsAdminOrCreateOnly

#For category

class CategoryViewSet(ModelViewSet):
    permission_classes=[IsAdminOrReadOnly]
    queryset=Category.objects.prefetch_related("product").all()
    serializer_class=CategorySerializer


#For products
class ProductsViewSet(ModelViewSet):
    queryset = Products.objects.select_related("category_id").prefetch_related("images","product_review").order_by("id")

    serializer_class = ProductsSerializer
    permission_classes=[IsAdminOrReadOnly]
    filter_backends=[DjangoFilterBackend,OrderingFilter,SearchFilter]
    filterset_class=ProductFilters
    pagination_class=defaultPagination
    ordering_fields=['price']
    search_fields=['name','descprition']

    #For ProductsImage

class ProductsImageViewSet(ModelViewSet):
    permission_classes=[IsAdminOrReadOnly]
    serializer_class=ProductsImageSerializer
    queryset=ProductsImage.objects.all()
    def get_queryset(self):
        return ProductsImage.objects.filter(product_id=self.kwargs['products_pk'])

    def get_serializer_context(self):
        return {'product_id': self.kwargs['products_pk']}

#for Reviews

class ReviewViewSet(ModelViewSet):
    permission_classes=[IsAdminOrCreateOnly]  # anyone can read/post a review; only staff edit or delete
    #queryset = Review.objects.prefetch_related('product_id').all()
    serializer_class=ReviewSerializer
    filter_backends=[DjangoFilterBackend]
    filterset_class=ReviewFilters


    def get_queryset(self):
        return Review.objects.filter(product_id=self.kwargs['products_pk'])
    def get_serializer_context(self):#
        return {'product_id':self.kwargs['products_pk']}
    

#for Orders
class OrdersViewSet(CreateModelMixin,ListModelMixin,RetrieveModelMixin,GenericViewSet):
    """Customers can place and read their own orders. Status changes are done by staff in the admin."""
    permission_classes=[IsAuthenticated]
    def get_queryset(self):
        qs = Orders.objects.prefetch_related("items").order_by("-created_at")
        user = self.request.user
        return qs if user.is_staff else qs.filter(customerid__user_id=user)
    def get_serializer_class(self):
        if self.action == "create":
            return CreateOrderSerializer
        return OrdersSerializer
    def get_serializer_context(self):
        return {"user_id":self.request.user.id}
    def create(self,request, *args, **kwargs):
        serializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)
        order = serializer.save()
        return Response(OrdersSerializer(order).data,status = status.HTTP_201_CREATED)
#for orderitems (read only, and only for the caller's own orders)
class  OrderItemsViewSet(ListModelMixin,RetrieveModelMixin,GenericViewSet):
    permission_classes=[IsAuthenticated]
    serializer_class=OrderItemsSerializer
    def get_queryset(self):
        qs = OrderItems.objects.filter(orderid=self.kwargs['orders_pk'])
        user = self.request.user
        return qs if user.is_staff else qs.filter(orderid__customerid__user_id=user)

#for carts
def _get_cart_or_404(pk):
    try:
        return Carts.objects.get(pk=pk)
    except (Carts.DoesNotExist, DjangoValidationError, ValueError):
        raise NotFound("Cart not found.")

class CartsViewSet(CreateModelMixin,RetrieveModelMixin,GenericViewSet):
    # No list endpoint: a cart is only reachable by whoever knows its id.
    queryset=Carts.objects.prefetch_related(
        Prefetch("items", queryset=CartItems.objects.select_related("product_id").prefetch_related("product_id__images").order_by("id"))
    )
    serializer_class=CartsSerializer

#for CartItems  (/carts/<cart_id>/cartitems/)
class CartItemsViewSet(ModelViewSet):
    serializer_class=CartItemsSerializer
    http_method_names=['get','post','patch','delete','head','options']

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        self.cart = _get_cart_or_404(self.kwargs['carts_pk'])

    def get_queryset(self):
        return CartItems.objects.filter(cart_id=self.kwargs['carts_pk']).select_related('product_id').prefetch_related('product_id__images').order_by('id')

    def get_serializer_context(self):
        return {**super().get_serializer_context(), 'cart_id': self.kwargs['carts_pk']}

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        # Re-adding a product already in the cart increases its quantity (see CartItemsSerializer.create)
        return Response(self.get_serializer(item).data, status=status.HTTP_201_CREATED)
