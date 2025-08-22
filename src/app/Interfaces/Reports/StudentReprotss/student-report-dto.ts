export interface StudentReportDto {
attemptId: number;
  assessmentId: number;
  assessmentName: string;
  score: number;              
  totalQuestions: number;
  percentage: number;         
  isPassed: boolean;
  questions: {
    questionId: number;
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}
