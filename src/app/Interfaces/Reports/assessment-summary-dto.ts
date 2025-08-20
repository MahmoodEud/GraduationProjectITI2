export interface AssessmentSummaryDto {
  assessmentId: number;
  assessmentName: string;
  attemptsCount: number;
  uniqueStudents: number;
  averageScore: number;
  medianScore: number;
  passRate: number;
  lastAttemptAt?: string | null;
}
