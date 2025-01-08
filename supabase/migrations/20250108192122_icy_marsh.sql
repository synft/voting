/*
  # Re-enable RLS and create public access policies
  
  1. Security Changes
    - Re-enable RLS on all tables
    - Create public access policies for all tables
*/

-- Re-enable RLS on all tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions
CREATE POLICY "Public read access to sessions"
  ON sessions FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Public insert access to sessions"
  ON sessions FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

-- Create policies for users
CREATE POLICY "Public read access to users"
  ON users FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Public insert access to users"
  ON users FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

-- Create policies for cards
CREATE POLICY "Public read access to cards"
  ON cards FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Public insert access to cards"
  ON cards FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

-- Create policies for votes
CREATE POLICY "Public read access to votes"
  ON votes FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Public insert access to votes"
  ON votes FOR INSERT
  TO PUBLIC
  WITH CHECK (true);