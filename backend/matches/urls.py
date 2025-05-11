from django.urls import path
from .views import user_stats, user_rank

urlpatterns = [
    path('users/<int:user_id>/stats/', user_stats),
    path('matches/users/<int:user_id>/rank/', user_rank),

]
