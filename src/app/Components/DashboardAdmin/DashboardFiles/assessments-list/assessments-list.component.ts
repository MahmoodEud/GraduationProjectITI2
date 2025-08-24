import { Component, inject, OnInit } from '@angular/core';
import { AssessmentDto } from '../../../../Interfaces/Assessment/AssessmentDto';
import { AssessmentsService } from '../../../../Services/Assessments/assessments.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-assessments-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './assessments-list.component.html',
  styleUrl: './assessments-list.component.css'
})
export class AssessmentsListComponent implements OnInit {
  assessments: AssessmentDto[] = [];
  loading = true;
  error: string | null = null;
  private toast = inject(ToastrService);

  constructor(private assessmentsService: AssessmentsService) {}

  ngOnInit(): void {
    this.loadAssessments();
  }

  loadAssessments() {
    this.loading = true;
    this.error = null;
    this.assessmentsService.getAll().subscribe({
      next: (data) => {
        this.assessments = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'خطأ في تحميل الامتحانات';
        this.loading = false;
      },
    });
  }

  // === إحصائيات للـ footer بدل الفلاتر/الريديوس في الـ template ===
  get totalCount(): number {
    return this.assessments?.length ?? 0;
  }

  // اعتبرنا PassingScore كبير => أصعب
  get hardAssessmentsCount(): number {
    const list = this.assessments ?? [];
    return list.filter(a => (a.passingScore ?? 0) >= 70).length;
  }

  // زي ما كنت كاتب: falsy => بلا حدود
  get noTimeLimitCount(): number {
    const list = this.assessments ?? [];
    return list.filter(a => !a.timeLimit).length;
  }

  get totalQuestions(): number {
    const list = this.assessments ?? [];
    let sum = 0;
    for (const a of list) sum += (a.questionCount ?? 0);
    return sum;
  }

  edit(id: number) {
    console.log('Edit assessment', id);
  }

  delete(id: number) {
    if (!confirm('هل انت متأكد من حذف هذا الامتحان؟')) return;

    this.assessmentsService.delete(id).subscribe({
      next: () => this.loadAssessments(),
      error: (err) => {
        if (err?.status === 409) {
          alert(err?.error?.message || 'لا يمكن حذف التقييم لوجود محاولات طلاب.');
        } else if (err?.status === 404) {
          alert('التقييم غير موجود.');
        } else {
          alert('خطأ في حذف الامتحان');
        }
      }
    });
  }

  deleteAttempts(id: number) {
    if (confirm('هل انت متأكد من حذف جميع المحاولات لهذا الامتحان؟')) {
      this.assessmentsService.deleteAttempts(id).subscribe({
        next: () => {
          this.toast.success('تم حذف المحاولات بنجاح');
          this.loadAssessments();
        },
        error: () => this.toast.error('فشل حذف المحاولات')
      });
    }
  }

}





