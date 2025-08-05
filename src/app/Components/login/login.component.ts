import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../Services/Login/login.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../Services/register/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
 
  constructor(public Login:LoginService,private router: Router,private toaster:ToastrService) {}
  onSubmit(){
    this.Login.login().subscribe({
      next:res=>{
        this.toaster.success('تم تسجيل الدخول بنجاح');
        localStorage.setItem('token', JSON.stringify(res));
        this.router.navigateByUrl('/MainPage')
      },
        error: err => {
         this.toaster.error('خطأ في اسم المستخدم أو كلمة المرور');
      }
    })
  }

}
