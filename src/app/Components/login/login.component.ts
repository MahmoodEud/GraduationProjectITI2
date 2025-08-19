import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../Services/register/environment';
import { AccountService } from '../../Services/account.service';
import { ILoginUser } from '../../Interfaces/ilogin-user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  /*
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
  */

  private router = inject(Router);
  private toastr = inject(ToastrService);
  accoutnService = inject(AccountService);
  // model:any;
  model: ILoginUser = { 
    username:'',
    password:''
  };

  onSubmit() {
    this.accoutnService.login(this.model).subscribe({
      next: (res) => {
          this.toastr.success('تم تسجيل الدخول بنجاح');
        this.router.navigateByUrl('/main');
      },
      // The error will not always be related to the client
      // Maybe it is a server error...so we will not make any assumptions
      error: error =>{ 
        this.toastr.error('خطأ في اسم المستخدم أو كلمة المرور');
        // this.toastr.error(error.error)
      }
    });
  }
}
