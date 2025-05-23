export interface LoanPayment {
  id?: number;
  schedule_id: number;
  loan_id: number;
  amount: number;
  payment_date: Date | string;
  method: string;
  reference: string;
  total_amount?: number;
  notes?: string;
  recorded_by?: string | null;
  payment_type?: 'regular' | 'principal' | 'interest' | 'restructured' | 'other';
  charges?: {
    id?: number;
    charge_type: string;
    amount: number;
    description?: string;
  }[];
} 