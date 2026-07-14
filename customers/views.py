from rest_framework.viewsets import ModelViewSet
from .models import Customers
from .serializers import CustomersSerializer


class CustomersViewSet(ModelViewSet):
  queryset = Customers.objects.all()
  serializer_class = CustomersSerializer

  