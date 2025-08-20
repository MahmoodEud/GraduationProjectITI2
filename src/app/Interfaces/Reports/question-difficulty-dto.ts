
export interface QuestionDifficultyDto {
  questionId: number;
  header: string;
  totalAnswers: number;
  wrongCount: number;
  wrongRate: number;
}