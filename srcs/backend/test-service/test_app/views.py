from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializer import UserSerializer

# api_view is a decorator that takes a list of allowed methods as an argument.
# if the method is not allowed,a 405 METHOD NOT ALLOWED response is returned by default.
# In this case, we are allowing only GET requests.
# if the request is a GET request, we get all the users from the database and serialize them using the UserSerializer.
# The serialized data is then returned as a response.
@api_view(['GET'])
def get_users(request):
	users = User.objects.all()
	serializer = UserSerializer(users, many = True )
	return Response(serializer.data)

# If the request is a POST request, we serialize the request data using the UserSerializer.
# If the serializer is valid, we save the data and return the serialized data as a response, along with a 201 CREATED status code.
# If the serializer is not valid, we return a 400 BAD REQUEST response with the errors.
@api_view(['POST'])
def post_user(request):
	serializer = UserSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		return Response(serializer.data, status = status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# We define a user_detail view that takes a primary key as an argument.
# We try to get the user with the given primary key from the database.
# If the user does not exist, we return a 404 NOT FOUND response.
# If the request is a GET request, we get the user with the given primary key from the database.
# If the request is a PUT request, we serialize the request data using the UserSerializer.
# If the serializer is valid, we save the data and return the serialized data as a response.
# if the serializer is not valid, we return a 400 BAD REQUEST response with the errors.
# If the request is a DELETE request, we delete the user with the given primary key from the database and return a 204 NO CONTENT response.
@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, pk):
	try:
		user = User.objects.get(pk=pk)
	except User.DoesNotExist:
		return Response(status=status.HTTP_404_NOT_FOUND)
	if request.method == 'GET':
		serializer = UserSerializer(user)
		return Response(serializer.data)
	elif request.method == 'PUT':
		serializer = UserSerializer(user, data = request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		else:
			return Response(serializer.errors, status= status.HTTP_400_BAD_REQUEST)
	elif request.method == 'DELETE':
		user.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)
