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
  {
    path: 'payments',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'history',
        pathMatch: 'full'
      },
      {
        path: 'history',
        loadComponent: () => import('./pages/payments/payment-history/payment-history.page').then(m => m.PaymentHistoryPage),
        data: { title: 'Payment History' }
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/payments/payment-form/payment-form.page').then(m => m.PaymentFormPage),
        data: { title: 'Record Payment' }
      },
      {
        path: 'missed',
        loadComponent: () => import('./pages/payments/missed-payments/missed-payments.page').then(m => m.MissedPaymentsPage),
        data: { title: 'Missed Payments' }
      },
      {
        path: 'upcoming',
        loadComponent: () => import('./pages/payments/upcoming-payments/upcoming-payments.page').then(m => m.UpcomingPaymentsPage),
        data: { title: 'Upcoming Payments' }
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/payments/payment-form/payment-form.page').then(m => m.PaymentFormPage),
        data: { title: 'Payment Details' }
      }
    ]
  },
  {
    path: 'users',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/users/users.page').then(m => m.UsersPage),
        data: { title: 'Users' }
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/users/user-form/user-form.page').then( m => m.UserFormPage),
        data: { title: 'Add User' }
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./pages/users/user-form/user-form.page').then( m => m.UserFormPage),
        data: { title: 'Edit User' }
      },
      // Add other user-related child routes here if needed (e.g., user detail)
    ]
  },
  {
    path: 'sales',
    canActivate: [authGuard], 
    children: [
      {
        path: '', 
        loadComponent: () => import('./pages/sales/sales.page').then(m => m.SalesPage),
        data: { title: 'Jewelries' }
      },
      {
        path: 'new', 
        loadComponent: () => import('./pages/sales/sale-form/sale-form.page').then(m => m.SaleFormPage),
        data: { title: 'Add New Jewelry' }
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/sales/sale-detail/sale-detail.page').then(m => m.SaleDetailPage)
      }
      // Future child route for editing:
      // {
      //   path: 'edit/:id',
      //   loadComponent: () => import('./pages/sales/sale-form/sale-form.page').then(m => m.SaleFormPage),
      //   data: { title: 'Edit Sale' }
      // }
    ]
  },
];
