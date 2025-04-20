import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
    data: { title: 'Dashboard' }
  },
  {
    path: 'borrowers',
    children: [
       {
        path: '',
        loadComponent: () => import('./pages/borrowers/borrowers.page').then( m => m.BorrowersPage),
        data: { title: 'Borrowers' }
       },
       {
          path: 'new',
          loadComponent: () => import('./pages/borrowers/borrower-form-page/borrower-form-page.page').then( m => m.BorrowerFormPagePage),
          data: { title: 'Borrowers' }
       },
       {
          path: 'edit/:id',
          loadComponent: () => import('./pages/borrowers/borrower-form-page/borrower-form-page.page').then( m => m.BorrowerFormPagePage),
          data: { title: 'Borrowers' }
       },
       {
          path: 'detail/:id',
          loadComponent: () => import('./pages/borrowers/borrower-detail/borrower-detail.page').then( m => m.BorrowerDetailPage),
          data: { title: 'Borrowers ' }
       },
    ]
  },
  {
    path: 'loans',
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
    ]
  },
 
];
