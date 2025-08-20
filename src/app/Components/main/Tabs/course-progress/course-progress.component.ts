import { Component, inject, OnInit } from '@angular/core';
import { ProgressService } from '../../../../Services/progress.service';
import { ActivatedRoute } from '@angular/router';
import { ILessonProgress } from '../../../../Interfaces/progress/ilesson-progress';
import { ToastrService } from 'ngx-toastr';
import { ICourseProgress } from '../../../../Interfaces/progress/icourse-progress';

@Component({
  selector: 'app-course-progress',
  standalone: true,
  imports: [],
  templateUrl: './course-progress.component.html',
  styleUrl: './course-progress.component.css'
})
export class CourseProgressComponent implements OnInit {
private route = inject(ActivatedRoute);
  private progressService = inject(ProgressService);

  courseProgress: ICourseProgress | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    if (courseId) {
      this.loadCourseProgress(courseId);
    } else {
      this.errorMessage = 'لم يتم العثور على معرف الكورس';
    }
  }

  loadCourseProgress(courseId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.progressService.getCourseProgress(courseId).subscribe({
      next: (res) => {
        this.courseProgress = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'فشل تحميل تقدم الكورس';
        this.isLoading = false;
      }
    });
  }
}
