import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass, CommonModule } from '@angular/common';

import { StudentCourseService } from '../../../../Services/student-course.service';
import { CourseEnrollmentService } from '../../../../Services/course-enrollment.service';
import { ProgressService } from '../../../../Services/progress.service';
import { ToastrService } from 'ngx-toastr';

import { Course } from '../../../../Interfaces/ICourse';
import { ICourseProgress } from '../../../../Interfaces/progress/icourse-progress';
import { environment } from '../../../../Services/register/environment';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  // الأهم هنا: NgIf, NgFor, NgClass
  imports: [RouterLink, FormsModule,CommonModule],
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css'] // خليه plural
})
export class MyCoursesComponent {
  private studentCourseService = inject(StudentCourseService);
  private toastr = inject(ToastrService);
  private enrollmentService = inject(CourseEnrollmentService);
  private progressService = inject(ProgressService);

  progressByCourseId: Record<number, number> = {};
  loadingProgress: Record<number, boolean> = {};
  progressErr: Record<number, string> = {};

  courses: Course[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadMyCourses();
    this.enrollmentService.enrolledCourses$.subscribe({
      next: (courses) => {
        this.courses = courses;
        this.prefetchProgressForCourses();
      },
      error: (err) => {
        this.errorMessage = err.error || 'حدث خطأ أثناء تحديث الكورسات';
        this.toastr.error(this.errorMessage);
      }
    });
  }

  loadMyCourses(): void {
    this.isLoading = true;
    this.studentCourseService.getMyCourses().subscribe({
      next: (courses: Course[]) => {
        this.courses = courses;
        this.isLoading = false;
        this.prefetchProgressForCourses();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || 'حدث خطأ أثناء جلب كورساتك';
        this.toastr.error(this.errorMessage);
      }
    });
  }

  private prefetchProgressForCourses(): void {
    this.progressByCourseId = {};
    this.loadingProgress = {};
    this.progressErr = {};

    this.courses.forEach(c => {
      this.loadingProgress[c.id] = true;
      this.progressService.getCourseProgress(c.id).subscribe({
        next: (cp: ICourseProgress) => {
          this.progressByCourseId[c.id] = Math.max(0, Math.min(100, cp?.percent ?? 0));
          this.loadingProgress[c.id] = false;
        },
        error: () => {
          this.progressByCourseId[c.id] = 0;
          this.loadingProgress[c.id] = false;
        }
      });
    });
  }

  unenroll(courseId: number): void {
    this.studentCourseService.unenrollFromCourse(courseId).subscribe({
      next: (message: string) => this.toastr.success(message),
      error: (err) => this.toastr.error(err.error || 'حدث خطأ أثناء إلغاء التسجيل')
    });
  }

  getImageUrl(picturalUrl: string): string {
    if (!picturalUrl || picturalUrl === 'default.jpg') return 'assets/images/default.jpg';
    return picturalUrl.startsWith('http') ? picturalUrl : `${environment.imageBaseUrl}/${picturalUrl}`;
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/default.jpg';
  }

  getAverageProgress(): number {
    const vals = Object.values(this.progressByCourseId);
    if (!vals.length) return 0;
    const sum = vals.reduce((a, b) => a + (Number(b) || 0), 0);
    return sum / vals.length;
  }

  getCompletedCourses(): number {
    return this.courses.filter(c => (this.progressByCourseId[c.id] ?? 0) >= 100).length;
  }

  getInProgressCourses(): number {
    return this.courses.filter(c => {
      const p = this.progressByCourseId[c.id] ?? 0;
      return p > 0 && p < 100;
    }).length;
  }
}
