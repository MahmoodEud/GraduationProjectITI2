import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from './register/environment';
import { IStudentUpdate } from '../Interfaces/istudent-update';
import { IStudent } from '../Interfaces/istudent';
import { Observable } from 'rxjs';
import { DashboardStats } from '../Interfaces/DashboardStats'; 
import { IPagedResult } from '../Interfaces/ipaged-result';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  controllerUrl = this.baseUrl + 'Students';
  // controllerById = this.baseUrl + 'Students';
// ! finshed
getAllStudents(year?: number, role?: string, pageNumber = 1, pageSize = 10): Observable<IPagedResult<IStudent>>  {
    let params = new HttpParams()
    .set('pageNumber', pageNumber)
    .set('pageSize', pageSize);

   if (year !== undefined) params = params.set('year', year.toString());


   if (role && role.trim().length) {
    params = params.set('roleFilter', role);      // Admin/Student/Assistance
  }

  return this.http.get<IPagedResult<IStudent>>(this.controllerUrl, { params });
  }

getRoles(): Observable<string[]> {
  return this.http.get<string[]>(`${this.baseUrl}Account/roles`);
}

getStudentById(studentId: string): Observable<IStudent> {
  return this.http.get<IStudent>(`${this.controllerUrl}/${studentId}`);
}

getDashboardStats():Observable<DashboardStats>{

  return this.http.get<DashboardStats>(`${this.controllerUrl}/statistics`)
}


  createStudent(student : IStudentUpdate): Observable<IStudent> {
    return this.http.post<IStudent>(this.controllerUrl, student);
  }

  deleteStudentById(id: string): Observable<void>  {
    return this.http.delete<void>(`${this.controllerUrl}/${encodeURIComponent(String(id))}`);
  }

 updateStudent(id: string, student: IStudentUpdate): Observable<IStudent> {
  return this.http.put<IStudent>(`${this.controllerUrl}/${id}`, student);
}

}

 