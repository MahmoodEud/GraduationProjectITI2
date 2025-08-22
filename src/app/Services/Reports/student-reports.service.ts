import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../register/environment';
import { StudentReportsOverviewDto } from '../../Interfaces/Reports/StudentReprotss/student-reports-overview-dto';
import { StudentAttemptSummaryDto } from '../../Interfaces/Reports/StudentReprotss/student-attempt-summary-dto';
import { StudentReportDto } from '../../Interfaces/Reports/StudentReprotss/student-report-dto';


function joinUrl(...parts: (string|number)[]) {
  return parts.map(p => String(p).replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/');
}

@Injectable({ providedIn: 'root' })
export class StudentReportsService {
  private http = inject(HttpClient);
  private base = joinUrl(environment.apiUrl, 'ReportsStudent');

  getOverview(recent = 10) {
    let params = new HttpParams().set('recent', recent);
    return this.http.get<StudentReportsOverviewDto>(joinUrl(this.base, 'overview'), { params });
  }

  getMyAttempts() {
    return this.http.get<StudentAttemptSummaryDto[]>(joinUrl(this.base, 'my'));
  }

  getByAttempt(attemptId: number) {
    return this.http.get<StudentReportDto>(joinUrl(this.base, 'attempt', attemptId));
  }
}
