import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Session, User } from '../types';

interface Props {
  onJoinSession: (user: User, session: Session) => void;
}

export default function JoinSession({ onJoinSession }: Props) {
  const [accessCode, setAccessCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find active session with access code
      const { data: sessions, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('access_code', accessCode.trim())
        .eq('active', true);

      if (sessionError) throw sessionError;
      if (!sessions || sessions.length === 0) {
        throw new Error('Invalid or expired access code');
      }

      const session = sessions[0];

      // Create user for this session
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([{
          name: name.trim(),
          session_id: session.id,
          is_admin: false
        }])
        .select()
        .single();

      if (userError || !user) {
        throw userError || new Error('Failed to create user');
      }

      onJoinSession(user, session);
      toast.success('Successfully joined session!');
    } catch (error) {
      console.error('Join error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Access Code</label>
        <input
          type="text"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Joining...' : 'Join Session'}
      </button>
    </form>
  );
}