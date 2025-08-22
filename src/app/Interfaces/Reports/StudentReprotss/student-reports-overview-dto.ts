import { RecentScorePointDto } from "./recent-score-point-dto";

export interface StudentReportsOverviewDto {
  totalAttempts: number;
  distinctAssessments: number;
  averageScore: number;       
  passRate: number;           
  totalCorrect: number;
  totalWrong: number;
  improvementPoints: number; 
  recentScores: RecentScorePointDto[];
}
