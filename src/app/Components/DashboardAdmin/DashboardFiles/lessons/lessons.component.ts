import { Component, inject, OnInit } from '@angular/core';
import { LessonService } from '../../../../Services/lesson.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ILesson } from '../../../../Interfaces/ILesson';
import { IPagedResult } from '../../../../Interfaces/ipaged-result';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [],
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.css'
})
export class LessonsComponent implements OnInit{

lessons: ILesson[] = []; 
  isLoading: boolean = false;
  errorMessage: string | null = null;
  pageNumber: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  lessonService=inject(LessonService);
  router=inject(Router);
  toastr=inject(ToastrService);


ngOnInit(): void {
    this.loadLessons();
  }

loadLessons(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.lessonService.getAllLessons(this.pageNumber, this.pageSize).subscribe({
      next: (response: any) => { 
        console.log('Raw response from getAllLessons:', response);
        this.lessons = response.data || []; 
        this.totalItems = response.totalItems || 0;
        this.pageNumber = response.pageNumber || 1;
        this.pageSize = response.pageSize || 10;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
        console.log('Parsed lessons:', this.lessons);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'فشل تحميل الدروس';
        console.error('Error loading lessons:', err);
      }
    });
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNumber = newPage;
      this.loadLessons();
    }
  }
  createLesson(): void {
    this.router.navigate(['/admin/create-lesson']);
  }
  updateLesson(id: number): void {
    this.router.navigate([`/admin/edit-lesson/${id}`]);
  }

  deleteLesson(id: number): void {
    if (confirm('هل أنت متأكد من حذف هذا الدرس؟')) {
      this.lessonService.deleteLesson(id).subscribe({
        next: () => {
          this.toastr.success('تم حذف الدرس بنجاح');
          this.loadLessons(); 
        },
        error: (err) => {
          this.toastr.error(err.message || 'فشل حذف الدرس');
          console.error('Error deleting lesson:', err);
        }
      });
    }

}
}
   
