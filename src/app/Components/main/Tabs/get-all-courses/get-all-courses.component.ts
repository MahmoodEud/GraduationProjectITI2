import { Component, inject, OnInit } from '@angular/core';
import { CourseService } from '../../../../Services/course.service';
import { Course } from '../../../../Interfaces/ICourse';
import { CommonModule} from '@angular/common';
import { IPagedResult } from '../../../../Interfaces/ipaged-result';
import { finalize, Observable } from 'rxjs';
import { AccountService } from '../../../../Services/account.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../Services/register/environment';
import { RouterLink } from '@angular/router';
import { StudentCourseService } from '../../../../Services/student-course.service';
import { CourseEnrollmentService } from '../../../../Services/course-enrollment.service';

@Component({
  selector: 'app-get-all-courses',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink], 
  templateUrl: './get-all-courses.component.html',
  styleUrl: './get-all-courses.component.css'
})
export class GetAllCoursesComponent implements OnInit  {
 private courseService = inject(CourseService);
  private studentCourseService = inject(StudentCourseService);
  private toastr = inject(ToastrService);
  private enrollmentService = inject(CourseEnrollmentService);

  courses: Course[] = [];
  enrolledCourseIds: number[] = [];
  totalCount: number = 0;
  totalPages: number = 0;
  page: number = 1;
  pageSize: number = 12;
  errorMessage: string = '';
  isLoading: boolean = false;
  searchTerm: string = '';

  ngOnInit(): void {
    this.loadCourses();
    this.enrollmentService.enrolledCourses$.subscribe({
      next: (courses) => {
        this.enrolledCourseIds = courses.map(course => course.id);
      }
    });
  }
loadCourses(): void {
  this.isLoading = true;
  this.courseService
    .getCourses(this.searchTerm, undefined, undefined, undefined, this.page, this.pageSize)
    .pipe(finalize(() => (this.isLoading = false)))
    .subscribe({
      next: (d: IPagedResult<Course>) => {
        this.courses = d.items ?? [];
        this.totalCount = d.totalCount ?? 0;
        this.page = d.page ?? 1;

        this.pageSize = (d.pageSize && d.pageSize > 0) ? d.pageSize : 12;

          this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
      },
      error: (err) => {
        this.errorMessage = err.error || 'حدث خطأ أثناء تحميل الكورسات';
        this.toastr.error(this.errorMessage);
      }
    });
}


  loadMyCourses(): void {
    this.studentCourseService.getMyCourses().subscribe({
      next: (courses: Course[]) => {
        this.enrolledCourseIds = courses.map(course => course.id);
      },
      error: (err) => {
        this.toastr.error(err.error || 'حدث خطأ أثناء جلب كورساتك');
      }
    });
  }

  enrollInCourse(courseId: number): void {
    this.studentCourseService.enrollInCourse(courseId).subscribe({
      next: (message: string) => {
        this.toastr.success(message);
        this.loadMyCourses(); 
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
        this.loadMyCourses(); 
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

 getPageNumbers(): number[] {
  const total = Math.max(1, Number(this.totalPages) || 1); 
  const pages = [];
  for (let i = 1; i <= total; i++) {
    pages.push(i);
  }
  return pages;
}


  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.page = 1;
    this.loadCourses();
  }

  onPageChange(pageNum: number): void {
    this.page = pageNum;
    this.loadCourses();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.page = 1;
    this.loadCourses();
  }
}
