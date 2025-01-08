import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import JoinSession from './components/JoinSession';
import VotingSession from './components/VotingSession';
import CreateSession from './components/CreateSession';
import { User, Session } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {!currentUser ? (
        isCreating ? (
          <CreateSession 
            onSessionCreated={(user, session) => {
              setCurrentUser(user);
              setCurrentSession(session);
            }} 
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold text-center mb-6">Join Voting Session</h1>
              <JoinSession 
                onJoinSession={(user, session) => {
                  setCurrentUser(user);
                  setCurrentSession(session);
                }} 
              />
              <div className="text-center mt-4">
                <button
                  onClick={() => setIsCreating(true)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Create New Session
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        <VotingSession 
          user={currentUser}
          session={currentSession!}
          onLeaveSession={() => {
            setCurrentUser(null);
            setCurrentSession(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}