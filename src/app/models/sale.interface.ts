export interface Sale {
  id?: string; // uuid, optional for new sales client-side
  borrower_name: string;
  item_name: string;
  description?: string | null;
  price: number; // Reverted to price, represents the sale price
  image_url?: string | null; // URL of the item's image from storage - ensure this column exists in DB or remove/rename
  image_preview?: string | null; // For UI preview before upload
  image_to_upload?: any; // Temporary storage for file/photo object
  created_by?: string | null; // uuid of the user who created the sale
  created_at?: string; // timestamp with time zone
  updated_at?: string; // timestamp with time zone
}