CREATE TABLE public.loan_payments (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL REFERENCES public.loan_payment_schedules(id) ON DELETE CASCADE,
    loan_id INTEGER NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    method TEXT, -- e.g., 'Cash', 'Bank Transfer', 'Gcash'
    reference TEXT, -- OR number/receipt
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN public.loan_payments.schedule_id IS 'Which schedule this payment is for';
COMMENT ON COLUMN public.loan_payments.loan_id IS 'Redundant foreign key to help filter by loan';
COMMENT ON COLUMN public.loan_payments.amount IS 'Amount paid by the borrower';
COMMENT ON COLUMN public.loan_payments.method IS 'Payment method (Cash, GCash, etc)';
COMMENT ON COLUMN public.loan_payments.reference IS 'Reference number (e.g. receipt or transaction ID)';
COMMENT ON COLUMN public.loan_payments.notes IS 'Optional notes from user or collector';
COMMENT ON COLUMN public.loan_payments.recorded_by IS 'User who recorded the payment';

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_loan_payments_schedule_id ON public.loan_payments(schedule_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON public.loan_payments(loan_id); 