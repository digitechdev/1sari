-- Rename raw_price to price
ALTER TABLE public.sales
RENAME COLUMN raw_price TO price;

-- Remove interest column
ALTER TABLE public.sales
DROP COLUMN IF EXISTS interest;

-- Remove total_price column
ALTER TABLE public.sales
DROP COLUMN IF EXISTS total_price; 