from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view#defines the methods
from rest_framework.response import Response#sends back the response
from  rest_framework import status#deals with status codes such as 404,200,500
from .models import Product
from .serializers import ProductSerializer


@api_view(['GET', 'POST'])
def Productlist(request):
  if request.method == 'GET':
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True) 
    return Response(serializer.data, status=status.HTTP_200_OK) #serializing
  elif request.method == 'POST':
    serializer = ProductSerializer(data = request.data)#deserializing
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status= status.HTTP_201_CREATED) #deserializing
  
#PATCH -> takes partial data.
@api_view(['GET', 'PATCH', 'DELETE'])
def product_details(request,pk):
  item = get_object_or_404(Product,pk=pk)
  
  if request.method == 'GET':
    serializer =ProductSerializer(item)
    return Response(serializer.data, status=status.HTTP_200_OK) #serializing
  elif request.method == 'PATCH':#takes all the data
    serializer = ProductSerializer(item, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)
  elif request.method == 'DELETE':
    item.delete() 
    return Response({"Message":"this is content is not available"},status= status.HTTP_204_NO_CONTENT)

