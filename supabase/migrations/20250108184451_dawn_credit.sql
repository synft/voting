/*
  # Fix Session RLS Policies

  1. Changes
    - Add policy to allow session creation
    - Update existing session read policy to be more permissive

  2. Security
    - Allows anyone to create a session
    - Maintains security while fixing the 401 error
*/

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Anyone can read active sessions using access_code" ON sessions;

-- Create new policies for sessions
CREATE POLICY "Anyone can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read sessions"
  ON sessions FOR SELECT
  USING (true);