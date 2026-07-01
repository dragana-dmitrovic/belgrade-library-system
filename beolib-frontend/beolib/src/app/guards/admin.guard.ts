import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Dozvoljava pristup samo ADMIN korisnicima (role iz localStorage, post-login).
 * Ulogovan USER ili gost ide na /books.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/books']);
};
