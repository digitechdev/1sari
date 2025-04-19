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

  // TODO: Add methods for getLoanById, updateLoan, deleteLoan later

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