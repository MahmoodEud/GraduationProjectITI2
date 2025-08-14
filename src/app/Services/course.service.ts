import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from './register/environment';
import { Course } from '../Interfaces/ICourse';
import { catchError, Observable, throwError } from 'rxjs';
import { IPagedResult } from '../Interfaces/ipaged-result';
import { CourseContent } from '../Interfaces/course-content';
import { DashboardStats } from '../Interfaces/DashboardStats';
import { CourseStats } from '../Interfaces/course-stats';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;              
  controllerUrl = `${this.baseUrl}Course`; 
  // controllerNative = `${this.baseUrl}Course`; 

  getCourses(
    search?: string,
    status?: string,
    category?: string,
    year?: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<IPagedResult<Course>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search.trim());
    if (status) params = params.set('status', status);
    if (category) params = params.set('category', category.trim());

    if (year) {
      const yearMap: { [key: string]: number } = {
        'FirstYear': 1,
        'SecondYear': 2,
        'ThirdYear': 3,
      };
      const yearValue = yearMap[year];
      if (yearValue !== undefined) {
        params = params.set('year', yearValue.toString());
      }
    }

    return this.http.get<IPagedResult<Course>>(this.controllerUrl, { params });
  }

 

  getCourseById(id: number) { 
    return this.http.get<Course>(`${this.controllerUrl}/${id}`); 
  }

  createCourse(form: FormData): Observable<Course> {
    return this.http.post<Course>(this.controllerUrl, form);
  }
  
  deleteCourseById(id: number): Observable<any> {
    return this.http.delete(`${this.controllerUrl}/${id}`);
  }

  updateCourse(id: number, formData: FormData): Observable<Course> {
    return this.http.put<Course>(`${this.controllerUrl}/${id}`, formData);
  }

 getCourseStats(): Observable<CourseStats> {
    return this.http.get<CourseStats>(`${this.controllerUrl}/stats`);
  }

  // getCourseContent(id: number): Observable<CourseContent> {
  //   return this.http.get<CourseContent>(`${this.controllerUrl}/${id}/content`);
  // }
 getCourseContent(id: number): Observable<CourseContent> {
    return this.http.get<CourseContent>(`${this.controllerUrl}/${id}/content`);
  }

  enrollInCourse(courseId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${courseId}`, {}).pipe(
      catchError(err => {
        return throwError(() => new Error(err.error?.message || 'Failed to enroll'));
      })
    );
  }
}

// return this.http.post(`${this.apiUrl}/${courseId}`, {}).pipe(
//       catchError(err => {
//         return throwError(() => new Error(err.error?.message || 'Failed to enroll'));
//       })
//     );
//   } 

