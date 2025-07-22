from rest_framework import viewsets
from .models import Course, Module, Lesson, Activity, Submission, CourseCertificate
from .serializers import (
    CourseSerializer, ModuleSerializer, LessonSerializer,
    ActivitySerializer, SubmissionSerializer, CourseCertificateSerializer, CourseReadSerializer
)
from .permissions import IsInstructor, IsStudent, IsAdmin
from rest_framework.permissions import IsAuthenticated

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Course
from .serializers import CourseSerializer, CourseReadSerializer
from .permissions import IsInstructor, IsAdmin  # assuming you already have these

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()

    def get_serializer_class(self):
        # Use nested serializer for reading (retrieve/list), basic one for write
        if self.action in ['retrieve', 'list']:
            return CourseReadSerializer
        return CourseSerializer

    def get_queryset(self):
        user = self.request.user

        if not user or not user.is_authenticated:
            return Course.objects.none()

        if user.is_staff:
            return Course.objects.all()

        if hasattr(user, "role") and user.role == 'instructor':
            return Course.objects.filter(creator=user)

        return Course.objects.filter(is_approved=True)

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsInstructor()]
        elif self.action == 'approve_course':
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        course = serializer.save(creator=self.request.user)
        course.instructors.add(self.request.user)

    # Optional: override update for better error clarity (uses serializer.update logic)
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)



class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated]

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

class CourseCertificateViewSet(viewsets.ModelViewSet):
    queryset = CourseCertificate.objects.all()
    serializer_class = CourseCertificateSerializer
    permission_classes = [IsAuthenticated]
