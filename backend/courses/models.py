from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone

# Create your models here.

class Course(models.Model):
    SUBMISSION_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=200)
    course_code = models.CharField(max_length=20, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    category = models.CharField(max_length=100)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_courses'
    )
    instructors = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='courses_taught',
        blank=True
    )
    students = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='courses_enrolled',
        blank=True
    )

    is_approved = models.BooleanField(default=False)  # Optional, can be kept for compatibility
    submission_status = models.CharField(
        max_length=20, choices=SUBMISSION_CHOICES, default='draft'
    )
    feedback = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            num = 1
            while Course.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{num}"
                num += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.course_code} - {self.title}"


# ========== MODULE MODEL ==========
class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} ({self.course.title})"


# ========== LESSON MODEL ==========
class Lesson(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    content = models.TextField()
    order = models.PositiveIntegerField(default=0)

    has_quiz = models.BooleanField(default=False)
    has_activity = models.BooleanField(default=False)
    has_code_sandbox = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} - {self.module.title}"


# ========== LESSON PROGRESS MODEL ==========
class LessonProgress(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lesson_progress")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progress")
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('student', 'lesson')

    def save(self, *args, **kwargs):
        if self.completed and not self.completed_at:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.username} - {self.lesson.title} - {'Completed' if self.completed else 'Incomplete'}"


# ========== COURSE CERTIFICATE MODEL ==========
class CourseCertificate(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="certificates")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="certificates")
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.username} - {self.course.title} Certificate"
    

# ========== ACTIVITY AND SUBMISSION MODELS ==========
class Activity(models.Model):
    ACTIVITY_TYPES = [
        ('quiz', 'Quiz'),
        ('sandbox', 'Code Sandbox'),
        ('assignment', 'Assignment'),
    ]
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=255)
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    instructions = models.TextField()
    max_score = models.PositiveIntegerField(default=100)
    due_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Activities"

    def __str__(self):
        return f"{self.title} ({self.lesson.title})"


class Submission(models.Model):
    activity = models.ForeignKey(Activity, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')

    submitted_file = models.FileField(upload_to="activity_submissions/", blank=True, null=True)
    text_response = models.TextField(blank=True)

    submitted_at = models.DateTimeField(auto_now_add=True)
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    is_late = models.BooleanField(default=False)

    class Meta:
        unique_together = ('activity', 'student')

    def save(self, *args, **kwargs):
        if self.activity.due_date and timezone.now() > self.activity.due_date:
            self.is_late = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.username} - {self.activity.title}"
