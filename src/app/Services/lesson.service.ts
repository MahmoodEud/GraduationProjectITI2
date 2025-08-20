import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from './register/environment';
import { LessonUpdate } from '../Interfaces/ILessonUpdate';
import { LessonFilter } from '../Interfaces/ILessonFilter';
import { catchError, Observable, throwError } from 'rxjs';
import { IPagedResult } from '../Interfaces/ipaged-result';
import { ILesson } from '../Interfaces/ILesson';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  controllerUrl = this.baseUrl + 'Lesson/'

getAllLessons(pageNumber: number, pageSize: number): Observable<IPagedResult<ILesson>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<IPagedResult<ILesson>>(`${this.controllerUrl}all`, { params }).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to fetch lessons')))
    );
  }
    getLessonById(id: number): Observable<LessonUpdate> {
        return this.http.get<LessonUpdate>(`${this.controllerUrl}${id}`);
    }
    getByCourse(courseId: number) {
      return this.http.get<ILesson[]>(`${this.controllerUrl}by-course/${courseId}`);
    }
  createLesson(lesson: LessonUpdate): Observable<any> {
    return this.http.post(`${this.controllerUrl}`, lesson).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to create lesson')))
    );
  }

   getCourses(): Observable<any[]> {
      return this.http.get<any[]>(`${this.baseUrl}Course`);
    }

  updateLesson(id: number, lesson: LessonUpdate): Observable<any> {
    return this.http.put(`${this.controllerUrl}${id}`, lesson).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to update lesson')))
    );
  }

  deleteLesson(id: number): Observable<any> {
    return this.http.delete(`${this.controllerUrl}${id}`).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to delete lesson')))
    );
  }
  filterLessons(filter: LessonFilter): Observable<ILesson[]> {
  return this.http.post<ILesson[]>(`${this.controllerUrl}filter`, filter).pipe(
    catchError(err => throwError(() => new Error(err.error?.message || 'Failed to filter lessons')))
  );
}
updateLessonByTitle(title: string, lesson: LessonUpdate): Observable<any> {
  return this.http.put(`${this.controllerUrl}by-title/${title}`, lesson).pipe(
    catchError(err => throwError(() => new Error(err.error?.message || 'Failed to update lesson by title')))
  );
}

  // getLessonById(id: number) {
  //   return this.http.get(this.controllerUrl + id)
  // }

  // updateLesson(id: number, lesson: LessonUpdate) {
  //   return this.http.put(this.controllerUrl + id, lesson);
  // }

  // updateLessonByTitle(title: string, lesson: LessonUpdate) {
  //   return this.http.put(this.controllerUrl + 'by-title/' + title, lesson);
  // }

  // filterLesson(filter: LessonFilter) {
  //   return this.http.post(this.controllerUrl + 'filter/', filter);
  // }

  // createLesson(lesson: LessonUpdate) {
  //   return this.http.post(this.controllerUrl, lesson);
  // }

  // deleteLesson(id: number) {
  //   return this.http.delete(this.controllerUrl + id);
  // }
}
