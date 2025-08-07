import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { AccountService } from "../Services/account.service";
import { ToastrService } from "ngx-toastr";

export const authGuard: CanActivateFn = (route, state) => {
    const accountService = inject(AccountService);
    const toastr = inject(ToastrService);
//  const user = accountService.currentUser.value;
    if (accountService.currentUser()) {
        return true;
    } else {
        toastr.info('*سجل دخول الاول*');
        return false;
    }
}