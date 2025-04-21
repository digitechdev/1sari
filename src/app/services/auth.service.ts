import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());

  constructor() {
    this.initializeAuthStateListener();
  }

  private async initializeAuthStateListener() {
    const { data } = await this.supabaseService.supabase.auth.getSession();
    this.currentUser.set(data.session?.user ?? null);
    console.log('Initial auth session:', data.session);

    this.supabaseService.supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session);
        this.currentUser.set(session?.user ?? null);

        // Optional: Redirect based on auth state change
        // Be cautious with redirects here to avoid loops
        // if (!session && event === 'SIGNED_OUT') {
        //   this.router.navigate(['/login']);
        // }
      }
    );
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabaseService.supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (!error) {
      this.currentUser.set(data.user);
    }
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabaseService.supabase.auth.signOut();
    if (!error) {
      this.currentUser.set(null);
      this.router.navigate(['/login'], { replaceUrl: true });
    } else {
      console.error('Error signing out:', error);
    }
    return { error };
  }

  // Optional: Get current session if needed elsewhere
  async getSession(): Promise<Session | null> {
    const { data } = await this.supabaseService.supabase.auth.getSession();
    return data.session;
  }
} 