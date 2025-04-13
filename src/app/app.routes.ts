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
    loadComponent: () =>
      import('./pages/borrowers/borrowers.page').then((m) => m.BorrowersPage),
    data: { title: 'Borrowers' },
  },
  {
    path: 'borrowers/new',
    loadComponent: () =>
      import('./pages/borrower-form/borrower-form.page').then(
        (m) => m.BorrowerFormPage
      ),
    data: { title: 'Add Borrower' }
  },
  {
    path: 'borrower-detail/:id',
    loadComponent: () => import('./pages/borrower-detail/borrower-detail.page').then( m => m.BorrowerDetailPage)
  },
];
