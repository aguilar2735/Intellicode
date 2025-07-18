from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, default_avatar

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'email',
            'first_name',
            'last_name',
            'student_number',
            'password',
            'confirm_password'
        )

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        if 'first_name' in attrs:
            attrs['first_name'] = attrs['first_name'].title()
        if 'last_name' in attrs:
            attrs['last_name'] = attrs['last_name'].title()
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            student_number=validated_data['student_number'],
            password=validated_data['password'],
        )
        return user


from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    new_password = serializers.CharField(
        write_only=True, required=False, validators=[validate_password]
    )
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'student_number',
            'profile_picture',
            'role',
            'new_password',
            'confirm_password',
        ]
        read_only_fields = ['username', 'role']

    def get_role(self, obj):
        return obj.role.capitalize() if obj.role else None

    def validate(self, attrs):
        # Capitalize names
        if 'first_name' in attrs:
            attrs['first_name'] = attrs['first_name'].title()
        if 'last_name' in attrs:
            attrs['last_name'] = attrs['last_name'].title()

        # Password match check
        if attrs.get('new_password') or attrs.get('confirm_password'):
            if attrs.get('new_password') != attrs.get('confirm_password'):
                raise serializers.ValidationError({"password": "Passwords do not match."})

        return attrs

    def update(self, instance, validated_data):
        # Handle password
        new_password = validated_data.pop('new_password', None)
        validated_data.pop('confirm_password', None)

        # Handle profile picture change or removal
        if 'profile_picture' in validated_data:
            new_picture = validated_data.pop('profile_picture')

            # If profile picture is set to null, remove it
            if new_picture is None:
                if instance.profile_picture and instance.profile_picture.name != "default.png":
                    instance.profile_picture.delete(save=False)
                instance.profile_picture = "default.png"

            else:
                # Replace old file only if changed
                if instance.profile_picture != new_picture:
                    if instance.profile_picture and instance.profile_picture.name != "default.png":
                        instance.profile_picture.delete(save=False)
                    instance.profile_picture = new_picture

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Apply new password if present
        if new_password:
            instance.set_password(new_password)

        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        user = self.context['request'].user

        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({"old_password": "Incorrect old password."})

        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({"new_password": "New password must be different from the old password."})

        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        return attrs

