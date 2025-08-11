import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUser } from '../../Interfaces/iuser';
import { ToastrService } from 'ngx-toastr';
import { environment } from './environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class registerService {

  RegisterUser:IUser={
      name:"",
      username:"",
      phone:"",
      parentPhoneNumber:"",
      birthdate:new Date("2000-01-01"),
      studentYear:0,
      password:"",
      confirmPassword:"",
      role:"",
      token:"",
      photoUrl:""
    };

  constructor(private httpClient:HttpClient,private toaster:ToastrService,private router:Router) {
  }

  registerUserAPI(formData: FormData){
     return this.httpClient.post(`${environment.apiUrl}Account/Register`, formData);
  }
 onChange(formData: FormData)
{
  this.registerUserAPI(formData).subscribe(
    (res:any) => {
  localStorage.setItem('profileImage', res['profileImage']);
      this.toaster.success("تم التسجيل بنجاح");
      this.router.navigateByUrl('/Login');
    },
  (err) => {
        let allErrors = '';
        for (const key in err.error) {
          if (Array.isArray(err.error[key])) {
            allErrors += err.error[key].join('\n') + '\n';
          } else {
            allErrors += err.error[key] + '\n';
          }
        }
        this.toaster.error(allErrors);
      }
 )
 }
}