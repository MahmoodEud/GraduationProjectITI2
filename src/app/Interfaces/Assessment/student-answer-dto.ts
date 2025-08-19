export interface StudentAnswerDto {
  questionId: number;
  questionText: string;
  selectedChoiceId: number;
  isCorrect: boolean;
}