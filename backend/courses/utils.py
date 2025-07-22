# courses/utils.py
from .models import LessonProgress, CourseCertificate

def check_course_completion(user, course):
    total_lessons = course.lessons.count()
    completed_lessons = LessonProgress.objects.filter(
        student=user, lesson__module__course=course, completed=True
    ).count()

    if total_lessons > 0 and total_lessons == completed_lessons:
        # Check if certificate already issued
        cert_exists = CourseCertificate.objects.filter(user=user, course=course).exists()
        if not cert_exists:
            CourseCertificate.objects.create(user=user, course=course)
            return True  # Certificate issued
    return False
