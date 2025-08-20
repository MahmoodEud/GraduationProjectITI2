import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../register/environment';
import { AssessmentSummaryDto } from '../../Interfaces/Reports/assessment-summary-dto';
import { QuestionDifficultyDto } from '../../Interfaces/Reports/question-difficulty-dto';
import { StudentPerformanceDto } from '../../Interfaces/Reports/student-performance-dto';
import { AttemptsTimeSeriesDto } from '../../Interfaces/Reports/attempts-time-series-dto';

function joinUrl(...parts: (string|number)[]) {
  return parts.map(p => String(p).replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/');
}
@Injectable({
  providedIn: 'root'
})

export class ReportsService {

private http = inject(HttpClient);
  private base = joinUrl(environment.apiUrl, 'admin/reports');

  getAssessmentsSummary() {
    return this.http.get<AssessmentSummaryDto[]>(joinUrl(this.base, 'assessments-summary'));
  }

  getQuestionDifficulty(assessmentId: number) {
    return this.http.get<QuestionDifficultyDto[]>(joinUrl(this.base, 'assessment', assessmentId, 'questions-difficulty'));
  }

  getStudentsPerformance(assessmentId?: number) {
    let params = new HttpParams();
    if (assessmentId) params = params.set('assessmentId', assessmentId);
    return this.http.get<StudentPerformanceDto[]>(joinUrl(this.base, 'students-performance'), { params });
  }

  getAttemptsTimeSeries(assessmentId?: number, days: number = 30) {
    let params = new HttpParams().set('days', days);
    if (assessmentId) params = params.set('assessmentId', assessmentId);
    return this.http.get<AttemptsTimeSeriesDto[]>(joinUrl(this.base, 'attempts-timeseries'), { params });
  }}
