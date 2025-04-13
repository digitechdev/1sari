import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
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
];
