export interface AttemptDto {
  id: number;
  studentId: number;
  assessmentId: number;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string | null;
  timeLimitMinutes?: number | null;
  score?: number;
  lessonId?: number;
  isGraded: boolean;
  remainingAttempts?: number | null;
}