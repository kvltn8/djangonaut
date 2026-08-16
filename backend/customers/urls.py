#create routes to customers endpoints 
from django.urls import path,include
from rest_framework.routers import SimpleRouter
from . import views

router = SimpleRouter()
router.register('customers', views.CustomersViewSet,basename='customers')

urlpatterns=[
  path('', include(router.urls))
]