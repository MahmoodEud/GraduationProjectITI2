import { Component, inject } from '@angular/core';
import { CourseService } from '../../../../Services/course.service';
import { StudentCourseService } from '../../../../Services/student-course.service';
import { ToastrService } from 'ngx-toastr';
import { Course } from '../../../../Interfaces/ICourse';
import { IPagedResult } from '../../../../Interfaces/ipaged-result';
import { environment } from '../../../../Services/register/environment';
import { RouterLink } from '@angular/router';
import { CourseEnrollmentService } from '../../../../Services/course-enrollment.service';

@Component({
  selector: 'app-free-courses',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './free-courses.component.html',
  styleUrl: './free-courses.component.css'
})
export class FreeCoursesComponent {
  private courseService = inject(CourseService);
  private studentCourseService = inject(StudentCourseService);
  private toastr = inject(ToastrService);
  private enrollmentService = inject(CourseEnrollmentService);

  courses: Course[] = [];
  enrolledCourseIds: number[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadFreeCourses();
    this.enrollmentService.enrolledCourses$.subscribe({
      next: (courses) => {
        this.enrolledCourseIds = courses.map(course => course.id);
      }
    });
  }

  loadFreeCourses(): void {
    this.isLoading = true;
    this.courseService.getCourses().subscribe({
      next: (result: IPagedResult<Course>) => {
        this.courses = result.items.filter(course => course.price === 0);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || 'حدث خطأ أثناء جلب الكورسات المجانية';
        this.toastr.error(this.errorMessage);
      }
    });
  }
  enroll(courseId: number): void {
    this.studentCourseService.enrollInCourse(courseId).subscribe({
      next: (message: string) => {
        this.toastr.success(message);
      },
      error: (err) => {
        this.toastr.error(err.error || 'حدث خطأ أثناء التسجيل');
      }
    });
  }

  unenroll(courseId: number): void {
    this.studentCourseService.unenrollFromCourse(courseId).subscribe({
      next: (message: string) => {
        this.toastr.success(message);
      },
      error: (err) => {
        this.toastr.warning(err.error || 'حدث خطأ أثناء إلغاء التسجيل');
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
