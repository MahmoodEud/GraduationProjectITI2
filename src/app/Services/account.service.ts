import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from './register/environment';
import { IUser } from '../Interfaces/iuser';
import { map, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { IStudentChangePassword } from '../Interfaces/IStudentChangePassword';
import { IAdminChangePassword } from '../Interfaces/iadmin-change-password';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private router=inject(Router)
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
// account.service.ts

 assignRole(userName: string, role: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}Account/AssignRole`,
      { userName, role }
    );
  }
  studentChangePassword(model: any) {
    return this.http.post(this.baseUrl + 'Account/student-change-password', model);
  }

  adminChangePassword(userId: string, model: IAdminChangePassword) {
      return this.http.post<{ message: string }>(
        `${this.baseUrl}Account/admin-change-password/${userId}`,
        model
      );
    }

  // Load Data From Local storage
  loadCurrentUser() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user: IUser = JSON.parse(userJson);
      this.currentUser.set(user);
    }
  }

  getCurrentUser() {
    return this.currentUser();
  }

  getCurrentUserId(): string {
    return this.getCurrentUser()?.id || '';
  }

  hasRole(role: string): boolean {
    const u = this.getCurrentUser();
    if (!u) return false;
    return (u.role ?? '').toLowerCase() === role.toLowerCase();
  }

  logout() {
    this.router.navigateByUrl('Login')
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  setCurrentUser(user: IUser) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  patchCurrentUser(patch: Partial<IUser>) {
    const cur = this.getCurrentUser();
    if (!cur) return;
    const merged: IUser = { ...cur, ...patch };
    localStorage.setItem('user', JSON.stringify(merged));
    this.currentUser.set(merged);
  }
}
