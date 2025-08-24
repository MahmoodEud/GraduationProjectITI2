import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../register/environment'; // نفس المسار اللي عندك
import { EnrollmentFilter } from '../../Interfaces/Enrollments/enrollment-filter';
import { EnrollmentsSearchResult } from '../../Interfaces/Enrollments/enrollments-search-result';

@Injectable({ providedIn: 'root' })
export class EnrollmentsService {
  private readonly base = environment.apiUrl.replace(/\/+$/, ''); // "http://localhost:5000/api"

  constructor(private http: HttpClient) {}

  search(filter: EnrollmentFilter): Observable<EnrollmentsSearchResult> {
    let params = new HttpParams();

    const add = (k: string, v: any) => {
      if (v === undefined || v === null || v === '') return;
      params = params.set(k, String(v));
    };

    add('search', filter.search);
    add('studentYear', filter.studentYear);
    add('courseId', filter.courseId);
    add('category', filter.category);
    add('accessType', filter.accessType);
    add('dateFrom', filter.dateFrom instanceof Date ? filter.dateFrom.toISOString() : filter.dateFrom);
    add('dateTo', filter.dateTo instanceof Date ? filter.dateTo.toISOString() : filter.dateTo);
    add('page', filter.page ?? 1);
    add('pageSize', filter.pageSize ?? 20);
    add('sortBy', filter.sortBy ?? 'enrolledAt');
    add('sortDir', filter.sortDir ?? 'desc');

    return this.http.get<EnrollmentsSearchResult>(`${this.base}/enrollments`, { params });
  }
}
