#!/bin/sh
set -e

echo "Running migrations......"
python manage.py migrate --noinput

echo "collecting static files....."
python manage.py collectstatic --noinput

echo "starting gunicorn......"
exec gunicorn kaltunsAbayaShop.wsgi:application --bind 0.0.0.0:$PORT