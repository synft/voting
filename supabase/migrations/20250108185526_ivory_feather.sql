/*
  # Open access for testing
  
  This migration removes RLS restrictions to allow full access for testing.
*/

-- Disable RLS on all tables for testing
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;