import { Component } from '@angular/core';
import { LessonService } from '../../../../../Services/lesson.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { LessonUpdate } from '../../../../../Interfaces/ILessonUpdate';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../../../Services/course.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-lesson',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './create-lesson.component.html',
  styleUrl: './create-lesson.component.css'
})
export class CreateLessonComponent {
lesson: LessonUpdate = {
        title: '',
        videoUrl: '',
        previewVideoUrl: '',
        pdfUrl: '',
        courseId: 0
    };
    courses: any[] = [];
    isSubmitting: boolean = false;
    errorMessage: string | null = null;

    constructor(
        private lessonService: LessonService,
        private courseService: CourseService,
        private toastr: ToastrService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadCourses();
    }

    loadCourses(): void {
        this.courseService.getCourses().subscribe({
            next: (response) => {
                this.courses = response.items; // استخدام response.items بناءً على PagedResult<Course>
            },
            error: (err) => {
                this.toastr.error('فشل تحميل الكورسات');
                console.error('Error loading courses:', err);
            }
        });
    }

    submit(): void {
        this.isSubmitting = true;
        this.errorMessage = null;

        this.lessonService.createLesson(this.lesson).subscribe({
            next: () => {
                this.toastr.success('تم إنشاء الدرس بنجاح');
                this.router.navigate(['/admin/lessons']);
            },
            error: (err) => {
                this.isSubmitting = false;
                this.errorMessage = err.message || 'فشل إنشاء الدرس';
                this.toastr.error(this.errorMessage!);
            }
        });
    }
}
