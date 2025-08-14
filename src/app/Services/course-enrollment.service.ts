import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Course } from '../Interfaces/ICourse';

@Injectable({
  providedIn: 'root'
})
export class CourseEnrollmentService {
  private enrolledCoursesSubject = new BehaviorSubject<Course[]>([]);
  enrolledCourses$: Observable<Course[]> = this.enrolledCoursesSubject.asObservable();

  updateEnrolledCourses(courses: Course[]): void {
    this.enrolledCoursesSubject.next(courses);
  }
}
