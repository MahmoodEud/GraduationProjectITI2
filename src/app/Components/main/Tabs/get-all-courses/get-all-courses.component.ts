import { Component, inject } from '@angular/core';
import { CourseService } from '../../../../Services/course.service';
import { Course } from '../../../../Interfaces/ICourse';
import { CurrencyPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-get-all-courses',
  standalone: true,
  imports: [CurrencyPipe, NgClass], 
  templateUrl: './get-all-courses.component.html',
  styleUrl: './get-all-courses.component.css'
})
export class GetAllCoursesComponent {
private api = inject(CourseService);

  courses: Course[] = [];
  loading = true;
  error: string | null = null;
    constructor() {
    this.api.getAllCourses().subscribe({
      next: (res: Course[]) => { this.courses = res; this.loading = false;         
      },
      error: (e) => { this.error = e?.error?.message ?? 'فشل تحميل الكورسات'; this.loading = false; }
    });
  }
  deletingId: number | null = null;

deleteCourse(id: number) {
  if (!confirm('متأكد إنك عايز تحذف الكورس؟')) return;
  this.deletingId = id;
  this.api.deleteCourseById(id).subscribe({
    next: _ => {
      this.courses = this.courses.filter(c => c.Id !== id); 
      this.deletingId = null;
    },
    error: e => {
      this.error = e?.error || 'فشل حذف الكورس';
      this.deletingId = null;
    }
  });
}
}
