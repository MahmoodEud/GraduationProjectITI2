import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from './register/environment';
import { Course } from '../Interfaces/ICourse';
import { CourseUpdate } from '../Interfaces/ICourseUpdate';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  controllerUrl = this.baseUrl + 'Course/'

  getAllCourses() {
    return this.http.get(this.controllerUrl);
  }

  getCourseById(courseId: number) {
    return this.http.get(this.controllerUrl + courseId);
  }

  createCourse(course: CourseUpdate) {
    return this.http.post(this.controllerUrl, course);
  }

  deleteCourseById(id: number) {
    return this.http.delete(this.controllerUrl + id);
  }

  updateCourse(id: number, course: CourseUpdate) {
    return this.http.put<Course>(this.controllerUrl + id, course);
  }
}
