import { PaymentStatus } from '../enums/payment-status.enum';

/**
 * Represents the structure of a record in the public.loan_payment_schedules table.
 */
export interface LoanPaymentSchedule {
  id: number; // SERIAL PRIMARY KEY
  loan_id: number; // INTEGER NOT NULL
  due_date: string; // DATE NOT NULL (Supabase returns as string)
  amount_due: number; // NUMERIC(15, 2) NOT NULL
  amount_paid?: number; // NUMERIC(15, 2) DEFAULT 0.00
  payment_date: string | null; // DATE
  status?: PaymentStatus; // TEXT DEFAULT 'Pending' -> Mapped to PaymentStatus enum
  created_at?: string; // TIMESTAMPTZ DEFAULT NOW()
} 