import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AttemptDto } from '../../Interfaces/Assessment/AttemptDto';

@Injectable({
  providedIn: 'root'
})
export class StudentAttemptsService {
  private readonly apiUrl = 'http://localhost:5000/api/StudentAttempts';
  constructor(private http: HttpClient) {}

  startAttempt(assessmentId: number): Observable<AttemptDto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json'
    });
    return this.http.post<AttemptDto>(
      `${this.apiUrl}/${assessmentId}/start`,
      { assessmentId },
      { headers }
    );
  }

  getAttemptsByStudent(): Observable<AttemptDto[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });
    return this.http.get<AttemptDto[]>(`${this.apiUrl}/mine`, { headers });
  }

  submitAttempt(attemptId: number, responses: any[]): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      'Content-Type': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/${attemptId}/submit`, responses, { headers });
  }
}