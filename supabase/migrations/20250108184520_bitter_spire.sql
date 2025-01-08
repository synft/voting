/*
  # Add session_id to votes table

  1. Changes
    - Add session_id column to votes table
    - Add foreign key constraint to sessions table
    - Update unique constraint to include session_id

  2. Security
    - Maintains existing RLS policies
    - Ensures referential integrity with sessions table
*/

-- Add session_id column to votes table
ALTER TABLE votes 
  ADD COLUMN session_id UUID REFERENCES sessions(id);

-- Drop existing unique constraint
ALTER TABLE votes 
  DROP CONSTRAINT IF EXISTS votes_card_id_user_id_key;

-- Add new unique constraint including session_id
ALTER TABLE votes 
  ADD CONSTRAINT votes_card_id_user_id_session_id_key 
  UNIQUE (card_id, user_id, session_id);