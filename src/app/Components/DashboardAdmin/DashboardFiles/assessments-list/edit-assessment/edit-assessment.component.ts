import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AssessmentsService } from '../../../../../Services/Assessments/assessments.service';
import { ToastrService } from 'ngx-toastr';
import { AssessmentDto } from '../../../../../Interfaces/Assessment/AssessmentDto';
import { QuestionDto } from '../../../../../Interfaces/Assessment/question-dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-assessment',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink,CommonModule],
  templateUrl: './edit-assessment.component.html',
  styleUrl: './edit-assessment.component.css'
})
export class EditAssessmentComponent implements OnInit {
 private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastrService);
  private api = inject(AssessmentsService);

  id!: number;
  submitting = signal(false);

  // ✅ Strongly-typed controls عشان نتجنّب أخطاء TS2322
  form = this.fb.group({
    maxAttempts: this.fb.control<number | null>(null),
    passingScore: this.fb.control<number | null>(50, {
      validators: [Validators.required, Validators.min(0), Validators.max(100)]
    }),
    timeLimit: this.fb.control<number | null>(null),
    startingAt: this.fb.control<string | null>(null, { validators: [Validators.required] }),
    lessonId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    questions: this.fb.array<FormGroup>([])
  });

  get questionsFA(): FormArray<FormGroup> {
    return this.form.get('questions') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.api.getById(this.id).subscribe({
      next: (a: AssessmentDto) => this.patchForm(a),
      error: () => this.toast.error('تعذّر تحميل التقييم')
    });
  }

  // // 🔁 عرض التاريخ في input datetime-local بصيغة yyyy-MM-ddTHH:mm
  // private toLocalInputValue(iso?: string) {
  //   if (!iso) return '';
  //   const d = new Date(iso);
  //   if (isNaN(d.getTime())) return '';
  //   const pad = (n: number) => n.toString().padStart(2, '0');
  //   const yyyy = d.getFullYear();
  //   const mm = pad(d.getMonth() + 1);
  //   const dd = pad(d.getDate());
  //   const hh = pad(d.getHours());
  //   const mi = pad(d.getMinutes());
  //   return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  // }

  patchForm(a: AssessmentDto) {
    this.form.patchValue({
      maxAttempts: a.maxAttempts ?? null,
      passingScore: a.passingScore,
      timeLimit: a.timeLimit ?? null,
      startingAt: a.startingAt ? this.toLocalInputValue(a.startingAt) : null,
      lessonId: a.lessonId ?? null,
    });

    this.questionsFA.clear();
    (a.questions || []).forEach(q => this.questionsFA.push(this.makeQuestionGroup(q)));
  }

  makeQuestionGroup(q?: QuestionDto): FormGroup {
    return this.fb.group({
      id: new FormControl<number | null>(q?.id ?? null),
      header: new FormControl<string>(q?.header ?? '', { nonNullable: true, validators: [Validators.required] }),
      body: new FormControl<string>(q?.body ?? '', { nonNullable: true }),
      choices: this.fb.array<FormGroup>(
        (q?.choices ?? []).map(c =>
          this.fb.group({
            id: new FormControl<number | null>(c.id ?? null),
            choiceText: new FormControl<string>(c.choiceText, { nonNullable: true, validators: [Validators.required] }),
            isCorrect: new FormControl<boolean>(!!c.isCorrect, { nonNullable: true }),
            questionId: new FormControl<number | null>(c.questionId ?? null),
          })
        )
      )
    });
  }

  getChoices(qi: number): FormArray<FormGroup> {
    return this.questionsFA.at(qi).get('choices') as FormArray<FormGroup>;
  }

  addQuestion() {
    this.questionsFA.push(this.makeQuestionGroup());
  }

  removeQuestion(qi: number) {
    this.questionsFA.removeAt(qi);
  }

  addChoice(qi: number) {
    this.getChoices(qi).push(
      this.fb.group({
        id: new FormControl<number | null>(null),
        choiceText: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        isCorrect: new FormControl<boolean>(false, { nonNullable: true }),
        questionId: new FormControl<number | null>(this.questionsFA.at(qi).get('id')!.value ?? null)
      })
    );
  }

  removeChoice(qi: number, ci: number) {
    this.getChoices(qi).removeAt(ci);
  }

  private ensureOneCorrectPerQuestion(): void {
    for (let i = 0; i < this.questionsFA.length; i++) {
      const choices = this.getChoices(i).controls;
      if (choices.length === 0) continue;
      const anyTrue = choices.some(c => !!c.get('isCorrect')!.value);
      if (!anyTrue) choices[0].get('isCorrect')!.setValue(true);
    }
  }

 

private toApiPayload() {
  const raw = this.form.value as any;

const startingAtIso = this.toUtcIsoFromLocalInput(raw.startingAt);

  return {
    lessonId: Number(raw.lessonId),
    maxAttempts: raw.maxAttempts ?? null,
    passingScore: Number(raw.passingScore ?? 0),
    timeLimit: raw.timeLimit != null ? Number(raw.timeLimit) : null,
    startingAt: startingAtIso,
    questions: (raw.questions || []).map((q: any) => {
      const question: any = {
        header: (q.header ?? '').trim(),
        body: (q.body ?? '').trim(),
        choices: (q.choices || []).map((c: any) => {
          const choice: any = {
            choiceText: (c.choiceText ?? '').trim(),
            isCorrect: !!c.isCorrect
          };
          if (Number.isFinite(c.id) && c.id > 0) {
            choice.id = Number(c.id);
          }
          return choice;
        })
      };

      if (Number.isFinite(q.id) && q.id > 0) {
        question.id = Number(q.id);
      }

      return question;
    })
  };
}


  onSubmit() {
    if (this.submitting()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('من فضلك اكمل البيانات المطلوبة');
      return;
    }

    this.ensureOneCorrectPerQuestion();

    const dto = this.toApiPayload();

    if (!dto.startingAt) {
      this.toast.error('من فضلك اختر تاريخ/وقت صالح (Starting At)');
      return;
    }

    this.submitting.set(true);
    this.api.update(this.id, dto).subscribe({
      next: () => {
        this.toast.success('تم تحديث التقييم');
        this.router.navigateByUrl('/admin/assessments');
      },
      error: (err) => {
        const msg = err?.error?.title || err?.error?.message || 'فشل تحديث التقييم';
        this.toast.error(msg);
        console.error('API error:', err?.error || err);
      },
      complete: () => this.submitting.set(false)
    });
  }

  trackByIndex = (i: number) => i;







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
