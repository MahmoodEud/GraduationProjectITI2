import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AssessmentsService } from '../../../../../../../../Services/Assessments/assessments.service';
import { StudentAttemptsService } from '../../../../../../../../Services/Assessments/student-attempts.service';
import { QuestionDto } from '../../../../../../../../Interfaces/Assessment/question-dto';
import { firstValueFrom } from 'rxjs';
import { StudentResponseCreateDto } from '../../../../../../../../Interfaces/Assessment/student-response-create-dto';
import { CommonModule } from '@angular/common';
import { AttemptDto } from '../../../../../../../../Interfaces/Assessment/AttemptDto';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

type AnswersMap = Record<number, number>;

@Component({
  selector: 'app-quiz-attempts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-attempts.component.html',
  styleUrls: ['./quiz-attempts.component.css']
})
export class QuizAttemptsComponent implements OnInit, OnDestroy {
   private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private assessApi = inject(AssessmentsService);
  private attemptsApi = inject(StudentAttemptsService);

  attemptId = signal<number | null>(null);
  assessmentId = signal<number | null>(null);
  questions = signal<QuestionDto[]>([]);
  idx = signal(0);
  answers = signal<AnswersMap>({});
  loaded = signal(false);
  submitting = signal(false);
  assessment = signal<any | null>(null);
  timeRemaining = signal<number | null>(null); // seconds
  private timer: any = null;

  private autoSubmitted = false;
  private submittedOnce = false;

  total = computed(() => this.questions().length);
  currentQuestion = computed(() => this.questions()[this.idx()] || null);

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

