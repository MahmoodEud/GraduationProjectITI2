import { Component } from '@angular/core';
import { LessonUpdate } from '../../../../../Interfaces/ILessonUpdate';
import { LessonService } from '../../../../../Services/lesson.service';
import { CourseService } from '../../../../../Services/course.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-lesson',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './edit-lesson.component.html',
  styleUrl: './edit-lesson.component.css'
})
export class EditLessonComponent {
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
    lessonId: number;

    constructor(
        private lessonService: LessonService,
        private courseService: CourseService,
        private toastr: ToastrService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.lessonId = Number(this.route.snapshot.paramMap.get('id'));
    }

    ngOnInit(): void {
        this.loadCourses();
        this.loadLesson();
    }

    loadCourses(): void {
        this.courseService.getCourses().subscribe({
            next: (response) => {
                this.courses = response.items; 
            },
            error: (err) => {
                this.toastr.error('فشل تحميل الكورسات');
                console.error('Error loading courses:', err);
            }
        });
    }

    loadLesson(): void {
        this.lessonService.getLessonById(this.lessonId).subscribe({
            next: (lesson) => {
                this.lesson = lesson;
            },
            error: (err) => {
                this.toastr.error('فشل تحميل بيانات الدرس');
                console.error('Error loading lesson:', err);
                this.errorMessage = err.message || 'فشل تحميل بيانات الدرس';
            }
        });
    }

    submit(): void {
        this.isSubmitting = true;
        this.errorMessage = null;

        this.lessonService.updateLesson(this.lessonId, this.lesson).subscribe({
            next: () => {
                this.toastr.success('تم تعديل الدرس بنجاح');
                this.router.navigate(['/admin/lessons']);
            },
            error: (err) => {
                this.isSubmitting = false;
                this.errorMessage = err.message || 'فشل تعديل الدرس';
                this.toastr.error(this.errorMessage!);
            }
        });
    }}
