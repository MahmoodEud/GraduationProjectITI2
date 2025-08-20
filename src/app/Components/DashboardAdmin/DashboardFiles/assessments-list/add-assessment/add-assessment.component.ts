import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssessmentsService } from '../../../../../Services/Assessments/assessments.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CourseService } from '../../../../../Services/course.service';
import { LessonService } from '../../../../../Services/lesson.service';
import { Course } from '../../../../../Interfaces/ICourse';
import { ILesson } from '../../../../../Interfaces/ILesson';
import { IPagedResult } from '../../../../../Interfaces/ipaged-result';

@Component({
  selector: 'app-add-assessment',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './add-assessment.component.html',
  styleUrl: './add-assessment.component.css'
})
export class AddAssessmentComponent {
private fb = inject(FormBuilder);
  private router = inject(Router);
  private toast = inject(ToastrService);

  private assessmentsApi = inject(AssessmentsService);
  private coursesApi = inject(CourseService);
  private lessonsApi = inject(LessonService);

  courses: Course[] = [];
  lessons: ILesson[] = [];
  loadingLessons = false;
  submitting = signal(false);

form = this.fb.group({
  maxAttempts: [null],
  passingScore: [50, [Validators.required, Validators.min(0), Validators.max(100)]],
  timeLimit: [null],
  startingAt: ['', Validators.required],
  courseId: [null, Validators.required],
  lessonId: [null, Validators.required],
  questions: this.fb.array([])
});


  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  ngOnInit(): void {
    this.coursesApi.getCourses(undefined, undefined, undefined, undefined, 1, 500)
      .subscribe({
        next: (res: IPagedResult<Course>) => { this.courses = res?.items ?? []; },
        error: () => this.toast.error('تعذّر تحميل الكورسات')
      });

    this.form.get('courseId')!.valueChanges.subscribe((courseId: number | null) => {
      this.lessons = [];
      this.form.get('lessonId')!.reset();
      if (!courseId) return;

      this.loadingLessons = true;
    
      this.lessonsApi.getByCourse(courseId).subscribe({
        next: (ls: ILesson[]) => { this.lessons = ls || []; },
        error: () => this.toast.error('تعذّر تحميل الدروس'),
        complete: () => this.loadingLessons = false
      });
    });

    this.addQuestion();
  }

  addQuestion() {
    this.questions.push(
      this.fb.group({
        header: ['', Validators.required],
        body: [''],
        choices: this.fb.array([ this.makeChoice(), this.makeChoice() ])
      })
    );
  }

  removeQuestion(qi: number) {
    this.questions.removeAt(qi);
  }

  getChoices(qi: number): FormArray {
    return this.questions.at(qi).get('choices') as FormArray;
  }

  makeChoice(): FormGroup {
    return this.fb.group({
      choiceText: ['', Validators.required],
      isCorrect: [false]
    });
  }

  addChoice(qi: number) {
    this.getChoices(qi).push(this.makeChoice());
  }

  removeChoice(qi: number, ci: number) {
    this.getChoices(qi).removeAt(ci);
  }

  private ensureOneCorrectPerQuestion(): boolean {
    const qs = this.questions.controls;
    for (let i = 0; i < qs.length; i++) {
      const choices = (qs[i].get('choices') as FormArray).controls;
      const anyTrue = choices.some(c => !!c.get('isCorrect')!.value);
      if (!anyTrue && choices.length > 0) {
        choices[0].get('isCorrect')!.setValue(true);
      }
    }
    return true;
  }

  onSubmit() {
    if (this.submitting()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('من فضلك، اكمل البيانات المطلوبة.');
      return;
    }

    this.ensureOneCorrectPerQuestion();


const raw = this.form.value;
const startingAtIso = this.toUtcIsoFromLocalInput(raw.startingAt as string);
if (!startingAtIso) {
  this.toast.error('من فضلك اختر تاريخ/وقت صالح');
  return;
}
const dto = {
  lessonId: Number(raw.lessonId),
  maxAttempts: raw.maxAttempts ?? null,
  passingScore: raw.passingScore ?? 0,
  timeLimit: raw.timeLimit != null ? Number(raw.timeLimit) : null,
  startingAt: startingAtIso,
  questions: (raw.questions || []).map((q: any) => {
    const choices = (q.choices || [])
      .map((c: any) => ({ choiceText: (c.choiceText ?? '').trim(), isCorrect: !!c.isCorrect }))
      .filter((c: any) => c.choiceText.length > 0);
    return {
      header: (q.header ?? '').trim(),
      body: (q.body ?? '').trim(),
      choices
    };
  })
};
    this.submitting.set(true);
    this.assessmentsApi.create(dto).subscribe({
      next: () => {
        this.toast.success('تم إنشاء التقييم بنجاح');
        this.router.navigateByUrl('/admin/assessments'); 
      },
      error: (err) => this.toast.error(err?.error?.message || 'فشل إنشاء التقييم'),
      complete: () => this.submitting.set(false)
    });
  }

  trackByIndex = (_: number, __: any) => _;


  
private toUtcIsoFromLocalInput(value?: string | null): string | null {
  if (!value) return null;
  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) return null;

  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm]  = timePart.split(':').map(Number);

  const utc = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0));
  return isNaN(utc.getTime()) ? null : utc.toISOString();
}

private toLocalInputValue(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
}

