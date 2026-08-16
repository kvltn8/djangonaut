from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Users, Customers

@admin.register(Users)
class UsersAdmin(UserAdmin):
    list_display = ["username", "email", "first_name", "last_name"]
    


@admin.register(Customers)
class CustomersAdmin(admin.ModelAdmin):
    list_display = ["user_id","city", 'country', "phone_number", "delivery_address"]
    list_select_related = ["user_id"]
 
   