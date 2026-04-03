from rest_framework.decorators import api_view#defines the methods
from rest_framework.response import Response#sends back the response
from  rest_framework import status#deals with status codes such as 404,200,500
from .models import Review
from .serializers import ReviewSerializer


@api_view(['GET', 'POST'])#Specify the request u want.
def getReviews(request):
    if request.method == 'GET':
        reviews = Review.objects.all() # went to the db and got all the reviews available
        serializer = ReviewSerializer(reviews, many=True) # filters exactly what we need based on our serializer
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status= status.HTTP_201_CREATED)


