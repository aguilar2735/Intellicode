from django.contrib import admin
from .models import Course, Module, Lesson, Activity

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'course_code', 'creator', 'is_approved')
    search_fields = ('title', 'course_code')
    list_filter = ('is_approved', 'category')

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'order', 'has_quiz', 'has_activity', 'has_code_sandbox')
    list_filter = ('module',)

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('id', 'lesson', 'title', 'activity_type', 'max_score', 'due_date')
    list_filter = ('lesson', 'activity_type')
