#!/bin/sh
set -e

echo "Running migrations......"
python manage.py migrate --noinput

echo "collecting static files....."
python manage.py collectstatic --noinput

echo "creatingsuperuser...."
python manage.py shell <<'PY'
import os
from django.contrib.auth import get_user_model
User = get_user_model
username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
if  username and email and password:
  if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(
      username=username, email=email, password=password,
    )
    print("superusercreated successfully")
  else:
    print("superuser already exists")
else:
  print("You must have username,email & password to create a superuser")
PY

echo "starting gunicorn......"
exec gunicorn kaltunsAbayaShop.wsgi:application --bind 0.0.0.0:$PORT