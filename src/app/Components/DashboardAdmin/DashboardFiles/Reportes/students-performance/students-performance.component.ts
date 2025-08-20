import { Component, inject, OnInit } from '@angular/core';
import { StudentPerformanceDto } from '../../../../../Interfaces/Reports/student-performance-dto';
import { ReportsService } from '../../../../../Services/Reports/reports.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-students-performance',
  standalone: true,
  imports: [FormsModule,RouterLink,CommonModule],
  templateUrl: './students-performance.component.html',
  styleUrl: './students-performance.component.css'
})
export class StudentsPerformanceComponent implements OnInit{
private api = inject(ReportsService);

  loading = true;
  error: string | null = null;
  rows: StudentPerformanceDto[] = [];
  assessmentId?: number;

  ngOnInit(): void { this.load(); }

  load() {
    this.loading = true;
    this.api.getStudentsPerformance(this.assessmentId).subscribe({
      next: d => { this.rows = d; this.loading = false; },
      error: _ => { this.error = 'فشل تحميل أداء الطلاب'; this.loading = false; }
    });
  }
}
