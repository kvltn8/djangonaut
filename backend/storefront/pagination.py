from rest_framework.pagination import PageNumberPagination

class defaultPagination(PageNumberPagination):
  page_size=10