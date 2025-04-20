// import { PaymentStatus } from '../enums/payment-status.enum';

import { PaymentStatus } from "../enums/payment-status.enum";

/**
 * Represents the structure of a calculated amortization schedule record.
 * Maps to the public.loan_payment_schedules table (or similar).
 * Uses snake_case for Supabase compatibility.
 */
export interface LoanPaymentSchedule {
  id?: number; // Primary Key (SERIAL)
  loan_id: number; // Foreign Key (INTEGER NOT NULL)
  period_number: number; // INTEGER (e.g., 1 for first payment)
  due_date: string; // DATE NOT NULL (Calculated payment date)
  amount_due: number; // NUMERIC(15, 2) NOT NULL (Calculated payment amount)
  principal_paid: number; // NUMERIC(15, 2) NOT NULL (Calculated principal portion)
  interest_paid: number; // NUMERIC(15, 2) NOT NULL (Calculated interest portion)
  outstanding_balance: number; // NUMERIC(15, 2) NOT NULL (Remaining balance after payment)
  amount_paid?: number; // NUMERIC(15, 2) DEFAULT 0.00
  actual_payment_date?: string | null; // DATE
  status?: PaymentStatus; // TEXT DEFAULT 'Pending' -> Mapped to PaymentStatus enum
  created_at?: string; // TIMESTAMPTZ DEFAULT NOW()
}

// --- LoanPaymentSchedule Interface (for Supabase) ---
export interface LoanPaymentScheduleSupabase {
  loan_id: number;
  period_number: number;
  due_date: string; // Format as YYYY-MM-DD for Supabase
  amount_due: number;
  principal_paid: number;
  interest_paid: number;
  outstanding_balance: number;
  status: string; // e.g., 'Pending', 'Paid'
}
// --- End Interface --- 

// --- Exported LoanPaymentSchedule Interface (for Supabase) ---
export interface LoanPaymentSchedule {
  loan_id: number;
  period_number: number;
  due_date: string; // Format as YYYY-MM-DD for Supabase
  amount_due: number;
  principal_paid: number;
  interest_paid: number;
  outstanding_balance: number;
  status?: PaymentStatus; // Use the exported enum
}
// --- End Interface --- 