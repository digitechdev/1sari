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
    console.log('getUsers data:', data);

    console.log('123');
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
    console.log('getUserProfile data:', data);
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

  // --- User Creation --- (Explicitly invoking 'create-profile' function)
  // This approach directly calls the 'create-profile' Edge Function after signup.
  // WARNING: This has atomicity concerns. If the 'create-profile' invocation fails
  // after signup succeeds, you will have an auth user without a profile record.
  async createUserProfile(
    credentials: { email: string; password: string },
    profileData: Pick<UserProfile, 'full_name' | 'role'>
  ): Promise<any> {
    // 1. Sign up the user with Supabase Auth
    // Remove the 'options.data' as we will pass data directly to the function
    const { data: authData, error: signUpError } =
      await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        // options: { data: ... } // Removed - data passed in step 2
      });

    if (signUpError) {
      console.error('Error during Supabase Auth signUp:', signUpError.message);
      return { user: null, profileOutcome: null, error: signUpError };
    }

    if (!authData.user) {
      console.error('Sign up successful but no user data returned.');
      return {
        user: null,
        profileOutcome: null,
        error: new Error('Sign up completed without returning user data.'),
      };
    }

    console.log(`User ${authData.user.email} signed up successfully. Attempting to invoke create-profile function.`);

    // 2. Explicitly invoke the 'create-profile' Edge Function
    try {
      const { data: profileResponse, error: functionError } =
        await this.supabase.functions.invoke('create-profile', {
          body: {
            id: authData.user.id,
            email: authData.user.email, // email should be available on user object after signup
            full_name: profileData.full_name,
            role: profileData.role,
          },
        });

      if (functionError) {
        console.error(`Error invoking 'create-profile' function for user ${authData.user.id}:`, functionError);
        // CRITICAL: User exists in auth, but profile creation failed.
        return { user: authData.user, profileOutcome: { error: functionError }, error: functionError };
      }

      console.log(`'create-profile' function invoked successfully for user ${authData.user.id}:`, profileResponse);
      // Both signup and function invocation succeeded (though function might have internal errors reported in profileResponse)
      return { user: authData.user, profileOutcome: profileResponse, error: null };

    } catch (invokeCatchError: any) {
      console.error(`Caught exception invoking 'create-profile' function for user ${authData.user.id}:`, invokeCatchError);
      // CRITICAL: User exists in auth, but profile creation failed.
      return { user: authData.user, profileOutcome: { error: invokeCatchError }, error: invokeCatchError };
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