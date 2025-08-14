import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from './register/environment';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Course } from '../Interfaces/ICourse';
import { CourseEnrollmentService } from './course-enrollment.service';

@Injectable({
  providedIn: 'root'
})
export class StudentCourseService {

  constructor() { }
  private http = inject(HttpClient);
  private enrollmentService = inject(CourseEnrollmentService);

  private baseUrl = environment.apiUrl;
  private controllerUrl = `${this.baseUrl}student-courses`;
  private adminApiUrl = `${this.baseUrl}admin`;

  // ! Enroll in Free Course
enrollInCourse(courseId: number): Observable<string> {
    return this.http.post(`${this.controllerUrl}/${courseId}`, {}, { responseType: 'text' }).pipe(
      tap(() => this.refreshEnrolledCourses()),
      catchError(err => throwError(() => err))
    );
  }
  // !Unroll in Free Courses
unenrollFromCourse(courseId: number): Observable<string> {
    return this.http.delete(`${this.controllerUrl}/Delete/${courseId}`, { responseType: 'text' }).pipe(
      tap(() => this.refreshEnrolledCourses()),
      catchError(err => throwError(() => err))
    );
  }

  // !GetMyCourse
getMyCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.controllerUrl}/my`).pipe(
      tap(courses => this.enrollmentService.updateEnrolledCourses(courses)),
      catchError(err => throwError(() => err))
    );
  }
  getUserCourses(userId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.adminApiUrl}/users/${userId}/courses`).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to fetch user courses')))
    );
  }
  private refreshEnrolledCourses(): void {
    this.getMyCourses().subscribe({
      next: (courses) => this.enrollmentService.updateEnrolledCourses(courses),
      error: (err) => console.error('Error refreshing enrolled courses:', err)
    });
  }
  

// ! Admin Enroll Student in Course
adminEnroll(studentId: number, courseId: number): Observable<string> {
  const request = { studentId, courseId }; // استخدام studentId وcourseId مباشرة زي Postman
  return this.http.post(`${this.controllerUrl}/admin/enroll`, request, { responseType: 'text' }).pipe(
    tap(() => this.refreshEnrolledCourses()),
    catchError(err => throwError(() => new Error(err.error?.message || 'فشل تسجيل الطالب')))
  );
}

// ! Admin Unenroll Student from Course
adminUnenroll(studentId: number, courseId: number): Observable<string> {
  return this.http.delete(`${this.controllerUrl}/admin/${courseId}/unenroll/${studentId}`, { responseType: 'text' }).pipe(
    tap(() => this.refreshEnrolledCourses()),
    catchError(err => throwError(() => new Error(err.error?.message || 'فشل إلغاء تسجيل الطالب')))
  );
}
}
  // private http = inject(HttpClient);
  // private baseUrl = environment.apiUrl;
  // private controllerUrl = `${this.baseUrl}student-courses`;

  // تسجيل الطالب في كورس مجاني
  // enrollInCourse(courseId: number): Observable<string> {
  //   return this.http.post(`${this.controllerUrl}/${courseId}`, {}, { responseType: 'text' })
  //     .pipe(
  //       catchError(err => {
  //         console.error('Error enrolling in course:', err);
  //         return throwError(() => err); // نرجّع الإيرور كما هو
  //       })
  //     );
  // }

  // // إلغاء تسجيل الطالب من كورس
  // unenrollFromCourse(courseId: number): Observable<string> {
  //   return this.http.delete(`${this.controllerUrl}/Delete/${courseId}`, { responseType: 'text' })
  //     .pipe(
  //       catchError(err => {
  //         console.error('Error unenrolling from course:', err);
  //         return throwError(() => err); // نرجّع الإيرور كما هو
  //       })
  //     );
  // }

//   // جلب كورسات الطالب
//   getMyCourses(): Observable<Course[]> {
//     return this.http.get<Course[]>(`${this.controllerUrl}/my`)
//       .pipe(
//         catchError(err => {
//           console.error('Error fetching my courses:', err);
//           return throwError(() => err); // نرجّع الإيرور كما هو
//         })
//       );
//   }
// }
