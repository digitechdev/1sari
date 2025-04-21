import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators'; // Import operators if using observable approach

/**
 * Functional route guard to protect routes requiring authentication.
 * Redirects unauthenticated users to the login page.
 */
export const authGuard: CanActivateFn = (route, state): 
  boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use the computed signal directly for synchronous check
  if (authService.isAuthenticated()) {
    return true; // User is authenticated, allow access
  } else {
    // User is not authenticated, redirect to login page
    console.log('AuthGuard: User not authenticated, redirecting to /login');
    return router.createUrlTree(['/login']); 
  }

  // --- Alternative using Observable (if needed for more complex async checks later) ---
  // return authService.currentUser.pipe(
  //   take(1), // Take the first emission
  //   map(user => {
  //     if (user) {
  //       return true; // User is logged in
  //     } else {
  //       console.log('AuthGuard: User not authenticated, redirecting to /login');
  //       return router.createUrlTree(['/login']); // Redirect to login
  //     }
  //   })
  // );
}; 