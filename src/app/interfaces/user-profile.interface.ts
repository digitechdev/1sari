export interface UserProfile {
  id: string; // Corresponds to Supabase Auth user ID (UUID)
  email: string;
  full_name?: string;
  role?: string; // Example: 'admin', 'agent', 'viewer'
  created_at?: string;
  updated_at?: string;
} 