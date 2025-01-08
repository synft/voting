import json
from channels.generic.websocket import AsyncWebsocketConsumer

class VotingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.session_group_name = f'voting_{self.session_id}'

        # Join session group
        await self.channel_layer.group_add(
            self.session_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave session group
        await self.channel_layer.group_discard(
            self.session_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'vote':
            # Broadcast vote to session group
            await self.channel_layer.group_send(
                self.session_group_name,
                {
                    'type': 'broadcast_vote',
                    'card_id': data['card_id'],
                    'vote': data['vote'],
                    'user_id': data['user_id']
                }
            )
        elif message_type == 'card_added':
            # Broadcast new card to session group
            await self.channel_layer.group_send(
                self.session_group_name,
                {
                    'type': 'broadcast_card',
                    'card': data['card']
                }
            )

    async def broadcast_vote(self, event):
        # Send vote to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'vote',
            'card_id': event['card_id'],
            'vote': event['vote'],
            'user_id': event['user_id']
        }))

    async def broadcast_card(self, event):
        # Send new card to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'card_added',
            'card': event['card']
        }))