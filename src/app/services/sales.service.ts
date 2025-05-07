import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Sale } from '../models/sale.interface';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private supabaseClient = inject(SupabaseService).supabase;

  constructor() { }

  async getSales(): Promise<PostgrestSingleResponse<Sale[]>> {
    return this.supabaseClient.from('sales').select('*').order('created_at', { ascending: false });
  }

  async addSale(saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>): Promise<PostgrestSingleResponse<Sale>> {
    // The created_by field will be handled by the form or backend logic (e.g., RLS policy with auth.uid())
    // For now, if not provided by saleData, it will be null or default in DB if any.
    const { data, error } = await this.supabaseClient.from('sales').insert([saleData]).select().single();
    return { data, error } as PostgrestSingleResponse<Sale>; // Ensure the return type matches
  }

  async deleteSale(id: string): Promise<PostgrestSingleResponse<null>> {
    return this.supabaseClient.from('sales').delete().match({ id });
  }

  // Placeholder for updating a sale - to be implemented later if needed
  // async updateSale(id: string, saleData: Partial<Sale>): Promise<PostgrestSingleResponse<Sale>> {
  //   return this.supabaseClient.from('sales').update(saleData).match({ id }).select().single();
  // }
} 