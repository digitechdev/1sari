import { LoanStatus } from '../enums/loan-status.enum';

/**
 * Represents the structure of a record in the public.loans table.
 */
export interface Loan {
  id?: number;
  borrower_id: number; // Foreign key linking to account_information
  loan_amount: number | null;
  loan_term: number | null; // e.g., in months
  interest_rate: number | null;
  status: string | null; // e.g., 'Active', 'Paid Off', 'Defaulted'
  disbursement_date: string | null; // Consider Date type
  purpose: string | null;
  // Add any other relevant columns from your 'loans' table
  created_at?: string;
} 