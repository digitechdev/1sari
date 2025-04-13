import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { PostgrestSingleResponse, PostgrestError } from '@supabase/supabase-js';
// Import the interface from the dedicated file
import { AccountInformation } from '../interfaces/account-information.interfaces';

// Remove the interface definition from here
/*
export interface AccountInformation {
  id?: number; // Assuming an auto-incrementing ID primary key
  name_of_borrower: string;
  provider_subject_no: string | null;
  gender: string | null;
  civil_status: string | null;
  type_of_id: string | null;
  birthday_borrower: string | null; // Consider using Date type if appropriate
  age: number | null;
  mothers_maiden_name_borrower: string | null;
  name_of_co_borrower_maker: string | null;
  security_collateral: string | null;
  mode_of_payment: string | null;
  store_name: string | null;
  residence_address: string | null;
  length_of_stay_in_residence: string | null; // Consider number type?
  store_address: string | null;
  area: string | null;
  contact_no_borrower: string | null;
  classification: string | null;
  store_category: string | null;
  account_relationship_officer: string | null;
  retail_partner: string | null;
  created_at?: string; // Assuming Supabase adds this automatically
  // Add any other relevant columns from your table
}
*/

@Injectable({
  providedIn: 'root'
})
export class BorrowerService {
  private supabaseService = inject(SupabaseService);
  // Define the table name as a constant for easy modification
  private tableName = 'account_information';

  constructor() { }

  /**
   * Fetches all records from the account_information table.
   * @returns Promise resolving to the Supabase response containing an array of AccountInformation or an error.
   */
  async getAllBorrowers(): Promise<PostgrestSingleResponse<AccountInformation[]>> {
    try {
      const response = await this.supabaseService.supabase
        .from(this.tableName)
        .select('*'); // Select all columns

      return response;
    } catch (error: any) { // Catch as any to inspect
      console.error('Unexpected error in getAllBorrowers:', error);

      // Construct an error object matching PostgrestError structure
      const pgError: PostgrestError = {
        message: error?.message || 'An unexpected client-side error occurred.',
        details: error?.details || 'No additional details available.',
        hint: error?.hint || '',
        code: error?.code || 'CLIENT_ERROR',
        // Add name property, although it might not be standard in PostgrestError
        name: 'ClientSideError' // Adding a name property
      };

      return {
         data: null,
         error: pgError,
         status: 0, // Indicate client-side error
         statusText: 'Client Error',
         count: null
       };
    }
  }

  // Add methods for filtering, pagination, adding, updating, deleting borrowers later
}
