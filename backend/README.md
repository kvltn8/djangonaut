# Kaltun's Abaya Shop 🛍️

A Django-based web application for managing products and customer reviews in an online abaya shop.  
This project is a **work in progress** as I learn Django step by step.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Pipenv (for environment management)
- Django (installed via Pipfile)

### Installation
```bash
git clone https://github.com/your-username/kaltunsAbayaShop.git
cd kaltunsAbayaShop
pipenv install
pipenv shell
python manage.py migrate
python manage.py runserver

📂 Project Structure

├── Pipfile
├── Pipfile.lock
├── README.md
├── db.sqlite3
├── manage.py
├── kaltunsAbayaShop/        # Main project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── product/                 # Product app
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── serializers.py
└── reviews/                 # Reviews app
    ├── models.py
    ├── views.py
    ├── urls.py
    └── serializers.py

✨ Current Features
• 	Product management (basic CRUD)
• 	Customer reviews system
• 	REST API with serializers
• 	SQLite database for development

🛠️ Work in Progress
• 	Add authentication for users
• 	Improve UI with templates or frontend framework
• 	Deployment guide (Heroku, PythonAnywhere, etc.)
• 	More tests and documentation

Acknowledgments
Thanks to my dear friend for teaching me Django and guiding me through this project!



