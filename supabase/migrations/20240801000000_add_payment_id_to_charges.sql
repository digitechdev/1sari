-- Step 1: Add payment_id column to loan_payment_charges
ALTER TABLE public.loan_payment_charges 
ADD COLUMN payment_id INTEGER REFERENCES public.loan_payments(id) ON DELETE CASCADE;

-- Step 2: Add loan_id column for easier querying (optional but helpful)
ALTER TABLE public.loan_payment_charges 
ADD COLUMN loan_id INTEGER REFERENCES public.loans(id) ON DELETE CASCADE;

-- Add comments for clarity
COMMENT ON COLUMN public.loan_payment_charges.payment_id IS 'Foreign key linking to the specific payment';
COMMENT ON COLUMN public.loan_payment_charges.loan_id IS 'Redundant foreign key to help filter by loan';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_loan_payment_charges_payment_id ON public.loan_payment_charges(payment_id);
CREATE INDEX IF NOT EXISTS idx_loan_payment_charges_loan_id ON public.loan_payment_charges(loan_id); 