CREATE TABLE public.loan_payment_schedules (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    amount_due NUMERIC(15, 2) NOT NULL,
    amount_paid NUMERIC(15, 2) DEFAULT 0.00,
    payment_date DATE,
    status TEXT DEFAULT 'Pending', -- e.g., Pending, Paid, Overdue
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Add comments for clarity
COMMENT ON COLUMN public.loan_payment_schedules.loan_id IS 'Foreign key linking to the specific loan';
COMMENT ON COLUMN public.loan_payment_schedules.due_date IS 'The date the payment is due';
COMMENT ON COLUMN public.loan_payment_schedules.amount_due IS 'The amount scheduled to be paid';
COMMENT ON COLUMN public.loan_payment_schedules.amount_paid IS 'The actual amount paid for this installment';
COMMENT ON COLUMN public.loan_payment_schedules.payment_date IS 'The date the payment was actually made';
COMMENT ON COLUMN public.loan_payment_schedules.status IS 'Status of the payment installment';

-- Optional: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedule_loan_id ON public.loan_payment_schedules (loan_id);
CREATE INDEX IF NOT EXISTS idx_schedule_due_date ON public.loan_payment_schedules (due_date);
CREATE INDEX IF NOT EXISTS idx_schedule_status ON public.loan_payment_schedules (status); 