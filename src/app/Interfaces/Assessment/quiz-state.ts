export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<number, number>;
  timeRemaining?: number;
  isSubmitted: boolean;
}