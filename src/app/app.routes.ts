import { Routes } from '@angular/router';
// TODO: Import AuthGuard and LoginGuard once created
// --- Import Guards ---
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
// --- End Imports ---

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
    canActivate: [loginGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
    data: { title: 'Dashboard' },
    canActivate: [authGuard]
  },
  {
    path: 'borrowers',
    canActivate: [authGuard],
    children: [
       {
        path: '',
        loadComponent: () => import('./pages/borrowers/borrowers.page').then( m => m.BorrowersPage),
        data: { title: 'Borrowers' }
       },
       {
          path: 'new',
          loadComponent: () => import('./pages/borrowers/borrower-form-page/borrower-form-page.page').then( m => m.BorrowerFormPagePage),
          data: { title: 'Add Borrower' }
       },
       {
          path: 'edit/:id',
          loadComponent: () => import('./pages/borrowers/borrower-form-page/borrower-form-page.page').then( m => m.BorrowerFormPagePage),
          data: { title: 'Edit Borrower' }
       },
       {
          path: 'detail/:id',
          loadComponent: () => import('./pages/borrowers/borrower-detail/borrower-detail.page').then( m => m.BorrowerDetailPage),
          data: { title: 'Borrower Details' }
       },
    ]
  },
  {
    path: 'loans',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/loans/loans.page').then( m => m.LoansPage),
        data: { title: 'Loans' }
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/loans/loan-form/loan-form.page').then( m => m.LoanFormPage),
        data: { title: 'Add New Loan' }
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/loans/loan-detail/loan-detail.page').then( m => m.LoanDetailPage),
        data: { title: 'Loan Details' }
      }
    ]
  },
 
];
