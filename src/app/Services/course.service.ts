import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from './register/environment';
import { Course } from '../Interfaces/ICourse';
import { CourseUpdate } from '../Interfaces/ICourseUpdate';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;              
  controllerUrl = `${this.baseUrl}Course`; 

   getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.controllerUrl); 
  }

getCourseById(id: number) { return this.http.get(`${this.controllerUrl}/${id}`); }

  createCourse(form: FormData) {
    return this.http.post<any>(this.controllerUrl, form);
  }


deleteCourseById(id: number) { return this.http.delete(`${this.controllerUrl}/${id}`); }

updateCourse(id: number, form: FormData) { return this.http.put(`${this.controllerUrl}/${id}`, form); }

}
