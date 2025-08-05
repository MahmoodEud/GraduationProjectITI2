import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor(private router:Router,private toast:ToastrService) { }

  logout(){
    localStorage.getItem('token')
    localStorage.removeItem;
    this.toast.info("تم تسجيل الخروج")
    this.router.navigateByUrl('/Login')
  }
}
