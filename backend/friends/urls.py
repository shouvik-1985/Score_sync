from django.urls import path
from .views import (
    send_friend_request,
    accept_request,
    reject_request,
    remove_friend,
    friend_list,
    pending_requests,
    block_user,
    unblock_user,
    search_users,
    friend_notifications,
    friends_who_play_game,
)

urlpatterns = [
    path("send-request/", send_friend_request, name="send-friend-request"),
    path("accept/", accept_request, name="accept-request"),
    path("reject/", reject_request, name="reject-request"),
    path("remove/", remove_friend, name="remove-friend"),
    path("list/", friend_list, name="friend-list"),
    path("pending/", pending_requests, name="pending-requests"),
    path("block/<int:user_id>/", block_user, name="block-user"),
    path("unblock/<int:user_id>/", unblock_user, name="unblock-user"),
    path("search/", search_users, name="search-users"),
    path("notifications/", friend_notifications, name="friend-notifications"),
    path("friends-by-game/<int:game_id>/", friends_who_play_game, name="friends-who-play-game"),
]
