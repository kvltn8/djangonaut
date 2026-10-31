import pytest
from model_bakery import baker
from rest_framework.test import APIClient

from customers.models import Users


@pytest.fixture
def anon():
    return APIClient()


@pytest.fixture
def staff_client():
    client = APIClient()
    client.force_authenticate(user=baker.make(Users, is_staff=True))
    return client


@pytest.fixture
def user_client():
    user = baker.make(Users)  # a Customers row is created by the post_save signal
    client = APIClient()
    client.force_authenticate(user=user)
    client.user = user
    return client
