import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentReportsService } from '../../../../../Services/Reports/student-reports.service';
import { StudentAttemptsService } from '../../../../../Services/Assessments/student-attempts.service';
import { StudentReportDto } from '../../../../../Interfaces/Reports/StudentReprotss/student-report-dto';
import { AttemptDto } from '../../../../../Interfaces/Assessment/AttemptDto';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-report-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-report-details.component.html',
  styleUrl: './student-report-details.component.css'
})
export class StudentReportDetailsComponent implements OnInit{
 private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportsApi = inject(StudentReportsService);
  private attemptsApi = inject(StudentAttemptsService);

  loading = signal(true);
  error   = signal<string|null>(null);

  report  = signal<StudentReportDto|null>(null);
  attempt = signal<AttemptDto|null>(null);

  showOnlyWrong = signal(false);

  correctCount = computed(() => this.report()?.questions.filter(q => q.isCorrect).length ?? 0);
  wrongCount   = computed(() => this.report()?.questions.filter(q => !q.isCorrect).length ?? 0);
  answeredCount = computed(() => this.correctCount() + this.wrongCount());
  unansweredCount = computed(() => Math.max((this.report()?.totalQuestions ?? 0) - this.answeredCount(), 0));

  startedAt = computed(() => this.attempt()?.startedAt ?? null);
  submittedAt = computed(() => this.attempt()?.submittedAt ?? null);
  durationLabel = computed(() => this.formatDuration(this.startedAt(), this.submittedAt()));

  finalPercent = computed(() => Math.round(this.report()?.score ?? 0)); 

  async ngOnInit() {
    try {
      const attemptId = Number(this.route.snapshot.paramMap.get('attemptId'));
      if (!Number.isFinite(attemptId) || attemptId <= 0) {
        this.error.set('رقم المحاولة غير صالح'); this.loading.set(false); return;
      }

      const rep = await firstValueFrom(this.reportsApi.getByAttempt(attemptId));
      this.report.set(rep);

      const mine = await firstValueFrom(this.attemptsApi.getAttemptsByStudent());
      const att = mine.find(a => a.id === attemptId) || null;
      this.attempt.set(att);

      this.loading.set(false);
    } catch (e: any) {
      this.error.set(e?.message || 'تعذر تحميل التقرير'); 
      this.loading.set(false);
    }
  }

  back() {
    if (history.length > 1) history.back();
    else this.router.navigateByUrl('/main');
  }

  backToQuiz() {
    const lessonId = this.attempt()?.lessonId;
    if (lessonId) this.router.navigate(['/quiz', lessonId]);
    else this.back();
  }

  private formatDuration(startIso: string | null, endIso: string | null) {
    if (!startIso || !endIso) return '—';
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    if (isNaN(start) || isNaN(end) || end < start) return '—';
    const totalSec = Math.floor((end - start) / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h) return `${h}س ${m}د ${s}ث`;
    if (m) return `${m}د ${s}ث`;
    return `${s}ث`;
  }

  sparkPath(width = 160, height = 40, pad = 4): string {
    return '';
  }
}
