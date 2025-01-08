import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { VotingWebSocket } from '../lib/websocket';
import { User, Session, Card } from '../types';
import toast from 'react-hot-toast';
import AdminPanel from './AdminPanel';

interface Props {
  user: User;
  session: Session;
  onLeaveSession: () => void;
}

export default function VotingSession({ user, session, onLeaveSession }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [votes, setVotes] = useState<Record<string, boolean>>({});
  const [voteCounts, setVoteCounts] = useState<Record<string, { yes: number; no: number }>>({});
  const wsRef = useRef<VotingWebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    wsRef.current = new VotingWebSocket(session.id);
    const ws = wsRef.current.connect();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'vote') {
        // Update vote counts
        setVoteCounts(prev => {
          const newCounts = { ...prev };
          const cardCounts = newCounts[data.card_id] || { yes: 0, no: 0 };
          
          if (data.vote) {
            cardCounts.yes++;
          } else {
            cardCounts.no++;
          }
          
          newCounts[data.card_id] = cardCounts;
          return newCounts;
        });

        // Update user's own votes if applicable
        if (data.user_id === user.id) {
          setVotes(prev => ({
            ...prev,
            [data.card_id]: data.vote
          }));
        }
      } else if (data.type === 'card_added') {
        setCards(prev => [...prev, data.card]);
      }
    };

    // Initial data fetch
    fetchCards();
    fetchUserVotes();
    fetchVoteCounts();

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [session.id, user.id]);

  // ... rest of your existing functions (fetchCards, fetchUserVotes, fetchVoteCounts)

  const handleVote = async (cardId: string, vote: boolean) => {
    try {
      // Try to find existing vote
      const { data: existingVotes, error: searchError } = await supabase
        .from('votes')
        .select('*')
        .eq('card_id', cardId)
        .eq('user_id', user.id)
        .eq('session_id', session.id);

      if (searchError) throw searchError;

      if (existingVotes && existingVotes.length > 0) {
        // Update existing vote
        const { error: updateError } = await supabase
          .from('votes')
          .update({ vote })
          .eq('id', existingVotes[0].id);

        if (updateError) throw updateError;
      } else {
        // Create new vote
        const { error: insertError } = await supabase
          .from('votes')
          .insert({
            card_id: cardId,
            user_id: user.id,
            vote,
            session_id: session.id
          });

        if (insertError) throw insertError;
      }

      // Send vote through WebSocket
      if (wsRef.current) {
        wsRef.current.sendVote(cardId, vote, user.id);
      }

      // Update local state immediately for better UX
      setVotes(prev => ({ ...prev, [cardId]: vote }));
      toast.success('Vote recorded!');
    } catch (error) {
      console.error('Error recording vote:', error);
      toast.error('Failed to record vote');
    }
  };

  // ... rest of your existing JSX