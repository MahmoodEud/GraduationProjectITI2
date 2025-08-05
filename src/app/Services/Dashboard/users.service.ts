import { Injectable } from '@angular/core';
import { IUser } from '../../Interfaces/iuser';
import { HttpClient } from '@angular/common/http';
import { environment } from '../register/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  user:IUser[]=[]
  constructor(private http:HttpClient) { }
  getAllUser(){
    return this.http.get<IUser[]>(`${environment}/Account/Register`)
  }

}
