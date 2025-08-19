import { Component, inject, OnInit } from '@angular/core';
import { CourseService } from '../../../../Services/course.service';
import { ToastrService } from 'ngx-toastr';
import { Course } from '../../../../Interfaces/ICourse';
import { CourseStats } from '../../../../Interfaces/course-stats';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../Services/register/environment';
import { IPagedResult } from '../../../../Interfaces/ipaged-result';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  private courseService = inject(CourseService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  courses: Course[] = [];
  stats: CourseStats | null = null;
  isLoading: boolean = false;
  isDeleting: boolean = false;
  errorMessage: string | null = null;
  searchTerm: string = '';
  yearFilter: string = '';
  page: number = 1;
    byYearKeys: string[] = []; 
  pageSize: number = 12;
  totalPages: number = 1;
  imageBaseUrl: string = environment.imageBaseUrl;
  defaultImage: string = '/assets/images/default-course.jpg';

  ngOnInit(): void {
    this.loadCourses();
    this.loadStats();
  }

  loadStats() {
    this.courseService.getCourseStats().subscribe({
      next: (stats: CourseStats) => {
        this.stats = stats;
        this.byYearKeys = Object.keys(stats.byYear); 

      },
      error: (err) => {
        this.toastr.error('حدث خطأ أثناء تحميل إحصائيات الكورسات');
      }
    });
  }

  loadCourses() {
    this.isLoading = true;
    this.courseService.getCourses(this.searchTerm, undefined, undefined, this.yearFilter, this.page, this.pageSize).subscribe({
      next: (result: IPagedResult<Course>) => {
        this.courses = result.items.map(course => {
          if (course.picturalUrl) {
            course.picturalUrl = course.picturalUrl.replace('/api', '');
            if (course.picturalUrl.includes('default.jpg')) {
              course.picturalUrl = `${this.imageBaseUrl}/Files/default.png`;
            } else if (!course.picturalUrl.startsWith('http')) {
              course.picturalUrl = `${this.imageBaseUrl}${course.picturalUrl}`;
            }
          } else {
            course.picturalUrl = this.defaultImage;
          }
          return course;
        });
        this.totalPages = Math.ceil(result.totalCount / this.pageSize);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'حدث خطأ أثناء تحميل الكورسات';
        this.isLoading = false;
        console.error('Error loading courses:', err);
      }
    });
  }

  onSearchChange(search: string) {
    this.searchTerm = search;
    this.page = 1;
    this.loadCourses();
  }

  applyFilter(type: string, value: string) {
    this.yearFilter = value;
    this.page = 1;
    this.loadCourses();
  }

  resetFilters() {
    this.searchTerm = '';
    this.yearFilter = '';
    this.page = 1;
    this.loadCourses();
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadCourses();
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  deleteCourse(id: number) {
    if (confirm('هل أنت متأكد من حذف الكورس؟')) {
      this.isDeleting = true;
      this.courseService.deleteCourseById(id).subscribe({
        next: (response) => {
          this.toastr.success(response.message || 'تم حذف الكورس بنجاح');
          this.courses = this.courses.filter(course => course.id !== id);
          if (this.courses.length === 0 && this.page > 1) {
            this.page--;
            this.loadCourses();
          }
          this.isDeleting = false;
          this.loadStats(); 
        },
        error: (err) => {
          console.error('Error deleting course:', {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
            error: err.error
          });
          this.toastr.error(err.error?.message || (err.status === 404 ? 'الكورس غير موجود' : 'حدث خطأ أثناء حذف الكورس'));
          this.isDeleting = false;
        }
      });
    }
  }
}