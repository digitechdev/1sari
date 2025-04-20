import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { PostgrestSingleResponse, PostgrestError, PostgrestResponse } from '@supabase/supabase-js';
import { Loan } from '../interfaces/loan.interfaces';
import { LoanPaymentSchedule } from '../interfaces/loan-payment-schedule.interfaces';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private supabaseService = inject(SupabaseService);
  private tableName = 'loans';
  private borrowerTableName = 'account_information';

  isLoading = signal<boolean>(false);

  private get supabase() {
    return this.supabaseService.supabase;
  }

  constructor() { }

  /**
   * Fetches all records from the loans table, joining with borrower information.
   * Ordered by creation date descending.
   * @returns Promise resolving to the Supabase response containing an array of LoanWithBorrower or an error.
   */
  async getAllLoans(): Promise<PostgrestSingleResponse<any[]>> {
    this.isLoading.set(true);
    try {
      // First fetch loans
      const loansResponse = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (loansResponse.error) {
        console.error('Error fetching loans:', loansResponse.error);
        return loansResponse;
      }

      // Then fetch all borrowers
      const borrowersResponse = await this.supabase
        .from(this.borrowerTableName)
        .select('id, name_of_borrower');

      if (borrowersResponse.error) {
        console.error('Error fetching borrowers:', borrowersResponse.error);
        return borrowersResponse;
      }

      // Manually join the data
      const borrowersMap = new Map(
        borrowersResponse.data?.map(b => [b.id, b]) || []
      );

      const combinedData = loansResponse.data?.map(loan => ({
        ...loan,
        borrower: borrowersMap.get(loan.borrower_id)
      })) || [];

      console.log('Combined loans with borrowers:', combinedData);

      return {
        ...loansResponse,
        data: combinedData,
        error: null
      };

    } catch (error: any) {
      console.error('Unexpected error in getAllLoans:', error);
      const pgError: PostgrestError = {
        message: error?.message || 'Client Loan Fetch Error',
        details: error?.details || '',
        hint: error?.hint || '',
        code: error?.code || 'CLIENT_LOAN_FETCH_ERR',
        name: 'ClientLoanFetchError'
      };
      return { data: null, error: pgError, status: 0, statusText: 'Client Loan Fetch Error', count: null };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Adds a new loan record to the database.
   * @param loanData The loan data to insert (should conform to Loan interface, excluding id/created_at).
   * @returns Promise resolving to the Supabase response containing the newly created Loan or an error.
   */
  async addLoan(loanData: Omit<Loan, 'id' | 'created_at'>): Promise<PostgrestSingleResponse<Loan>> {
    this.isLoading.set(true);
    try {
      // Ensure required fields like borrower_id are present if necessary before insertion
      if (typeof loanData.borrower_id === 'undefined' || loanData.borrower_id === null) {
        throw new Error('Borrower ID is required to add a loan.');
      }
      
      const response = await this.supabase
        .from(this.tableName)
        .insert(loanData as Partial<Loan>) // Cast may be needed depending on strictness
        .select() // Select the newly created record
        .single(); // Expecting a single record back
      
      console.log('addLoan response:', response);
      return response;

    } catch (error: any) {
      console.error('Unexpected error in addLoan:', error);
      const pgError: PostgrestError = {
        message: error?.message || 'Client Loan Add Error',
        details: error?.details || '',
        hint: error?.hint || '',
        code: error?.code || 'CLIENT_LOAN_ADD_ERR',
        name: 'ClientLoanAddError'
      };
      // Adjust the return structure if necessary, ensure it conforms to PostgrestSingleResponse<Loan>
      // Here we return the structure expected on error for a single response.
      return { data: null, error: pgError, status: 0, statusText: 'Client Loan Add Error', count: null }; 
    } finally {
      this.isLoading.set(false);
    }
  }


  /**
   * Inserts multiple loan payment schedule records into the database.
   * @param scheduleItems Array of loan payment schedule items to insert
   * @returns Promise resolving to the Supabase response containing the inserted records or an error
   */
  async addLoanSchedule(
    scheduleItems: LoanPaymentSchedule[]
  ): Promise<PostgrestSingleResponse<LoanPaymentSchedule[]>> {
    this.isLoading.set(true);
    try {
      // Use explicit table name and select to match getAllLoans pattern
      const response = await this.supabase
        .from('loan_payment_schedules')
        .insert(scheduleItems)
        .select(`
          *,
          loan:loans!inner (
            id,
            borrower:account_information!inner (
              id, 
              name_of_borrower
            )
          )
        `);

      console.log('addLoanSchedule response:', response);
      return response;

    } catch (error: any) {
      console.error('Unexpected error in addLoanSchedule:', error);
      const pgError: PostgrestError = {
        message: error?.message || 'Client Schedule Add Error',
        details: error?.details || '',
        hint: error?.hint || '',
        code: error?.code || 'CLIENT_SCHEDULE_ADD_ERR',
        name: 'ClientScheduleAddError'
      };
      return { data: null, error: pgError, status: 0, statusText: 'Client Schedule Add Error', count: null };
    } finally {
      this.isLoading.set(false);
    }
  }
} 