import { LoanStatus } from '../enums/loan-status.enum';
// Remove AccountInformation import if no longer needed after flattening
// import { AccountInformation } from './account-information.interfaces';

// --- Main Loan Interface (Simplified and Flattened for Supabase) ---

/**
 * Represents the structure of a record in the public.loans table.
 * Uses snake_case for direct mapping to Supabase columns.
 */
export interface Loan {
  id?: number; // Primary Key (SERIAL)
  borrower_id: number; // Foreign Key
  co_borrower_id?: number; // Foreign Key (Optional)
  co_maker_id?: number; // Foreign Key (Optional)
  store_name?: string; // TEXT

  // Loan terms (previously in calculationParams)
  principal: number; // NUMERIC
  interest_rate: number; // NUMERIC (Store as decimal, e.g., 0.03 for 3%)
  tenure_in_months: number; // INTEGER (Matches form)
  loan_release_date: string; // DATE (Matches form)
  interest_method: 'straight' | 'diminishing'; // TEXT (Matches form)
  loan_period: 'Daily' | 'Weekly' | 'Monthly' | 'Bi-Monthly'; // TEXT (Matches form)
  repayment_period: number; // INTEGER (Added from form, assuming number)
  disbursement_method: 'cash' | 'bank'; // TEXT (Added from form)

  // Calculated results (Optional - could be calculated on demand or stored)
  // periodic_payment?: number; // NUMERIC (The fixed payment amount)
  // total_paid?: number; // NUMERIC
  // total_interest?: number; // NUMERIC

  // Loan lifecycle details
  status: LoanStatus; // TEXT (Mapped to enum)
  application_date?: string; // DATE
  approval_date?: string; // DATE
  // disbursement_date is now value_date
  purpose?: string | null; // TEXT
  notes?: string; // TEXT

  // Timestamps
  created_at?: string; // TIMESTAMPTZ
  updated_at?: string; // TIMESTAMPTZ
}

// --- Remove Calculation-Specific Interfaces --- 
/*
export interface AmortizationScheduleItem { ... }
export interface LoanCalculationParams { ... }
export interface LoanCalculationResult { ... }
export interface LoanWithBorrowerDetails extends Loan { ... }
*/ 