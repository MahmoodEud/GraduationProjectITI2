import { StudentAnswerDto } from "./student-answer-dto";

export interface AttemptDetailDto {
  attemptId: number;
  assessmentId: number;
  startedAt: string;
  submittedAt?: string;
  score: number;
  answers: StudentAnswerDto[];
}