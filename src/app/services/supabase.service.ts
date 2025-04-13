import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment'; // Assuming environment setup

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    // Initialize Supabase client
    // IMPORTANT: Replace with your actual Supabase URL and anon key
    // You should store these securely, e.g., in environment variables
    this.supabase = createClient(
      environment.supabaseUrl, // Get from environment.ts
      environment.supabaseKey  // Get from environment.ts
    );
  }
}
