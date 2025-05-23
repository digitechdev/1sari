import { PaymentStatus } from "../enums/payment-status.enum";

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

  // Loan terms fields
  // principal_due?: number; // The principal amount due for this period
  // interest_method?: 'straight' | 'diminishing'; // The interest calculation method
  // loan_period?: 'Daily' | 'Weekly' | 'Monthly' | 'Bi-Monthly'; // The loan period
  // interest_rate?: number; // The interest rate
  // tenure_in_months?: number; // The loan tenure in months
  // repayment_period?: number; // The repayment period
}