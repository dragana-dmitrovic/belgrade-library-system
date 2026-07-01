import { Routes } from '@angular/router';

import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { AdminBooksPage } from './pages/admin/admin-books/admin-books';
import { AdminBranchesPage } from './pages/admin/admin-branches/admin-branches';
import { BookDetailsPage } from './pages/book-details/book-details';
import { BooksPage } from './pages/books/books';
import { LoginPage } from './pages/login/login';
import { ReadingHistoryPage } from './pages/reading-history/reading-history';
import { RegisterPage } from './pages/register/register';
import { ReservationsPage } from './pages/reservations/reservations';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'books', component: BooksPage },
  { path: 'books/:id', component: BookDetailsPage },
  {
    path: 'reservations',
    component: ReservationsPage,
    canActivate: [authGuard],
  },
  {
    path: 'reading-history',
    component: ReadingHistoryPage,
    canActivate: [authGuard],
  },
  {
    path: 'admin/books',
    component: AdminBooksPage,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/branches',
    component: AdminBranchesPage,
    canActivate: [adminGuard],
  },
  { path: '**', redirectTo: 'books' },
];
