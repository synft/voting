/*
  # Fix database access configuration
  
  1. Changes
    - Enable RLS for all tables
    - Create proper policies for public access
*/

-- Enable RLS on all tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions
CREATE POLICY "Public sessions access"
  ON sessions FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- Create policies for users
CREATE POLICY "Public users access"
  ON users FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- Create policies for cards
CREATE POLICY "Public cards access"
  ON cards FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- Create policies for votes
CREATE POLICY "Public votes access"
  ON votes FOR ALL
  TO PUBLIC
  USING (true)
  WITH CHECK (true);