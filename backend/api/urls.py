from django.urls import path, include
from .views import AdminOnlyView, UserProfileView, AdminDashboardView, InstructorDashboardView, StudentDashboardView, ChangePasswordView


urlpatterns = [
    path('admin-only/', AdminOnlyView.as_view(), name='admin-only'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('dashboard/admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('dashboard/instructor/', InstructorDashboardView.as_view(), name='instructor-dashboard'),
    path('dashboard/student/', StudentDashboardView.as_view(), name='student-dashboard'),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path('courses/', include('courses.urls')),
]

