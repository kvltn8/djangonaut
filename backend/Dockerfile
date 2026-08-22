FROM python:3.10
WORKDIR /kaltunAbayaShop
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .   
#copies all other files into docker
EXPOSE  8000
CMD ["python","manage.py", "runserver","0.0.0.0:8000"]

