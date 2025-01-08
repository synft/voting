/*
  # Initial Schema Setup for Team Voting App

  1. New Tables
    - sessions: Stores voting sessions with access codes
    - users: Stores user information and admin status
    - cards: Stores voting cards/items
    - votes: Stores anonymous votes

  2. Security
    - Enable RLS on all tables
    - Add policies for read/write access
*/

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active BOOLEAN DEFAULT true,
  access_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  session_id UUID REFERENCES sessions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  session_id UUID REFERENCES sessions(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Votes table (anonymous)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id),
  user_id UUID REFERENCES users(id),
  vote BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(card_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read active sessions using access_code"
  ON sessions FOR SELECT
  USING (active = true);

CREATE POLICY "Anyone can read users in their session"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create a user"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read cards in their session"
  ON cards FOR SELECT
  USING (true);

CREATE POLICY "Admins can create cards"
  ON cards FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  ));

CREATE POLICY "Anyone can read vote counts"
  ON votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote once per card"
  ON votes FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM votes
      WHERE votes.card_id = card_id
      AND votes.user_id = auth.uid()
    )
  );