import { Component, inject, OnInit } from '@angular/core';
import { AttemptsTimeSeriesDto } from '../../../../../Interfaces/Reports/attempts-time-series-dto';
import { ReportsService } from '../../../../../Services/Reports/reports.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attempts-activity',
  standalone: true,
  imports: [FormsModule,RouterLink,CommonModule],
  templateUrl: './attempts-activity.component.html',
  styleUrl: './attempts-activity.component.css'
})
export class AttemptsActivityComponent implements OnInit {
private api = inject(ReportsService);

  loading = true;
  error: string | null = null;
  rows: AttemptsTimeSeriesDto[] = [];
  assessmentId?: number;
  days = 30;

  ngOnInit(): void { this.load(); }

  load() {
    this.loading = true;
    this.api.getAttemptsTimeSeries(this.assessmentId, this.days).subscribe({
      next: d => { this.rows = d; this.loading = false; },
      error: _ => { this.error = 'فشل تحميل النشاط'; this.loading = false; }
    });
  }

  // في الكمبوننت
trackByDay(index: number, item: any): any {
  return item.day;
}

getTotalAttempts(): number {
  return this.rows.reduce((sum, row) => sum + row.attempts, 0);
}

getAverageAttempts(): number {
  if (this.rows.length === 0) return 0;
  return Math.round(this.getTotalAttempts() / this.rows.length);
}

getMaxAttempts(): number {
  if (this.rows.length === 0) return 0;
  return Math.max(...this.rows.map(row => row.attempts));
}

getPercentage(attempts: number): number {
  const max = this.getMaxAttempts();
  return max === 0 ? 0 : Math.round((attempts / max) * 100);
}

getAttemptsClass(attempts: number): string {
  const max = this.getMaxAttempts();
  const percentage = max === 0 ? 0 : (attempts / max) * 100;
  
  if (percentage >= 70) return 'attempts-high';
  if (percentage >= 40) return 'attempts-medium';
  return 'attempts-low';
}
}
