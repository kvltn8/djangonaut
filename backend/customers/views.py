from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.permissions import IsAuthenticated
from .models import Customers
from .serializers import CustomersSerializer


class CustomersViewSet(ListModelMixin, RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
  """A customer profile is created automatically at sign-up (see signals.py);
  the logged-in user can read and update only their own."""
  serializer_class = CustomersSerializer
  permission_classes = [IsAuthenticated]

  def get_queryset(self):
    return Customers.objects.filter(user_id=self.request.user)
