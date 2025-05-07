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

  async deleteSale(id: string): Promise<PostgrestSingleResponse<null>> {
    return this.supabaseClient.from('sales').delete().match({ id });
  }

  // Placeholder for adding a sale - to be implemented later if needed
  // async addSale(saleData: Omit<Sale, 'id' | 'created_at' | 'updated_at'>): Promise<PostgrestSingleResponse<Sale>> {
  //   return this.supabaseClient.from('sales').insert([saleData]).select().single();
  // }

  // Placeholder for updating a sale - to be implemented later if needed
  // async updateSale(id: string, saleData: Partial<Sale>): Promise<PostgrestSingleResponse<Sale>> {
  //   return this.supabaseClient.from('sales').update(saleData).match({ id }).select().single();
  // }
} 