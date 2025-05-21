import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { PostgrestSingleResponse, PostgrestError } from '@supabase/supabase-js';
import { LoanPayment } from '../interfaces/loan-payment.interface';

@Injectable({
  providedIn: 'root'
})
export class LoanPaymentService {
  private supabaseService = inject(SupabaseService);
  private tableName = 'loan_payments';
  private chargesTableName = 'loan_payment_charges';

  isLoading = signal<boolean>(false);

  private get supabase() {
    return this.supabaseService.supabase;
  }

  constructor() { }

  /**
   * Records a new loan payment and its associated charges
   * @param paymentData The payment data to insert
   * @returns Promise resolving to the Supabase response containing the newly created payment or an error
   */
  async recordPayment(paymentData: LoanPayment): Promise<PostgrestSingleResponse<any>> {
    this.isLoading.set(true);
    try {
      // Start a transaction
      const { data: payment, error: paymentError } = await this.supabase
        .from(this.tableName)
        .insert({
          schedule_id: paymentData.schedule_id,
          loan_id: paymentData.loan_id,
          amount: paymentData.amount,
          payment_date: paymentData.payment_date,
          method: paymentData.method,
          reference: paymentData.reference,
          total_amount: paymentData.totalAmount
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Error recording payment:', paymentError);
        return { data: null, error: paymentError, status: 0, statusText: 'Payment Record Error', count: null };
      }

      // If there are charges, insert them
      if (paymentData.charges && paymentData.charges.length > 0) {
        const charges = paymentData.charges.map(charge => ({
          schedule_id: paymentData.schedule_id,
          charge_type: charge.charge_type,
          amount: charge.amount,
          description: `${charge.charge_type} for payment reference: ${paymentData.reference}`
        }));

        const { error: chargesError } = await this.supabase
          .from(this.chargesTableName)
          .insert(charges);

        if (chargesError) {
          console.error('Error recording payment charges:', chargesError);
          return { data: null, error: chargesError, status: 0, statusText: 'Payment Charges Record Error', count: null };
        }
      }

      // Update the payment schedule status to 'Paid'
      const { error: scheduleError } = await this.supabase
        .from('loan_payment_schedules')
        .update({ status: 'Paid' })
        .eq('id', paymentData.schedule_id);

      if (scheduleError) {
        console.error('Error updating payment schedule:', scheduleError);
        return { data: null, error: scheduleError, status: 0, statusText: 'Schedule Update Error', count: null };
      }

      return { data: payment, error: null, status: 200, statusText: 'OK', count: 1 };

    } catch (error: any) {
      console.error('Unexpected error in recordPayment:', error);
      const pgError: PostgrestError = {
        message: error?.message || 'Client Payment Record Error',
        details: error?.details || '',
        hint: error?.hint || '',
        code: error?.code || 'CLIENT_PAYMENT_RECORD_ERR',
        name: 'ClientPaymentRecordError'
      };
      return { data: null, error: pgError, status: 0, statusText: 'Client Payment Record Error', count: null };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Gets all payments for a specific loan
   * @param loanId The ID of the loan
   * @returns Promise resolving to the Supabase response containing an array of payments or an error
   */
  async getLoanPayments(loanId: number): Promise<PostgrestSingleResponse<any[]>> {
    this.isLoading.set(true);
    try {
      const response = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          charges:loan_payment_charges(*)
        `)
        .eq('loan_id', loanId)
        .order('payment_date', { ascending: false });

      return response;

    } catch (error: any) {
      console.error('Unexpected error in getLoanPayments:', error);
      const pgError: PostgrestError = {
        message: error?.message || 'Client Payment Fetch Error',
        details: error?.details || '',
        hint: error?.hint || '',
        code: error?.code || 'CLIENT_PAYMENT_FETCH_ERR',
        name: 'ClientPaymentFetchError'
      };
      return { data: null, error: pgError, status: 0, statusText: 'Client Payment Fetch Error', count: null };
    } finally {
      this.isLoading.set(false);
    }
  }
} 