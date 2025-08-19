import { QuestionDto } from "./question-dto";

export interface AssessmentDto {
  id: number;
  maxAttempts?: number;
  passingScore: number;
  timeLimit?: number;
  startingAt: string;
  lessonId?: number;
  lessonName?: string;
  questionCount: number;
  questions: QuestionDto[];
}