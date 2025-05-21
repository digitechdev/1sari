CREATE TABLE public.loan_payment_charges (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL REFERENCES public.loan_payment_schedules(id) ON DELETE CASCADE,
    charge_type TEXT NOT NULL, -- 'Late Fee', 'Service Fee', etc.
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT,
    added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    added_on TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN public.loan_payment_charges.charge_type IS 'Type of fee or charge';
COMMENT ON COLUMN public.loan_payment_charges.amount IS 'Amount of this charge';
COMMENT ON COLUMN public.loan_payment_charges.description IS 'Why this charge was applied';
COMMENT ON COLUMN public.loan_payment_charges.added_by IS 'User or admin who added the charge';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lpc_schedule_id ON public.loan_payment_charges(schedule_id); 