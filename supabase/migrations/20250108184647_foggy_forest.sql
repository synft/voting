/*
  # Fix Cards Table RLS Policies

  1. Changes
    - Drop existing restrictive policy
    - Add new policies for cards table that allow:
      - Anyone to read cards
      - Admins to create cards
      - Admins to update their session's cards
      - Admins to delete their session's cards

  2. Security
    - Maintains table security while allowing proper access
    - Ensures admins can only modify cards in their own sessions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read cards in their session" ON cards;
DROP POLICY IF EXISTS "Admins can create cards" ON cards;

-- Create new policies
CREATE POLICY "Anyone can read cards"
  ON cards FOR SELECT
  USING (true);

CREATE POLICY "Admins can create cards"
  ON cards FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.session_id = session_id 
    AND users.is_admin = true
  ));

CREATE POLICY "Admins can update their session cards"
  ON cards FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.session_id = session_id 
    AND users.is_admin = true
  ));

CREATE POLICY "Admins can delete their session cards"
  ON cards FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.session_id = session_id 
    AND users.is_admin = true
  ));