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
}
