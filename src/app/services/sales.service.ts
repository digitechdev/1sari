import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Sale } from '../models/sale.interface';
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private supabaseClient = inject(SupabaseService).supabase;

  constructor() { }

  async getSales(): Promise<PostgrestSingleResponse<Sale[]>> {
    return this.supabaseClient.from('sales').select('*').order('created_at', { ascending: false });
  }

  /**
   * Adds multiple sale records to the database.
   * Each Sale object in the array will be a separate row in the 'sales' table.
   */
  async addSales(salesData: Sale[]): Promise<PostgrestResponse<Sale>> {
    // Omit id, created_at, updated_at, image_preview, image_to_upload from each sale object before inserting
    const dataToInsert = salesData.map(sale => {
      const { id, created_at, updated_at, image_preview, image_to_upload, ...rest } = sale;
      return rest; // Contains borrower_name, item_name, description, price, image_url, created_by
    });

    if (dataToInsert.length === 0) {
      return { data: [], error: null, status: 200, statusText: 'OK', count: 0 }; // Or handle as an error/warning
    }
    return this.supabaseClient.from('sales').insert(dataToInsert).select();
  }

  async deleteSale(id: string): Promise<PostgrestSingleResponse<null>> {
    return this.supabaseClient.from('sales').delete().match({ id });
  }

  // Placeholder for updating a sale - to be implemented later if needed
  // async updateSale(id: string, saleData: Partial<Sale>): Promise<PostgrestSingleResponse<Sale>> {
  //   return this.supabaseClient.from('sales').update(saleData).match({ id }).select().single();
  // }
} 