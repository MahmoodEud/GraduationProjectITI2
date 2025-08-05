import { Injectable } from '@angular/core';
import { ILogin } from '../../Interfaces/ilogin';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../register/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  userLogin:ILogin={
    userName: '',
    password: ''
  }
  constructor(private http:HttpClient) { }

  login() {
    return this.http.post(`${environment.apiUrl}/Account/Login`, this.userLogin);
  }
}
