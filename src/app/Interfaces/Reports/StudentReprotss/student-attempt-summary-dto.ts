export interface StudentAttemptSummaryDto {
  attemptId: number;
  assessmentId: number;
  assessmentName: string;
  score: number;              
  totalQuestions: number;
  percentage: number;         
  isPassed: boolean;
  startedAt?: string;
  submittedAt?: string | null;
}
