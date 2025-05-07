export interface Sale {
  id: string; // uuid
  borrower_name: string;
  item_name: string;
  description?: string | null;
  raw_price: number; // numeric
  interest: number; // numeric
  total_price: number; // numeric
  image_url?: string | null; // New field for item image
  created_by?: string | null; // uuid
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
} 