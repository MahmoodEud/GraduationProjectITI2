import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ILessonProgressUpsert } from '../Interfaces/progress/ilesson-progress-upsert';
import { ILessonProgress } from '../Interfaces/progress/ilesson-progress';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from './register/environment';
import { ICourseProgress } from '../Interfaces/progress/icourse-progress';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + 'progress/';

  upsertLessonProgress(lessonId: number, dto: ILessonProgressUpsert): Observable<ILessonProgress> {
    return this.http.put<ILessonProgress>(`${this.baseUrl}lessons/${lessonId}`, dto).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to upsert lesson progress')))
    );
  }

  getLessonProgress(lessonId: number): Observable<ILessonProgress> {
    return this.http.get<ILessonProgress>(`${this.baseUrl}lessons/${lessonId}`).pipe(
      catchError(err => throwError(() => new Error(err.error?.message || 'Failed to fetch lesson progress')))
    );
  }

getCourseProgress(courseId: number): Observable<ICourseProgress> {
  return this.http.get<ICourseProgress>(`${this.baseUrl}courses/${courseId}`).pipe(
    catchError(err => throwError(() => new Error(err.error?.message || 'Failed to fetch course progress')))
  );

}}
