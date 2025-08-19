import { ChoiceDto } from "./choice-dto";

export interface QuestionDto {
  id: number;
  header: string;
  body: string;
  correctAnswer: string;
  quizId: number;
  choices: ChoiceDto[];
}