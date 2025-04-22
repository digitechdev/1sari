import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { UserProfile } from '../interfaces/user-profile.interface';
import { Router } from '@angular/router';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private supabase: SupabaseClient;
  private router = inject(Router);

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.supabase;
  }

  // --- User Profile CRUD --- (Interacting with 'profiles' table)

  async getUsers(): Promise<UserProfile[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at'); // Select specific columns

    if (error) {
      console.error('Error fetching users:', error.message);
      throw error;
    }
    return data || [];
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: row not found
      console.error('Error fetching user profile:', error.message);
      throw error;
    }
    return data;
  }

  async updateUserProfile(userId: string, profileData: Partial<Omit<UserProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error.message);
      throw error;
    }
    if (!data) {
      throw new Error('Update successful but no data returned.');
    }
    return data;
  }

  // --- User Creation --- (Interacting with Auth and Profiles)
  // IMPORTANT: See notes in thought process about atomicity concerns for production.
  async createUserProfile(credentials: { email: string; password: string }, profileData: Pick<UserProfile, 'full_name' | 'role'>): Promise<{ user: User | null, profile: UserProfile | null, error: any }> {
    // 1. Sign up the user with Supabase Auth
    const { data: authData, error: signUpError } = await this.supabase.auth.signUp(credentials);

    if (signUpError || !authData.user) {
      console.error('Error signing up user:', signUpError?.message);
      return { user: null, profile: null, error: signUpError || new Error('Sign up failed.') };
    }

    // 2. Create the corresponding profile (best effort from client)
    // Use a try-catch block for better error handling in the second step
    try {
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email!, // email is guaranteed from signup
          full_name: profileData.full_name,
          role: profileData.role
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile after signup:', profileError.message);
        // Note: User exists in auth.users but not profiles. Manual cleanup or different approach needed.
        return { user: authData.user, profile: null, error: profileError };
      }
      return { user: authData.user, profile, error: null };

    } catch (profileCatchError) {
      console.error('Caught error creating user profile after signup:', profileCatchError);
      return { user: authData.user, profile: null, error: profileCatchError };
    }
  }

  // --- User Deletion (Client-side call to Edge Function) --- 
  async deleteUser(userId: string): Promise<{ error: any | null }> {
    console.log(`Invoking delete-user Edge Function for userId: ${userId}`);
    // IMPORTANT: This invokes a Supabase Edge Function named 'delete-user'.
    // You MUST create this function in your Supabase project.
    // The function needs to handle both profile and auth user deletion securely using the admin API.
    const { data, error } = await this.supabase.functions.invoke('delete-user', {
        body: { userId }, // Pass the userId in the request body
    });

    if (error) {
        console.error('Error invoking delete-user function:', error);
        // Return the error to be handled by the calling component
        return { error };
    }

    console.log('delete-user function invoked successfully:', data);
    // Return success (no specific data needed usually, just absence of error)
    return { error: null };
  }

  // --- Other Auth Related --- (Could also live in AuthService)

  // Example: Update Authenticated User's Email (Requires confirmation)
  async updateUserEmail(newEmail: string) {
    const { data, error } = await this.supabase.auth.updateUser({ email: newEmail });
    if (error) {
      console.error('Error updating email:', error);
      throw error;
    }
    // Supabase typically sends a confirmation email.
    // You might need to update the email in the 'profiles' table via a trigger or manually after confirmation.
    console.log('Email update initiated. Check email for confirmation.', data);
    return data;
  }

  // Example: Update Authenticated User's Password
  async updateUserPassword(newPassword: string) {
    const { data, error } = await this.supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error('Error updating password:', error);
      throw error;
    }
    console.log('Password updated successfully.', data);
    return data;
  }

} 