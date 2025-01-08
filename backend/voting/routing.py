from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/voting/(?P<session_id>\w+)/$', consumers.VotingConsumer.as_asgi()),
]