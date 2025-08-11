import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AccountService } from "../Services/account.service";
import { ToastrService } from "ngx-toastr";

export const authGuard: CanActivateFn = (route, state) => {
    const accountService = inject(AccountService);
    const router=inject(Router)
    const toastr = inject(ToastrService);
    if (accountService.currentUser()) {
        return true;
    } else {
        toastr.info('*سجل دخول الاول*');
        router.navigateByUrl('Login')
        return false;
    }
}