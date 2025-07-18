from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import os
from django.dispatch import receiver
from django.db.models.signals import pre_save
from django.conf import settings


def default_avatar():
    return 'default.png'  # Stored directly in media/


class UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, student_number, password=None):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            student_number=student_number,
            username=email.split('@')[0],  # Auto-generate username
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, student_number, password):
        user = self.create_user(email, first_name, last_name, student_number, password)
        user.is_staff = True
        user.is_superuser = True
        user.role = 'admin'
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('instructor', 'Instructor'),
        ('student', 'Student'),
    )

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    student_number = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')

    profile_picture = models.ImageField(
        upload_to="profile_pics/",
        default=default_avatar,
        blank=True
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'student_number']

    objects = UserManager()

    def save(self, *args, **kwargs):
        if self.first_name:
            self.first_name = self.first_name.title()
        if self.last_name:
            self.last_name = self.last_name.title()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


# ✅ SIGNALS

@receiver(pre_save, sender=User)
def delete_old_profile_picture(sender, instance, **kwargs):
    """Delete old profile picture from storage if it's being changed."""
    if not instance.pk:
        return

    try:
        old_user = User.objects.get(pk=instance.pk)
    except User.DoesNotExist:
        return

    old_pic = old_user.profile_picture
    new_pic = instance.profile_picture

    if old_pic and old_pic != new_pic and old_pic.name != 'default.png':
        old_path = os.path.join(settings.MEDIA_ROOT, old_pic.name)
        if os.path.exists(old_path):
            os.remove(old_path)
