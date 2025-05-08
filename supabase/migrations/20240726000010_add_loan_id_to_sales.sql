-- Add loan_id column to link sales items to a specific loan
ALTER TABLE public.sales
ADD COLUMN loan_id INTEGER NULL;

-- Add foreign key constraint to enforce the relationship
ALTER TABLE public.sales
ADD CONSTRAINT fk_sales_loan
FOREIGN KEY (loan_id) REFERENCES public.loans(id)
ON DELETE CASCADE; -- Deleting a loan will delete associated sale items

-- Add an index on the foreign key for performance
CREATE INDEX IF NOT EXISTS idx_sales_loan_id ON public.sales(loan_id);

-- Add a comment for clarity
COMMENT ON COLUMN public.sales.loan_id IS 'Foreign key linking the sale item to the loan that financed it (if applicable)'; 