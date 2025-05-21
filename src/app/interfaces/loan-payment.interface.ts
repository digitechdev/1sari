export interface LoanPayment {
  schedule_id: number;
  loan_id: number;
  amount: number;
  payment_date: Date;
  method: string;
  reference: string;
  charges: {
    charge_type: string;
    amount: number;
  }[];
  totalAmount: number;
} 