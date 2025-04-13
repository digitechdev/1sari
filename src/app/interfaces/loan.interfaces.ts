import { LoanStatus } from '../enums/loan-status.enum';

/**
 * Represents the structure of a record in the public.loans table.
 */
export interface Loan {
  id: number; // SERIAL PRIMARY KEY
  account_id: number; // INTEGER NOT NULL
  loan_amount: number; // NUMERIC(15, 2) NOT NULL
  loan_term_months: number; // INTEGER NOT NULL
  interest_rate: number; // NUMERIC(5, 2) NOT NULL
  start_date: string; // DATE NOT NULL (Supabase returns as string)
  status?: LoanStatus; // TEXT DEFAULT 'Active' -> Mapped to LoanStatus enum
  created_at?: string; // TIMESTAMPTZ DEFAULT NOW()
} 