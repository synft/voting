import ReconnectingWebSocket from 'reconnecting-websocket';

export class VotingWebSocket {
  private ws: ReconnectingWebSocket | null = null;
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  connect() {
    const wsUrl = `ws://localhost:8000/ws/voting/${this.sessionId}/`;
    this.ws = new ReconnectingWebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return this.ws;
  }

  sendVote(cardId: string, vote: boolean, userId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'vote',
        card_id: cardId,
        vote,
        user_id: userId
      }));
    }
  }

  sendNewCard(card: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'card_added',
        card
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}