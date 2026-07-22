from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Users , Customers

@receiver(post_save, sender=Users)
def create_customer_after_user_registration(sender , **kwargs):
    if kwargs['created']:
        Customers.objects.create(user_id=kwargs['instance'])