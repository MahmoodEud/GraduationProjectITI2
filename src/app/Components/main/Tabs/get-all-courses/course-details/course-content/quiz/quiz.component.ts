import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AssessmentsService } from '../../../../../../../Services/Assessments/assessments.service';
import { StudentAttemptsService } from '../../../../../../../Services/Assessments/student-attempts.service';
import { CommonModule } from '@angular/common';
import { AttemptDto } from '../../../../../../../Interfaces/Assessment/AttemptDto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private assessApi = inject(AssessmentsService);
  private attemptsApi = inject(StudentAttemptsService);

  lessonId = signal<number | null>(null);
  assessment = signal<any | null>(null);
  isStarting = signal(false);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Computed property for question count
  questionCount = computed(() =>
    this.assessment()?.questionCount ??
    this.assessment()?.questions?.length ??
    0
  );

  // Computed property to check if quiz is not available yet
  notAvailableYet = computed(() => {
    const start = this.assessment()?.startingAt ?? null;
    const timeLimit = this.assessment()?.timeLimit ?? null;
    const now = Date.now();
    
    if (!start) return false;
    
    const startTime = new Date(start).getTime();
    if (startTime > now) return true; // Not started yet
    
    if (timeLimit) {
      const endTime = startTime + (timeLimit * 60 * 1000);
      return now > endTime; // Expired
    }
    
    return false;
  });

  // Computed property to check if quiz can start
  canStart = computed(() =>
    !!this.assessment()?.id &&
    this.questionCount() > 0 &&
    !this.notAvailableYet() &&
    !this.isStarting()
  );

  // Computed property for end time
  endTime = computed(() => {
    const start = this.assessment()?.startingAt ?? null;
    const timeLimit = this.assessment()?.timeLimit ?? null;
    if (start && timeLimit) {
      const startTime = new Date(start).getTime();
      return new Date(startTime + (timeLimit * 60 * 1000)).toISOString();
    }
    return null;
  });

  // Computed property to check if quiz has not started
  hasNotStarted = computed(() => {
    const start = this.assessment()?.startingAt ?? null;
    if (!start) return false;
    return Date.now() < new Date(start).getTime();
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('lessonId'));
    if (!Number.isFinite(id) || id <= 0) {
      this.error.set('رقم الدرس غير صالح');
      this.isLoading.set(false);
      this.toastr.error('رقم الدرس غير صالح');
      return;
    }
    this.lessonId.set(id);
    this.loadAssessment();
  }

  private loadAssessment(): void {
    if (!this.lessonId()) return;
    this.isLoading.set(true);
    this.error.set(null);

    this.assessApi.getByLesson(this.lessonId()!).subscribe({
      next: (raw: any) => {
        const normalized = {
          ...raw,
          timeLimit: raw?.timeLimit ?? raw?.time_Limit ?? null,
          startingAt: raw?.startingAt ?? raw?.starting_At ?? null,
          maxAttempts: raw?.maxAttempts ?? raw?.max_Attempts ?? null
        };

        this.assessment.set(normalized);
        this.isLoading.set(false);

        if (!normalized?.id) {
          this.error.set('لا يوجد كويز متاح لهذا الدرس');
          this.toastr.error('لا يوجد كويز متاح لهذا الدرس');
          return;
        }

        const qCount = normalized?.questions?.length ?? normalized?.questionCount ?? 0;
        if (qCount === 0) {
          this.error.set('هذا الكويز لا يحتوي على أسئلة');
          this.toastr.error('هذا الكويز لا يحتوي على أسئلة');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 404) {
          this.error.set('لا يوجد كويز متاح لهذا الدرس');
          this.toastr.error('لا يوجد كويز متاح لهذا الدرس');
        } else {
          this.error.set('فشل في تحميل بيانات الكويز');
          this.toastr.error('فشل في تحميل بيانات الكويز');
          console.error('خطأ في تحميل التقييم:', err);
        }
      }
    });
  }

  startQuiz(): void {
    const a = this.assessment();
    if (!a || !this.canStart()) {
      this.toastr.error('لا يمكن بدء الكويز الآن');
      return;
    }

    // Ensure assessment ID is valid
    if (!a.id || typeof a.id !== 'number' || a.id <= 0) {
      this.toastr.error('معرف الكويز غير صالح');
      this.error.set('معرف الكويز غير صالح');
      return;
    }

    this.isStarting.set(true);
    this.error.set(null);

    // Send request to start attempt
    this.attemptsApi.startAttempt(a.id).subscribe({
      next: (attempt: AttemptDto) => {
        this.isStarting.set(false);
        if (!attempt?.id || typeof attempt.id !== 'number') {
          this.toastr.error('فشل في إنشاء محاولة جديدة');
          this.error.set('حدث خطأ في بدء الكويز');
          return;
        }
        this.toastr.success('تم بدء الكويز بنجاح!');
        this.router.navigate(['/quiz/attempt', attempt.id]);
      },
      error: (err: HttpErrorResponse) => {
        this.isStarting.set(false);
        console.error('خطأ في بدء المحاولة:', err); // السطر 164 تقريبًا
        let errorMessage = 'فشل في بدء المحاولة';
        if (err.status === 400) {
          errorMessage = err.error?.message || 'طلب غير صالح: تحقق من بيانات الكويز أو الاتصال بالخادم';
        } else if (err.status === 401) {
          errorMessage = 'غير مصرح: تحقق من تسجيل الدخول';
          this.router.navigate(['/login']);
        } else if (err.status === 404) {
          errorMessage = 'الكويز غير موجود';
        } else if (err.status === 403) {
          errorMessage = 'غير مسموح: قد تكون المحاولات قد استنفدت';
        }
        this.toastr.error(errorMessage);
        this.error.set(errorMessage);
      }
    });
  }

  retry(): void {
    this.loadAssessment();
  }
}