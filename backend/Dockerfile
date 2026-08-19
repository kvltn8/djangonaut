FROM python:3.10
WORKDIR /kaltunAbayaShop
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .   
#copies all other files into docker
ENV DATABASE_URL=postgresql://postgres.llakvyrimkoxekbsvhrz:xnT8P7xbvhSDdHSh@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
ENV SECRET_KEY=django-insecure-4cz-o0pt&^m@rgn1-5k&utkgjxyd*hr@%vzv4gm^nfhns8mjs
EXPOSE  8000
CMD ["python","manage.py", "runserver","0.0.0.0:8000"]