  timeRemainingFormatted = computed(() => {
    const t = this.timeRemaining();
    if (t === null) return null;
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  });

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('attemptId'));
    if (!id || !Number.isFinite(id)) {
      this.toastr.error('محاولة غير صالحة');
      this.router.navigateByUrl('/');
      return;
    }
    this.attemptId.set(id);

    try {
      const mine = await firstValueFrom(this.attemptsApi.getAttemptsByStudent());
      const attempt = mine.find(a => a.id === id);
      if (!attempt) throw new Error('لم يتم العثور على المحاولة');

      if (attempt.submittedAt) {
        this.toastr.info('هذه المحاولة تم تسليمها بالفعل');
        this.router.navigate(['/quiz/summary', attempt.id]);
        return;
      }

      this.assessmentId.set(attempt.assessmentId);

      const summary = await firstValueFrom(this.assessApi.getById(attempt.assessmentId));
      this.assessment.set({
        ...summary,
        timeLimit: summary?.timeLimit ?? summary?.timeLimit ?? null,
        startingAt: summary?.startingAt ?? summary?.startingAt ?? null
      });
      const qs = await firstValueFrom(this.assessApi.getQuestionsByAssessment(attempt.assessmentId));
      this.questions.set(Array.isArray(qs) ? qs : []);

      const saved = this.safeLoad();
      if (saved) this.answers.set(saved);

      const rawLimit =
        (attempt as any)?.timeLimitMinutes ??
        (summary as any)?.time_Limit ??
        (summary as any)?.timeLimit ??
        null;

      const limit = typeof rawLimit === 'string' ? parseInt(rawLimit, 10) : rawLimit;

      // Check if the assessment has expired
      const startTime = summary?.startingAt ? new Date(summary.startingAt).getTime() : null;
      if (startTime && limit) {
        const endTime = startTime + (limit * 60 * 1000);
        if (Date.now() > endTime) {
          this.toastr.error('الامتحان انتهى ولا يمكن الاستمرار');
          this.router.navigateByUrl('/');
          return;
        }
      }

      if (typeof limit === 'number' && isFinite(limit) && limit > 0) {
        this.setupTimer(attempt, limit);
      } else {
        this.timeRemaining.set(null);
      }

      if (this.total() === 0) this.idx.set(0);
      this.loaded.set(true);
    } catch (e: any) {
      console.error('خطأ في تحميل الكويز:', e);
      this.toastr.error(e?.message || 'تعذر تحميل بيانات الكويز');
      this.router.navigateByUrl('/');
    }
  }

  private setupTimer(attempt: AttemptDto, timeLimitMinutes: number) {
    const assessmentStartMs = this.assessment()?.startingAt ? new Date(this.assessment().startingAt).getTime() : Date.now();
    const endMs = assessmentStartMs + (timeLimitMinutes * 60 * 1000);

    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endMs - now) / 1000));
      this.timeRemaining.set(remaining);

      if (remaining <= 0 && !this.autoSubmitted && !this.submittedOnce) {
        this.autoSubmitted = true;
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        this.toastr.warning('انتهى الوقت المحدد! سيتم تسليم الكويز تلقائياً');
        this.submit();
      }
    };

    tick();
    this.timer = setInterval(tick, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private safeKey(): string | null {
    const id = this.attemptId();
    return id ? `quiz_answers_${id}` : null;
  }

  private safeLoad(): AnswersMap | null {
    const key = this.safeKey();
    if (!key) return null;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private safeSave(a: AnswersMap) {
    const key = this.safeKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(a));
    } catch {}
  }

  private safeClear() {
    const key = this.safeKey();
    if (!key) return;
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  select(qId: number, choiceId: number) {
    if (!qId || !choiceId) return;
    this.answers.update(a => {
      const next = { ...a, [qId]: Number(choiceId) };
      this.safeSave(next);
      return next;
    });
  }

  prev() {
    this.idx.update(i => Math.max(0, i - 1));
  }

  next() {
    this.idx.update(i => Math.min(Math.max(0, this.total() - 1), i + 1));
  }

  goToQuestion(index: number) {
    if (index >= 0 && index < this.total()) this.idx.set(index);
  }

  private async confirmUnanswered(remaining: number): Promise<boolean> {
    const { isConfirmed } = await Swal.fire({
      title: 'تأكيد التسليم',
      html: `<div dir="rtl">لديك <b>${remaining}</b> سؤال غير مُجاب.<br/>هل تريد المتابعة والتسليم؟</div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'تسليم الآن',
      cancelButtonText: 'إلغاء',
      reverseButtons: true,
      focusCancel: true,
      allowOutsideClick: false
    });
    return isConfirmed;
  }

  async submit() {
    if (this.submitting() || this.submittedOnce) return;
    this.submitting.set(true);
    this.submittedOnce = true;

    try {
      const total = this.total();
      if (total === 0) {
        this.toastr.error('لا توجد أسئلة للتسليم');
        return;
      }

      const startTime = this.assessment()?.startingAt ? new Date(this.assessment().startingAt).getTime() : null;
      const timeLimit = this.assessment()?.timeLimit ?? null;
      if (startTime && timeLimit) {
        const endTime = startTime + (timeLimit * 60 * 1000);
        if (Date.now() > endTime) {
          this.toastr.error('لا يمكن تسليم الكويز بعد انتهاء الوقت المحدد');
          this.router.navigateByUrl('/');
          return;
        }
      }

      const answered = Object.keys(this.answers()).length;
      const remaining = total - answered;

      if (remaining > 0 && !this.autoSubmitted) {
        const go = await this.confirmUnanswered(remaining);
        if (!go) {
          this.submitting.set(false);
          this.submittedOnce = false;
          return;
        }
      }

      const payload: StudentResponseCreateDto[] = Object
        .entries(this.answers())
        .map(([qId, cId]) => ({
          questionId: Number(qId),
          choiceId: Number(cId)
        }));

      const res = await firstValueFrom(
        this.attemptsApi.submitAttempt(this.attemptId()!, payload)
      );

      this.safeClear();
      if (this.timer) { clearInterval(this.timer); this.timer = null; }

      const msg = res?.isGraded
        ? `تم التصحيح بنجاح. الدرجة: ${res.score}`
        : 'تم تسليم الكويز بنجاح.';
      this.toastr.success(msg);

      this.router.navigate(['/quiz/summary', this.attemptId()!]);
    } catch (e: any) {
      console.error('خطأ في تسليم الكويز:', e);
      let errorMessage = e?.error?.message || 'فشل تسليم الكويز';
      if (e instanceof HttpErrorResponse) {
        if (e.status === 400) {
          errorMessage = e.error?.message || 'طلب غير صالح: تحقق من الإجابات';
        } else if (e.status === 401) {
          errorMessage = 'غير مصرح: تحقق من تسجيل الدخول';
          this.router.navigate(['/login']);
        } else if (e.status === 404) {
          errorMessage = 'المحاولة أو الكويز غير موجود';
        }
      }
      this.toastr.error(errorMessage);
    } finally {
      this.submitting.set(false);
    }
  }

  hasAnswer(questionId?: number): boolean {
    const qId = questionId ?? this.currentQuestion()?.id;
    return qId ? qId in this.answers() : false;
  }

  getSelectedAnswer(questionId?: number): number | null {
    const qId = questionId ?? this.currentQuestion()?.id;
    return qId ? this.answers()[qId] ?? null : null;
  }
}