create table sales (
  id uuid primary key default gen_random_uuid(),
  borrower_name text not null,
  item_name text not null,
  description text,
  raw_price numeric not null,
  interest numeric not null,
  total_price numeric not null,
  created_by uuid, -- optional: Supabase auth user
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
); 