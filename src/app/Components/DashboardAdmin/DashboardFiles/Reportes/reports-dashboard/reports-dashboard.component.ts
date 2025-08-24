import { Component, inject } from '@angular/core';
import { ReportsService } from '../../../../../Services/Reports/reports.service';
import { AssessmentSummaryDto } from '../../../../../Interfaces/Reports/assessment-summary-dto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [FormsModule,CommonModule,RouterLink],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.css'
})
export class ReportsDashboardComponent {
  private api = inject(ReportsService);
  loading = true;
  error: string | null = null;
  summary: AssessmentSummaryDto[] = [];

  ngOnInit(): void {
    this.api.getAssessmentsSummary().subscribe({
      next: d => { this.summary = d; this.loading = false; },
      error: _ => { this.error = 'فشل تحميل ملخص الامتحانات'; this.loading = false; }
    });
  }
  // في الكمبوننت
trackByAssessmentId(index: number, item: any): any {
  return item.assessmentId;
}

getScoreClass(score: number): string {
  if (score >= 85) return 'score-excellent';
  if (score >= 65) return 'score-good';
  return 'score-poor';
}

getPassRateClass(passRate: number): string {
  return passRate >= 50 ? 'pass-rate-high' : 'pass-rate-low';
}
}
