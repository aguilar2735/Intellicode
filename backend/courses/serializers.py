from rest_framework import serializers
from .models import Course, Module, Lesson, Activity, Submission, CourseCertificate
from django.contrib.auth import get_user_model

User = get_user_model()

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'title', 'activity_type', 'content']
        read_only_fields = ['id']


class LessonSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, required=False)

    class Meta:
        model = Lesson
        fields = [
            'id',
            'title',
            'content',
            'order',
            'has_quiz',
            'has_activity',
            'has_code_sandbox',
            'activities',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        activities_data = validated_data.pop('activities', [])
        lesson = Lesson.objects.create(**validated_data)

        for activity_data in activities_data:
            Activity.objects.create(lesson=lesson, **activity_data)

        return lesson

    def update(self, instance, validated_data):
        activities_data = validated_data.pop('activities', [])

        # Update lesson fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Replace activities
        instance.activities.all().delete()
        for activity_data in activities_data:
            Activity.objects.create(lesson=instance, **activity_data)

        return instance


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, required=False)

    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'lessons']
        read_only_fields = ['id']

    def create(self, validated_data):
        lessons_data = validated_data.pop('lessons', [])
        module = Module.objects.create(**validated_data)

        for lesson_data in lessons_data:
            activities_data = lesson_data.pop('activities', [])
            lesson = Lesson.objects.create(module=module, **lesson_data)
            for activity_data in activities_data:
                Activity.objects.create(lesson=lesson, **activity_data)

        return module

    def update(self, instance, validated_data):
        lessons_data = validated_data.pop('lessons', [])

        # Update module fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Remove existing lessons (and nested activities via cascade or manually)
        instance.lessons.all().delete()

        # Recreate lessons and activities
        for lesson_data in lessons_data:
            activities_data = lesson_data.pop('activities', [])
            lesson = Lesson.objects.create(module=instance, **lesson_data)
            for activity_data in activities_data:
                Activity.objects.create(lesson=lesson, **activity_data)

        return instance

    
# courses/serializers.py

class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, required=False)

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'thumbnail',
            'category',
            'course_code',
            'is_approved',
            'modules',
        ]
        read_only_fields = ['id', 'is_approved']

    def create(self, validated_data):
        request = self.context.get('request')
        creator = request.user if request and request.user.is_authenticated else None

        # Handle modules coming in as a JSON string from FormData
        raw_modules_data = request.data.get('modules')
        if raw_modules_data:
            try:
                import json
                modules_data = json.loads(raw_modules_data)
            except (json.JSONDecodeError, TypeError):
                modules_data = []
        else:
            modules_data = []

        validated_data.pop('creator', None)
        course = Course.objects.create(creator=creator, **validated_data)
        if creator:
            course.instructors.add(creator)

        for module_data in modules_data:
            lessons_data = module_data.pop('lessons', [])
            module = Module.objects.create(course=course, **module_data)

            for lesson_data in lessons_data:
                activities_data = lesson_data.pop('activities', [])
                lesson = Lesson.objects.create(module=module, **lesson_data)

                for activity_data in activities_data:
                    Activity.objects.create(lesson=lesson, **activity_data)

        return course

    def update(self, instance, validated_data):
        request = self.context.get("request")

        # Handle modules passed as string (from FormData)
        raw_modules_data = request.data.get("modules")
        if raw_modules_data:
            import json
            try:
                modules_data = json.loads(raw_modules_data)
            except json.JSONDecodeError:
                modules_data = []
        else:
            modules_data = validated_data.pop("modules", [])

        # Update course fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        self._update_modules(instance, modules_data)

        return instance

    def _update_modules(self, course, modules_data):
        existing_modules = {m.id: m for m in course.modules.all()}
        submitted_module_ids = []

        for module_data in modules_data:
            lessons_data = module_data.pop('lessons', [])
            module_id = module_data.get('id')

            if module_id and module_id in existing_modules:
                module = existing_modules[module_id]
                for attr, value in module_data.items():
                    setattr(module, attr, value)
                module.save()
            else:
                module = Module.objects.create(course=course, **module_data)

            submitted_module_ids.append(module.id)
            self._update_lessons(module, lessons_data)

        # Delete removed modules
        for module in course.modules.all():
            if module.id not in submitted_module_ids:
                module.delete()

    
    def _update_lessons(self, module, lessons_data):
        existing_lessons = {l.id: l for l in module.lessons.all()}
        submitted_lesson_ids = []

        for lesson_data in lessons_data:
            activities_data = lesson_data.pop('activities', [])
            lesson_id = lesson_data.get('id')

            if lesson_id and lesson_id in existing_lessons:
                lesson = existing_lessons[lesson_id]
                for attr, value in lesson_data.items():
                    setattr(lesson, attr, value)
                lesson.save()
            else:
                lesson = Lesson.objects.create(module=module, **lesson_data)

            submitted_lesson_ids.append(lesson.id)
            self._update_activities(lesson, activities_data)

        # Delete removed lessons
        for lesson in module.lessons.all():
            if lesson.id not in submitted_lesson_ids:
                lesson.delete()

    def _update_activities(self, lesson, activities_data):
        existing_activities = {a.id: a for a in lesson.activities.all()}
        submitted_activity_ids = []

        for activity_data in activities_data:
            activity_id = activity_data.get('id')

            if activity_id and activity_id in existing_activities:
                activity = existing_activities[activity_id]
                for attr, value in activity_data.items():
                    setattr(activity, attr, value)
                activity.save()
            else:
                activity = Activity.objects.create(lesson=lesson, **activity_data)

            submitted_activity_ids.append(activity.id)

        # Delete removed activities
        for activity in lesson.activities.all():
            if activity.id not in submitted_activity_ids:
                activity.delete()


class ActivityReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'title', 'activity_type', 'content']


class LessonReadSerializer(serializers.ModelSerializer):
    activities = ActivityReadSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = [
            'id',
            'title',
            'content',
            'order',
            'has_quiz',
            'has_activity',
            'has_code_sandbox',
            'activities'
        ]


class ModuleReadSerializer(serializers.ModelSerializer):
    lessons = LessonReadSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'lessons']


class CourseReadSerializer(serializers.ModelSerializer):
    modules = ModuleReadSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'thumbnail',
            'category',
            'course_code',
            'is_approved',
            'modules',
        ]

    
class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'

class CourseCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCertificate
        fields = '__all__'
