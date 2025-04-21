-- Create loans table based on seed.sql structure
CREATE TABLE public.loans (
    id SERIAL PRIMARY KEY,
    borrower_id INTEGER NOT NULL REFERENCES public.account_information(id) ON DELETE CASCADE,
    co_borrower_id INTEGER NULL,
    co_maker_id INTEGER NULL,
    store_name TEXT NULL,
    principal NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(8, 6) NOT NULL, -- e.g., 0.030000 for 3%
    tenure_in_months INTEGER NOT NULL,
    loan_release_date DATE NOT NULL,
    interest_method TEXT NULL,
    loan_period TEXT NULL,
    repayment_period INTEGER NULL,
    disbursement_method TEXT NULL,
    status TEXT DEFAULT 'Pending', -- Defaulting to Pending, adjust if needed
    application_date DATE NULL,
    approval_date DATE NULL,
    purpose TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Add comments for clarity
COMMENT ON COLUMN public.loans.borrower_id IS 'Foreign key linking to the borrower in account_information';
COMMENT ON COLUMN public.loans.co_borrower_id IS 'Foreign key linking to the co-borrower, if any (nullable)';
COMMENT ON COLUMN public.loans.co_maker_id IS 'Foreign key linking to the co-maker, if any (nullable)';
COMMENT ON COLUMN public.loans.store_name IS 'Name of the associated store (from seed data)';
COMMENT ON COLUMN public.loans.principal IS 'The principal amount of the loan';
COMMENT ON COLUMN public.loans.interest_rate IS 'Interest rate stored as a decimal (e.g., 0.03 for 3%)';
COMMENT ON COLUMN public.loans.tenure_in_months IS 'The duration of the loan in months';
COMMENT ON COLUMN public.loans.loan_release_date IS 'The date the loan was disbursed or started';
COMMENT ON COLUMN public.loans.interest_method IS 'Method used for interest calculation (e.g., straight, diminishing)';
COMMENT ON COLUMN public.loans.loan_period IS 'Frequency of loan period (e.g., Daily, Monthly)';
COMMENT ON COLUMN public.loans.repayment_period IS 'Number of repayments expected (e.g., 60 for daily over 2 months)';
COMMENT ON COLUMN public.loans.disbursement_method IS 'How the loan amount was disbursed (e.g., Gcash, Bank)';
COMMENT ON COLUMN public.loans.status IS 'Current status of the loan (e.g., Pending, Active, Paid, Defaulted)';
COMMENT ON COLUMN public.loans.application_date IS 'Date the loan application was submitted';
COMMENT ON COLUMN public.loans.approval_date IS 'Date the loan application was approved';
COMMENT ON COLUMN public.loans.purpose IS 'Purpose of the loan';
COMMENT ON COLUMN public.loans.notes IS 'Additional notes about the loan';
COMMENT ON COLUMN public.loans.created_at IS 'Timestamp when the record was created';

-- Optional: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON public.loans (borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans (status);
CREATE INDEX IF NOT EXISTS idx_loans_loan_release_date ON public.loans (loan_release_date); 