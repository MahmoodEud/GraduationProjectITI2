import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { environment } from '../register/environment';
import { AssessmentDto } from '../../Interfaces/Assessment/AssessmentDto';
import { QuestionDto } from '../../Interfaces/Assessment/question-dto';

function joinUrl(...parts: (string | number)[]) {
  return parts
    .map(p => String(p).replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
}

@Injectable({ providedIn: 'root' })
export class AssessmentsService {
  private http = inject(HttpClient);

  private base = joinUrl(environment.apiUrl, 'Assessment');

  private mapAssessment(api: any): AssessmentDto {
    return {
      id: api.id,
      maxAttempts: api.maxAttempts ?? api.max_Attempts ?? null,
      passingScore: api.passingScore ?? api.passing_Score,
      timeLimit: api.timeLimit ?? api.time_Limit ?? null,
      startingAt: api.startingAt ?? api.starting_At,
      lessonId: api.lessonId ?? null,
      lessonName: api.lessonName ?? '',
      questionCount: api.questionCount ?? (api.questions?.length ?? 0),
      questions: (api.questions ?? []).map((q: any) => ({
        id: q.id,
        header: q.header,
        body: q.body,
        correctAnswer: q.correctAnswer,
        quizId: q.quizId,
        choices: (q.choices ?? []).map((c: any) => ({
          id: c.id,
          choiceText: c.choiceText,
          isCorrect: c.isCorrect,
          questionId: c.questionId,
        })),
      })),
    };
  }

  getByLesson(lessonId: number) {
    const url = `${this.base}/lesson/${lessonId}`;
    return this.http.get<any>(url).pipe(map(a => this.mapAssessment(a)));
  }

  getById(id: number) {
    const url = `${this.base}/${id}`;
    return this.http.get<any>(url).pipe(map(a => this.mapAssessment(a)));
  }

  getQuestionsByAssessment(assessmentId: number) {
    const url = `${this.base}/${assessmentId}`;
    return this.http.get<any>(url).pipe(
      map(a => this.mapAssessment(a)),
      map((assessment: AssessmentDto) => assessment.questions || [] as QuestionDto[])
    );
  }
}