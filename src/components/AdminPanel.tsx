import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { User, Session } from '../types';

interface Props {
  user: User;
  session: Session;
}

export default function AdminPanel({ user, session }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchCards();
    
    const usersSubscription = supabase
      .channel('users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users', filter: `session_id=eq.${session.id}` },
        () => fetchUsers()
      )
      .subscribe();

    const cardsSubscription = supabase
      .channel('cards')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards', filter: `session_id=eq.${session.id}` },
        () => fetchCards()
      )
      .subscribe();

    return () => {
      usersSubscription.unsubscribe();
      cardsSubscription.unsubscribe();
    };
  }, [session.id]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });
    
    if (data) setUsers(data);
  };

  const fetchCards = async () => {
    console.log('Fetching cards for session:', session.id);
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching cards:', error);
      return;
    }

    console.log('Fetched cards:', data);
    setCards(data || []);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in both title and description');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('cards')
        .insert([{
          title: title.trim(),
          description: description.trim(),
          session_id: session.id
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('Card created:', data);
      setTitle('');
      setDescription('');
      toast.success('Card added successfully!');
      await fetchCards();
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error('Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ 
          active: false,
          closed_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;
      toast.success('Session closed successfully!');
    } catch (error) {
      console.error('Error closing session:', error);
      toast.error('Failed to close session');
    }
  };

  const toggleUserAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: !isAdmin })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User ${isAdmin ? 'removed from' : 'made'} admin`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>

      {/* Access Code Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Session Access Code</h3>
        <div className="bg-white p-3 rounded border">
          <p className="text-2xl font-mono font-bold tracking-wider text-center">{session.access_code}</p>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">Share this code with others to join the session</p>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Users</h3>
        <div className="space-y-2">
          {users.map(sessionUser => (
            <div key={sessionUser.id} className="flex items-center justify-between py-2 border-b">
              <div>
                <span className="font-medium">{sessionUser.name}</span>
                {sessionUser.is_admin && (
                  <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded">
                    Admin
                  </span>
                )}
              </div>
              {user.id !== sessionUser.id && (
                <button
                  onClick={() => toggleUserAdmin(sessionUser.id, sessionUser.is_admin)}
                  className={`text-sm px-3 py-1 rounded ${
                    sessionUser.is_admin
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                  }`}
                >
                  {sessionUser.is_admin ? 'Remove Admin' : 'Make Admin'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Current Cards</h3>
        <div className="space-y-4">
          {cards.length === 0 ? (
            <p className="text-gray-500">No cards added yet</p>
          ) : (
            cards.map(card => (
              <div key={card.id} className="p-4 border rounded-lg">
                <h4 className="font-medium">{card.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{card.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
      
      <form onSubmit={handleAddCard} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Card Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Card'}
        </button>
      </form>

      <div className="border-t pt-4">
        <button
          onClick={handleCloseSession}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Close Session
        </button>
      </div>
    </div>
  );
}