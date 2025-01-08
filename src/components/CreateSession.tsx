import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Session, User } from '../types';

interface Props {
  onSessionCreated: (user: User, session: Session) => void;
}

export default function CreateSession({ onSessionCreated }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCode, setShowAccessCode] = useState(false);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a new session with a random access code
      const accessCode = nanoid(6).toUpperCase();
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert([{ access_code: accessCode }])
        .select()
        .single();

      if (sessionError || !session) throw sessionError;

      // Create admin user for this session
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([{
          name,
          session_id: session.id,
          is_admin: true
        }])
        .select()
        .single();

      if (userError || !user) throw userError;

      setAccessCode(accessCode);
      setShowAccessCode(true);
      
      // Wait a moment before proceeding to make sure user sees the access code
      setTimeout(() => {
        onSessionCreated(user, session);
        toast.success('Session created successfully!');
      }, 500);
    } catch (error) {
      toast.error('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  if (showAccessCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">Session Created!</h1>
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Your session access code is:</p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-3xl font-mono font-bold tracking-wider">{accessCode}</p>
            </div>
            <p className="text-sm text-gray-500 mt-2">Save this code - you'll need it to rejoin the session!</p>
          </div>
          <button
            onClick={() => onSessionCreated}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue to Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create New Session</h1>
        <form onSubmit={handleCreateSession} className="space-y-4">
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
            {loading ? 'Creating...' : 'Create Session'}
          </button>
        </form>
      </div>
    </div>
  );
}