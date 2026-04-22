import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard = () => {
  const router = inject(Router);
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.HomePage),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterPage)
  },
  { path: '**', redirectTo: 'home' }
];
