import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from './register/environment';
import { IUser } from '../Interfaces/iuser';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  currentUser = signal<IUser | null>(null);

  login(model: any) {
    return this.http.post<IUser>(this.baseUrl + 'Account/Login', model).pipe(
      map(user => {
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  // registering does not set the current user directly
  // because the account must be verifed by the admin first
  // for this functionality use the explicit register service instead
  /*
  register(model: any) {
    return this.http.post<IUser>(this.baseUrl + '', model).pipe(
      map(user => {
        if (user) {
          this.setCurrentUser(user);
        }
        return user;
      })
    );
  }
  */

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  setCurrentUser(user: IUser) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }
}
