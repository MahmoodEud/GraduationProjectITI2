import { Component, inject } from '@angular/core';
import { StudentCourseService } from '../../../../Services/student-course.service';
import { ToastrService } from 'ngx-toastr';
import { Course } from '../../../../Interfaces/ICourse';
import { environment } from '../../../../Services/register/environment';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CourseEnrollmentService } from '../../../../Services/course-enrollment.service';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [RouterLink,FormsModule,CommonModule],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.css'
})
export class MyCoursesComponent {
  private studentCourseService = inject(StudentCourseService);
  private toastr = inject(ToastrService);
  private enrollmentService = inject(CourseEnrollmentService);

  courses: Course[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
  this.loadMyCourses();
    this.enrollmentService.enrolledCourses$.subscribe({
      next: (courses) => {
        this.courses = courses;
      },
      error: (err) => {
        this.errorMessage = err.error || 'حدث خطأ أثناء تحديث الكورسات';
        this.toastr.error(this.errorMessage);
      }
    });  }

  loadMyCourses(): void {
    this.isLoading = true;
    this.studentCourseService.getMyCourses().subscribe({
      next: (courses: Course[]) => {
        this.courses = courses;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || 'حدث خطأ أثناء جلب كورساتك';
        this.toastr.error(this.errorMessage);
      }
    });
  }

  unenroll(courseId: number): void {
    this.studentCourseService.unenrollFromCourse(courseId).subscribe({
      next: (message: string) => {
        this.toastr.success(message);
      },
      error: (err) => {
        this.toastr.error(err.error || 'حدث خطأ أثناء إلغاء التسجيل');
      }
    });
  }

  getImageUrl(picturalUrl: string): string {
    if (!picturalUrl || picturalUrl === 'default.jpg') {
      return 'assets/images/default.jpg';
    }
    return picturalUrl.startsWith('http') ? picturalUrl : `${environment.imageBaseUrl}/${picturalUrl}`;
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/default.jpg';
  }
}
