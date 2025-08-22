import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { StudentReportsService } from '../../../../Services/Reports/student-reports.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentAttemptsService } from '../../../../Services/Assessments/student-attempts.service';
import { AttemptDto } from '../../../../Interfaces/Assessment/AttemptDto';
import { firstValueFrom } from 'rxjs';
import { StudentReportsOverviewDto } from '../../../../Interfaces/Reports/StudentReprotss/student-reports-overview-dto';
import { StudentAttemptSummaryDto } from '../../../../Interfaces/Reports/StudentReprotss/student-attempt-summary-dto';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-student-page',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './main-student-page.component.html',
  styleUrl: './main-student-page.component.css'
})
export class MainStudentPageComponent implements OnInit {
 private reportsApi = inject(StudentReportsService);
  private router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);

  overview = signal<StudentReportsOverviewDto | null>(null);
  attempts = signal<StudentAttemptSummaryDto[]>([]);

  search = signal('');
  status = signal<'all'|'passed'|'failed'>('all');
  sortKey = signal<'date'|'score'>('date');
  sortDir = signal<'desc'|'asc'>('desc');

  rows = computed(() => {
    const q = (this.search() || '').trim().toLowerCase();
    const st = this.status();
    const key = this.sortKey();
    const dir = this.sortDir();

    let data = this.attempts().slice();

    if (q) {
      data = data.filter(r => (r.assessmentName || '').toLowerCase().includes(q));
    }
    if (st !== 'all') {
      data = data.filter(r => st === 'passed' ? r.isPassed : !r.isPassed);
    }

    data.sort((a, b) => {
      if (key === 'score') {
        const d = (a.score ?? 0) - (b.score ?? 0);
        return dir === 'asc' ? d : -d;
      } else {
        const da = new Date(a.submittedAt ?? a.startedAt ?? '').getTime() || 0;
        const db = new Date(b.submittedAt ?? b.startedAt ?? '').getTime() || 0;
        const d = da - db;
        return dir === 'asc' ? d : -d;
      }
    });

    return data;
  });

  sparkPath(width = 320, height = 64, pad = 8): string {
    const rs = this.overview()?.recentScores || [];
    if (!rs.length) return '';
    const xs = rs.map((_, i) => i);
    const ys = rs.map(d => Math.max(0, Math.min(100, d.score)));

    const minX = 0, maxX = xs[xs.length - 1] || 1;
    const minY = 0, maxY = 100;

    const sx = (x: number) =>
      pad + (width - 2 * pad) * ((x - minX) / (maxX - minX || 1));
    const sy = (y: number) =>
      height - pad - (height - 2 * pad) * ((y - minY) / (maxY - minY || 1));

    return xs.map((x, i) => `${i ? 'L' : 'M'} ${sx(x)} ${sy(ys[i])}`).join(' ');
  }

  async ngOnInit() {
    try {
      const [ov, my] = await Promise.all([
        firstValueFrom(this.reportsApi.getOverview(10)),
        firstValueFrom(this.reportsApi.getMyAttempts())
      ]);
      this.overview.set(ov);
      this.attempts.set(my);
      this.loading.set(false);
    } catch (e: any) {
      this.error.set(e?.message || 'تعذر تحميل التقارير');
      this.loading.set(false);
    }
  }

 goDetails(r: { attemptId: number }) {
  this.router.navigate(['/student-report', r.attemptId]);
}


  toggleSort(key: 'date'|'score') {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('desc');
    }
  }

  statusBadge(a: StudentAttemptSummaryDto) {
    return a.isPassed ? 'badge bg-success' : 'badge bg-danger';
  }
}
