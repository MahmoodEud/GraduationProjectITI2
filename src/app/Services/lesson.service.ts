import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from './register/environment';
import { LessonUpdate } from '../Interfaces/ILessonUpdate';
import { LessonFilter } from '../Interfaces/ILessonFilter';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  controllerUrl = this.baseUrl + 'Lesson/'

  getAllLessons(pageNumber: number, pageSize: number) {
    return this.http.get(this.controllerUrl + 'All/' + pageNumber.toString() + pageSize.toString());
  }

  getLessonById(id: number) {
    return this.http.get(this.controllerUrl + id)
  }

  updateLesson(id: number, lesson: LessonUpdate) {
    return this.http.put(this.controllerUrl + id, lesson);
  }

  updateLessonByTitle(title: string, lesson: LessonUpdate) {
    return this.http.put(this.controllerUrl + 'by-title/' + title, lesson);
  }

  filterLesson(filter: LessonFilter) {
    return this.http.post(this.controllerUrl + 'filter/', filter);
  }

  createLesson(lesson: LessonUpdate) {
    return this.http.post(this.controllerUrl, lesson);
  }

  deleteLesson(id: number) {
    return this.http.delete(this.controllerUrl + id);
  }
}
