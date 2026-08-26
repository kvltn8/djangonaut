FROM python:3.10
WORKDIR /kaltunsAbayaShop
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .   
#copies all other files into docker
ENV PORT=8000 
EXPOSE  8000
CMD gunicorn kaltunsAbayaShop.wsgi:application --bind 0.0.0.0:$PORT

