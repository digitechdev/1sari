import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { PostgrestSingleResponse, PostgrestError } from '@supabase/supabase-js';
import { LoanPayment } from '../interfaces/loan-payment.interface';
import { LoanStatus } from '../enums/loan-status.enum';

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
          total_amount: paymentData.total_amount
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
          // payment_id: payment.id,
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

      // Check if this is the last payment schedule for the loan
      const { data: remainingSchedules, error: scheduleCheckError } = await this.supabase
        .from('loan_payment_schedules')
        .select('id')
        .eq('loan_id', paymentData.loan_id)
        .eq('status', 'Open');

      if (scheduleCheckError) {
        console.error('Error checking remaining schedules:', scheduleCheckError);
        return { data: null, error: scheduleCheckError, status: 0, statusText: 'Schedule Check Error', count: null };
      }

      // If no pending schedules remain, update the loan status to 'Paid'
      if (remainingSchedules.length === 0) {
        const { error: loanUpdateError } = await this.supabase
          .from('loans')
          .update({ status: LoanStatus.Paid })
          .eq('id', paymentData.loan_id);

        if (loanUpdateError) {
          console.error('Error updating loan status:', loanUpdateError);
          return { data: null, error: loanUpdateError, status: 0, statusText: 'Loan Status Update Error', count: null };
        }
      }

      // Fetch the complete payment record with charges
      const { data: completePayment, error: fetchError } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          schedule:loan_payment_schedules!schedule_id(
            id,
            due_date,
            amount_due,
            status,
            charges:loan_payment_charges(*)
          )
        `)
        .eq('id', payment.id)
        .single();

      if (fetchError) {
        console.error('Error fetching complete payment record:', fetchError);
        return { data: null, error: fetchError, status: 0, statusText: 'Payment Fetch Error', count: null };
      }

      return { data: completePayment, error: null, status: 200, statusText: 'OK', count: 1 };

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
          schedule:loan_payment_schedules!schedule_id(
            id,
            due_date,
            amount_due,
            status,
            charges:loan_payment_charges(*)
          )
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

  /**
   * Records a principal payment and restructures the loan if needed
   * @param paymentData The payment data to insert
   * @param newLoanTerms The terms for the restructured loan (if restructuring)
   * @param remainingPrincipal The remaining principal to be used for restructuring
   * @returns Promise resolving to the Supabase response containing the newly created payment or an error
   */
  async recordPrincipalPayment(
    paymentData: LoanPayment,
    newLoanTerms?: {
      interest_rate: number;
      tenure_in_months: number;
      interest_method: 'straight' | 'diminishing';
      loan_period: 'Daily' | 'Weekly' | 'Monthly' | 'Bi-Monthly';
      repayment_period: number;
    },
    remainingPrincipal?: number
  ): Promise<PostgrestSingleResponse<any>> {
    console.log('FROM PRINCIPAL PAYMENT');
    console.log(paymentData);
    console.log(newLoanTerms);
    console.log(remainingPrincipal);

    this.isLoading.set(true);
    
    try {
      // 1. Record the principal payment
      const { data: payment, error: paymentError } = await this.supabase
        .from(this.tableName)
        .insert({
          schedule_id: paymentData.schedule_id,
          loan_id: paymentData.loan_id,
          amount: paymentData.amount,
          payment_date: paymentData.payment_date,
          method: paymentData.method,
          reference: paymentData.reference,
          total_amount: paymentData.total_amount
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Error recording principal payment:', paymentError);
        return { data: null, error: paymentError, status: 0, statusText: 'Principal Payment Record Error', count: null };
      }

      // 2. If there are charges, insert them
      if (paymentData.charges && paymentData.charges.length > 0) {
        const charges = paymentData.charges.map(charge => ({
          schedule_id: paymentData.schedule_id,
          charge_type: charge.charge_type,
          amount: charge.amount,
          description: `${charge.charge_type} for principal payment reference: ${paymentData.reference}`
        }));

        const { error: chargesError } = await this.supabase
          .from(this.chargesTableName)
          .insert(charges);

        if (chargesError) {
          console.error('Error recording principal payment charges:', chargesError);
          return { data: null, error: chargesError, status: 0, statusText: 'Principal Payment Charges Record Error', count: null };
        }
      }

      // 3. Update the payment schedule status to 'Paid'
      const { error: scheduleError } = await this.supabase
        .from('loan_payment_schedules')
        .update({ status: 'Paid' })
        .eq('id', paymentData.schedule_id);

      if (scheduleError) {
        console.error('Error updating payment schedule:', scheduleError);
        return { data: null, error: scheduleError, status: 0, statusText: 'Schedule Update Error', count: null };
      }

      // 4. Get the current loan details
      const { data: currentLoan, error: loanError } = await this.supabase
        .from('loans')
        .select('*')
        .eq('id', paymentData.loan_id)
        .single();

      if (loanError) {
        console.error('Error fetching current loan:', loanError);
        return { data: null, error: loanError, status: 0, statusText: 'Loan Fetch Error', count: null };
      }

      // 5. Use the passed remainingPrincipal value
      if (typeof remainingPrincipal !== 'number') {
        console.error('Missing required remainingPrincipal parameter');
        return {
          data: null,
          error: {
            message: 'Remaining principal is required for restructuring.',
            details: '',
            hint: 'Pass the calculated remaining principal from the form/UI.',
            code: 'MISSING_REMAINING_PRINCIPAL',
            name: 'MissingRemainingPrincipalError'
          },
          status: 0,
          statusText: 'Missing Remaining Principal',
          count: null
        };
      }
      console.log('Remaining Principal (from param):', remainingPrincipal);
      console.log('New Loan Terms:', newLoanTerms);

      // 6. Create new loan if there's remaining principal and new terms are provided
      if (remainingPrincipal > 0 && newLoanTerms) {
        console.log('Creating new loan with remaining principal:', remainingPrincipal);
        // Validate new loan terms
        if (!newLoanTerms.interest_rate || !newLoanTerms.tenure_in_months || !newLoanTerms.interest_method || !newLoanTerms.loan_period || !newLoanTerms.repayment_period) {
          console.error('Missing required loan terms:', newLoanTerms);
          return {
            data: null,
            error: {
              message: 'Missing required loan terms for restructuring',
              details: 'All loan terms must be provided for restructuring',
              hint: 'Please provide all required loan terms',
              code: 'MISSING_LOAN_TERMS',
              name: 'MissingLoanTermsError'
            },
            status: 0,
            statusText: 'Missing Loan Terms',
            count: null
          };
        }

        const newLoan = {
          borrower_id: currentLoan.borrower_id,
          co_borrower_id: currentLoan.co_borrower_id,
          co_maker_id: currentLoan.co_maker_id,
          store_name: currentLoan.store_name,
          principal: remainingPrincipal,
          interest_rate: newLoanTerms.interest_rate,
          tenure_in_months: newLoanTerms.tenure_in_months,
          loan_release_date: new Date().toISOString().split('T')[0],
          interest_method: newLoanTerms.interest_method,
          loan_period: newLoanTerms.loan_period,
          repayment_period: newLoanTerms.repayment_period,
          status: LoanStatus.Active,
          application_date: new Date().toISOString().split('T')[0],
          approval_date: new Date().toISOString().split('T')[0],
          purpose: `Restructured from loan #${currentLoan.id}`,
          notes: `Original loan #${currentLoan.id} restructured after principal payment of ${paymentData.amount}`
        };

        console.log('New loan data to be inserted:', newLoan);

        const { data: newLoanData, error: newLoanError } = await this.supabase
          .from('loans')
          .insert(newLoan)
          .select()
          .single();

        if (newLoanError) {
          console.error('Error creating new loan:', newLoanError);
          return { data: null, error: newLoanError, status: 0, statusText: 'New Loan Creation Error', count: null };
        }

        console.log('New loan created successfully:', newLoanData);

        // 7. Create new payment schedule for the restructured loan (multiple periods)
        // Create multiple payment schedules based on loan terms
        const scheduleItems = [];
        const principal = remainingPrincipal;
        const interestRate = newLoanTerms.interest_rate;
        const tenureInMonths = newLoanTerms.tenure_in_months;
        const interestMethod = newLoanTerms.interest_method;
        const loanPeriod = newLoanTerms.loan_period;
        let balance = principal;
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = tenureInMonths;
        const today = new Date();
        
        console.log('Generating schedules with:', {interestMethod, interestRate, tenureInMonths, loanPeriod});
        
        if (interestMethod === 'diminishing') {
          // Diminishing balance method
          const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
          
          for (let i = 1; i <= numberOfPayments; i++) {
            const interest = balance * monthlyRate;
            const principalPayment = monthlyPayment - interest;
            balance -= principalPayment;
            
            const dueDate = new Date(today);
            dueDate.setMonth(today.getMonth() + i);
            
            scheduleItems.push({
              loan_id: newLoanData.id,
              period_number: i,
              due_date: dueDate.toISOString().split('T')[0],
              amount_due: monthlyPayment,
              principal_paid: principalPayment,
              interest_paid: interest,
              outstanding_balance: Math.max(0, balance),
              status: 'Open'
            });
          }
        } else {
          // Straight line method
          const principalPayment = principal / numberOfPayments;
          const interestPayment = (principal * interestRate / 100) / numberOfPayments;
          const totalPayment = principalPayment + interestPayment;
          
          for (let i = 1; i <= numberOfPayments; i++) {
            balance -= principalPayment;
            
            const dueDate = new Date(today);
            dueDate.setMonth(today.getMonth() + i);
            
            scheduleItems.push({
              loan_id: newLoanData.id,
              period_number: i,
              due_date: dueDate.toISOString().split('T')[0],
              amount_due: totalPayment,
              principal_paid: principalPayment,
              interest_paid: interestPayment,
              outstanding_balance: Math.max(0, balance),
              status: 'Open'
            });
          }
        }
        
        console.log(`Generated ${scheduleItems.length} schedule entries`);
        
        const scheduleResponse = await this.supabase
          .from('loan_payment_schedules')
          .insert(scheduleItems);

        if (scheduleResponse.error) {
          console.error('Error creating new payment schedule:', scheduleResponse.error);
          return { data: null, error: scheduleResponse.error, status: 0, statusText: 'New Schedule Creation Error', count: null };
        }

        console.log('New payment schedules created successfully');
      } else {
        console.log('Skipping new loan creation:', {
          remainingPrincipal,
          hasNewLoanTerms: !!newLoanTerms
        });
      }

      // 8. Update current loan status to Restructured
      const { error: updateError } = await this.supabase
        .from('loans')
        .update({ status: LoanStatus.Restructured })
        .eq('id', paymentData.loan_id);

      if (updateError) {
        console.error('Error updating loan status:', updateError);
        return { data: null, error: updateError, status: 0, statusText: 'Loan Status Update Error', count: null };
      }

      // 8.1 Close all remaining payment schedules for this loan
      const { error: closeSchedulesError } = await this.supabase
        .from('loan_payment_schedules')
        .update({ status: 'Closed' })
        .eq('loan_id', paymentData.loan_id)
        .neq('status', 'Paid');

      if (closeSchedulesError) {
        console.error('Error closing remaining payment schedules:', closeSchedulesError);
        // Continue even if there was an error (non-critical)
      } else {
        console.log('Successfully closed remaining payment schedules for loan:', paymentData.loan_id);
      }

      // 9. Fetch the complete payment record with charges
      const { data: completePayment, error: fetchError } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          schedule:loan_payment_schedules!schedule_id(
            id,
            due_date,
            amount_due,
            status,
            charges:loan_payment_charges(*)
          )
        `)
        .eq('id', payment.id)
        .single();

      if (fetchError) {
        console.error('Error fetching complete payment record:', fetchError);
        return { data: null, error: fetchError, status: 0, statusText: 'Payment Fetch Error', count: null };
      }

      return { data: completePayment, error: null, status: 200, statusText: 'OK', count: 1 };

    } catch (error: any) {
      console.error('Unexpected error in recordPrincipalPayment:', error);
      const pgError: PostgrestError = {
        message: error?.message || 'Client Principal Payment Record Error',
        details: error?.details || '',
        hint: error?.hint || '',
        code: error?.code || 'CLIENT_PRINCIPAL_PAYMENT_RECORD_ERR',
        name: 'ClientPrincipalPaymentRecordError'
      };
      return { data: null, error: pgError, status: 0, statusText: 'Client Principal Payment Record Error', count: null };
    } finally {
      this.isLoading.set(false);
    }
  }
} 