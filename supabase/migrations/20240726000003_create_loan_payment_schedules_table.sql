-- Create loan_payment_schedules table based on seed.sql structure
CREATE TABLE public.loan_payment_schedules (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    period_number INTEGER NULL, -- Consider adding NOT NULL if appropriate
    due_date DATE NOT NULL,
    amount_due NUMERIC(15, 2) NOT NULL,
    principal_paid NUMERIC(15, 2) NULL,
    interest_paid NUMERIC(15, 2) NULL,
    outstanding_balance NUMERIC(15, 2) NULL,
    status TEXT DEFAULT 'Pending', -- e.g., Pending, Paid, Overdue
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Add comments for clarity
COMMENT ON COLUMN public.loan_payment_schedules.loan_id IS 'Foreign key linking to the specific loan';
COMMENT ON COLUMN public.loan_payment_schedules.period_number IS 'The installment number (e.g., 1, 2, 3, ...)';
COMMENT ON COLUMN public.loan_payment_schedules.due_date IS 'The date the payment is due';
COMMENT ON COLUMN public.loan_payment_schedules.amount_due IS 'The total amount scheduled to be paid for this period';
COMMENT ON COLUMN public.loan_payment_schedules.principal_paid IS 'Portion of the payment allocated to principal for this period';
COMMENT ON COLUMN public.loan_payment_schedules.interest_paid IS 'Portion of the payment allocated to interest for this period';
COMMENT ON COLUMN public.loan_payment_schedules.outstanding_balance IS 'Remaining loan balance after this scheduled payment is applied';
COMMENT ON COLUMN public.loan_payment_schedules.status IS 'Status of the payment installment (e.g., Pending, Paid, Overdue)';
COMMENT ON COLUMN public.loan_payment_schedules.created_at IS 'Timestamp when the record was created';

-- Optional: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lps_loan_id ON public.loan_payment_schedules (loan_id);
CREATE INDEX IF NOT EXISTS idx_lps_due_date ON public.loan_payment_schedules (due_date);
CREATE INDEX IF NOT EXISTS idx_lps_status ON public.loan_payment_schedules (status); 