import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { PostgrestSingleResponse, PostgrestError } from '@supabase/supabase-js';
import { Loan, LoanWithBorrower } from '../interfaces/loan.interfaces';

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
  async getAllLoans(): Promise<PostgrestSingleResponse<LoanWithBorrower[]>> {
    this.isLoading.set(true);
    try {
      const response = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          borrower: ${this.borrowerTableName}!inner ( id, name_of_borrower ) 
        `)
        .order('created_at', { ascending: false });

      console.log('getAllLoans with borrower response:', response);

      if (response.error) {
        console.error('Supabase error fetching loans with borrowers:', response.error);
        return response as PostgrestSingleResponse<any>;
      }

      const dataWithBorrower = response.data as unknown as LoanWithBorrower[];

      return {
        ...response,
        data: dataWithBorrower,
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

  // TODO: Add methods for getLoanById, addLoan, updateLoan, deleteLoan later

  /* Example: Fetch loan with borrower name (requires foreign key relation setup in Supabase)
  async getAllLoansWithBorrowerName(): Promise<PostgrestSingleResponse<any[]>> { // Return type would need adjustment
    this.isLoading.set(true);
    try {
      const response = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          account_information ( name_of_borrower )
        `)
        .order('created_at', { ascending: false });
      return response;
    } catch (error: any) {
      // ... error handling ...
    } finally {
      this.isLoading.set(false);
    }
  }
  */

} 