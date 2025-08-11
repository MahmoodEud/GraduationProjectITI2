import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../Services/account.service';

export const adminRoleGuard: CanActivateFn = () => {
  const account = inject(AccountService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  const user = account.currentUser(); // signal read

  if (!user) {
    toastr.info('سجّل دخول الأول');
    return router.parseUrl('/login'); 
  }

  const isAdmin = (user.role ?? '').toLowerCase() === 'admin';
  if (isAdmin) return true;

  toastr.error('الوصول مسموح للمسؤولين فقط');
  return router.parseUrl('/access-denied');
};
