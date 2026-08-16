from rest_framework.viewsets import ModelViewSet
from .models import Customers
from .serializers import CustomersSerializer


class CustomersViewSet(ModelViewSet):
  serializer_class = CustomersSerializer
  def get_queryset(self):
    return Customers.objects.filter(user_id=self.request.user)

  