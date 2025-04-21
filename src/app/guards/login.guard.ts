import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Functional route guard to protect the login route.
 * Redirects authenticated users away from the login page (e.g., to dashboard).
 */
export const loginGuard: CanActivateFn = (route, state):
  boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {

  const authService = inject(AuthService);
  const router = inject(Router);

  return from(authService.getSession()).pipe(
      map(session => {
          if (session) {
              console.log('LoginGuard (Async): User already authenticated, redirecting to /dashboard');
              return router.createUrlTree(['/dashboard']);
          } else {
              return true;
          }
      })
  );
};
 