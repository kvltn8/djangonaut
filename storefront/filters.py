from django_filters.rest_framework import FilterSet
from .models import Products,Review

class ProductFilters(FilterSet):
    class Meta:
        model=Products
        fields={
            "name":['exact'],
            "price":['gte','lte']
        }
class ReviewFilters(FilterSet):
    class Meta:
        model=Review
        fields={
            "name":['exact']
        }