import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { StudentAttemptsService } from '../../../../../../../../Services/Assessments/student-attempts.service';
import { AttemptDto } from '../../../../../../../../Interfaces/Assessment/AttemptDto';

@Component({
  selector: 'app-quiz-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-summary.component.html',
  styleUrls: ['./quiz-summary.component.css']
})
export class QuizSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private attemptsApi = inject(StudentAttemptsService);

  attempt = signal<AttemptDto | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('attemptId');
    const id = Number(idParam);

    if (!Number.isFinite(id) || id <= 0) {
      this.error.set('رقم المحاولة غير صالح');
      this.isLoading.set(false);
      this.toastr.error('رقم المحاولة غير صالح');
      this.router.navigateByUrl('/');
      return;
    }

    try {
      const mine: AttemptDto[] = await firstValueFrom(this.attemptsApi.getAttemptsByStudent());
      const attempt = mine.find((a: AttemptDto) => a.id === id);
      if (!attempt) {
        throw new Error('محاولة غير موجودة');
      }
      this.attempt.set(attempt);
      this.isLoading.set(false);
    } catch (e: any) {
      this.error.set(e?.message || 'تعذر تحميل الملخص');
      this.isLoading.set(false);
      // this.toastr.error(this.error());
      this.router.navigateByUrl('/');
    }
  }

  back() {
    // history.length > 1 ? history.back() : this.router.navigateByUrl('/');
    const attempt = this.attempt();
    this.router.navigate(['/quiz', attempt?.lessonId]);
    
  }
}