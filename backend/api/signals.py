import os
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
from django.conf import settings
from .models import User

@receiver(pre_save, sender=User)
def delete_old_profile_picture_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return  # New user, nothing to delete

    try:
        old_picture = User.objects.get(pk=instance.pk).profile_picture
    except User.DoesNotExist:
        return

    new_picture = instance.profile_picture
    default_path = 'default.png'

    if old_picture and old_picture.name != default_path:
        if old_picture != new_picture:
            old_path = os.path.join(settings.MEDIA_ROOT, old_picture.name)
            if os.path.isfile(old_path):
                os.remove(old_path)

@receiver(post_delete, sender=User)
def delete_profile_picture_on_delete(sender, instance, **kwargs):
    picture = instance.profile_picture
    default_path = 'default.png'
    if picture and picture.name != default_path:
        pic_path = os.path.join(settings.MEDIA_ROOT, picture.name)
        if os.path.isfile(pic_path):
            os.remove(pic_path)
