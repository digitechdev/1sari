CREATE TABLE public.loans (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES public.account_information(id) ON DELETE CASCADE,
    loan_amount NUMERIC(15, 2) NOT NULL, -- Store monetary values accurately
    loan_term_months INTEGER NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL, -- e.g., 12.50 for 12.50%
    start_date DATE NOT NULL,
    status TEXT DEFAULT 'Active', -- e.g., Active, Paid, Defaulted
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Add comments for clarity
COMMENT ON COLUMN public.loans.account_id IS 'Foreign key linking to the borrower in account_information';
COMMENT ON COLUMN public.loans.loan_amount IS 'The principal amount of the loan';
COMMENT ON COLUMN public.loans.loan_term_months IS 'The duration of the loan in months';
COMMENT ON COLUMN public.loans.interest_rate IS 'Annual interest rate (e.g., 5.0 for 5%)';
COMMENT ON COLUMN public.loans.start_date IS 'The date the loan was disbursed or started';
COMMENT ON COLUMN public.loans.status IS 'Current status of the loan';

-- Optional: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_loan_account_id ON public.loans (account_id);
CREATE INDEX IF NOT EXISTS idx_loan_status ON public.loans (status); 