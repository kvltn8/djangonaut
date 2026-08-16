from django.urls import path, include
from rest_framework.routers  import SimpleRouter
from rest_framework_nested.routers import NestedDefaultRouter
from . import views


router = SimpleRouter()
router.register('products', views.ProductsViewSet, basename='products')
products_routers=NestedDefaultRouter(router,'products', lookup='products') 
products_routers.register('review', views.ReviewViewSet, basename='reviews')
products_routers.register('images',views.ProductsImageViewSet, basename='images')
router.register('orders', views.OrdersViewSet, basename='orders')

orders_routers=NestedDefaultRouter(router,'orders', lookup='orders' )
orders_routers.register('orderitems', views.OrderItemsViewSet, basename='orderitems')
router.register('carts', views.CartsViewSet, basename='carts')
carts_routers=NestedDefaultRouter(router,'carts', lookup='carts' )
carts_routers.register('cartitems', views.CartItemsViewSet, basename='cartitems')
router.register('category', views.CategoryViewSet, basename='category')
urlpatterns=[
  path('', include(router.urls)),
  path('', include(products_routers.urls)),
  path('', include(carts_routers.urls)),
  path('',include(orders_routers.urls))
] 


