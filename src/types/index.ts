export interface Card {
  id: string;
  title: string;
  description: string;
  created_at: string;
  session_id: string;
}

export interface Vote {
  id: string;
  card_id: string;
  user_id: string;
  vote: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  active: boolean;
  access_code: string;
  created_at: string;
  closed_at: string | null;
}

export interface User {
  id: string;
  name: string;
  is_admin: boolean;
  session_id: string;
  created_at: string;
}