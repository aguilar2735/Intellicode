from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, ModuleViewSet, LessonViewSet,
    ActivityViewSet, SubmissionViewSet, CourseCertificateViewSet
)

router = DefaultRouter()
router.register(r'', CourseViewSet, basename='course')
router.register(r'modules', ModuleViewSet, basename='module')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'certificates', CourseCertificateViewSet, basename='certificate')

urlpatterns = router.urls
