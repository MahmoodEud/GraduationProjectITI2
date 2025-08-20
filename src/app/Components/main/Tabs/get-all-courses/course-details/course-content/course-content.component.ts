import { Component, ElementRef, inject, ViewChild, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CourseContent } from '../../../../../../Interfaces/course-content';
import { CourseService } from '../../../../../../Services/course.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ILesson } from '../../../../../../Interfaces/ILesson';
import { CommonModule } from '@angular/common';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { StudentCourseService } from '../../../../../../Services/student-course.service';
import { map, Observable } from 'rxjs';
import Plyr from 'plyr';

@Component({
  selector: 'app-course-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-content.component.html',
  styleUrl: './course-content.component.css'
})
export class CourseContentComponent implements OnInit, AfterViewInit, OnDestroy {
 private courseService = inject(CourseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  private studentCourseService = inject(StudentCourseService);

  courseId: number | null = null;
  content: CourseContent | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  isNotEnrolled: boolean = false;
  selectedLesson: ILesson | null = null;
  isPreviewMode: boolean = false;
  enrolledCourses$: Observable<number[]>;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  private player: any = null;
  private isPlayerInitializing = false;

  constructor() {
    this.enrolledCourses$ = this.studentCourseService.getMyCourses().pipe(
      map(courses => courses.map(course => course.id))
    );
  }

  ngOnInit(): void {
    this.loadPlyrAssets().then(() => {
      this.courseId = Number(this.route.snapshot.paramMap.get('id'));
      if (this.courseId) {
        this.enrolledCourses$.subscribe(enrolledIds => {
          console.log('Enrolled Course IDs:', enrolledIds);
          console.log('Current Course ID:', this.courseId);
          if (!enrolledIds.includes(this.courseId ?? 0)) {
            this.isNotEnrolled = true;
            this.errorMessage = 'أنت غير مشترك في هذا الكورس';
            this.toastr.warning(this.errorMessage);
          } else {
            this.isNotEnrolled = false;
            this.loadContent();
          }
        });
      } else {
        this.errorMessage = 'رقم الكورس غير صالح';
        this.toastr.error(this.errorMessage);
      }
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroyPlayer();
  }

  private async loadPlyrAssets(): Promise<void> {
    return new Promise((resolve) => {
      // تحقق إذا كان Plyr محمل بالفعل
      if (typeof Plyr !== 'undefined') {
        resolve();
        return;
      }

      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = 'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js';
      script.onload = () => {
        console.log('Plyr loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Plyr');
        this.toastr.error('فشل في تحميل مشغل الفيديو');
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  private destroyPlayer(): void {
    if (this.player) {
      try {
        this.player.destroy();
        this.player = null;
        console.log('Plyr player destroyed');
      } catch (error) {
        console.error('Error destroying Plyr player:', error);
      }
    }
  }

  private initializePlayer(): void {
    if (this.isPlayerInitializing || typeof Plyr === 'undefined') {
      return;
    }

    this.isPlayerInitializing = true;

    // تدمير المشغل السابق
    this.destroyPlayer();

    // التأكد من وجود عنصر الفيديو
    if (!this.videoPlayer?.nativeElement) {
      this.isPlayerInitializing = false;
      return;
    }

    // التأكد من وجود محتوى فيديو
    if (!this.selectedLesson || !this.hasVideoContent()) {
      this.isPlayerInitializing = false;
      return;
    }

    try {
      // تعيين مصدر الفيديو
      const videoSource = this.getCurrentVideoUrl();
      this.videoPlayer.nativeElement.src = videoSource;

      // إنشاء مشغل Plyr جديد
      this.player = new Plyr(this.videoPlayer.nativeElement, {
        controls: [
          'play-large',
          'play',
          'progress', 
          'current-time',
          'duration',
          'mute',
          'volume',
          'settings',
          'pip',
          'airplay',
          'fullscreen'
        ],
        settings: ['quality', 'speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
        ratio: '16:9',
        fullscreen: { enabled: true, fallback: true, iosNative: true },
        keyboard: { focused: true, global: false },
        tooltips: { controls: true, seek: true },
        captions: { active: false, update: false, language: 'ar' },
        quality: { default: 720, options: [480, 720, 1080] }
      });

      // معالجة الأحداث
      this.player.on('ready', () => {
        console.log('Plyr player is ready');
        this.isPlayerInitializing = false;
      });

      this.player.on('error', (event: any) => {
        console.error('Plyr error:', event.detail);
        this.toastr.error('حدث خطأ في تشغيل الفيديو');
        this.isPlayerInitializing = false;
      });

      this.player.on('loadstart', () => {
        console.log('Video loading started');
      });

      this.player.on('canplay', () => {
        console.log('Video can start playing');
      });

      this.player.on('play', () => {
        console.log('Video started playing');
      });

      this.player.on('pause', () => {
        console.log('Video paused');
      });

    } catch (error) {
      console.error('Error initializing Plyr player:', error);
      this.toastr.error('حدث خطأ في تحميل مشغل الفيديو');
      this.isPlayerInitializing = false;
    }
  }

  selectLesson(lesson: ILesson): void {
    // حفظ الوقت الحالي قبل التغيير (اختياري)
    let currentTime = 0;
    if (this.player) {
      currentTime = this.player.currentTime || 0;
    }

    // تحديث الدرس المحدد
    this.selectedLesson = {
      ...lesson,
      videoUrl: lesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      previewVideoUrl: lesson.previewVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    };
    
    this.isPreviewMode = false;

    this.cdr.detectChanges();
    if (this.player) {
  this.updateVideoSource();   
    } else {
      setTimeout(() => this.initializePlayer(), 100); 
    }

  }

  togglePreview(): void {
    if (!this.selectedLesson?.previewVideoUrl) {
      this.toastr.warning('لا يوجد فيديو مختصر لهذا الدرس');
      return;
    }

    let currentTime = 0;
    if (this.player) {
      currentTime = this.player.currentTime || 0;
    }

    this.isPreviewMode = !this.isPreviewMode;
    this.updateVideoSource();
  }

  private updateVideoSource(): void {
    if (!this.player || !this.selectedLesson || !this.hasVideoContent()) {
      return;
    }

    const videoSource = this.getCurrentVideoUrl();
    
    try {
      // تحديث مصدر الفيديو بطريقة آمنة
      this.player.source = {
        type: 'video',
        sources: [
          {
            src: videoSource,
            type: 'video/mp4'
          }
        ]
      };

      console.log('Video source updated:', videoSource);
      
    } catch (error) {
      console.error('Error updating video source:', error);
      // في حالة فشل التحديث، إعادة تهيئة المشغل
      setTimeout(() => {
        this.initializePlayer();
      }, 100);
    }
  }

  getCurrentVideoUrl(): string {
    if (!this.selectedLesson) return '';

    return this.isPreviewMode && this.selectedLesson.previewVideoUrl
      ? this.selectedLesson.previewVideoUrl
      : this.selectedLesson.videoUrl || '';
  }

  hasVideoContent(): boolean {
    return !!(this.selectedLesson?.videoUrl || this.selectedLesson?.previewVideoUrl);
  }

  downloadPDF(): void {
    if (this.selectedLesson?.pdfUrl) {
      window.open(this.selectedLesson.pdfUrl, '_blank');
    } else {
      this.toastr.warning('لا يوجد ملف PDF لهذا الدرس');
    }
  }
  QuizRouter(lessonId: number): void {
    if (this.selectedLesson) {
    this.router.navigate(['/quiz', lessonId]);
    } else {
      this.toastr.warning('لا يوجد امتحان لهذا الدرس');
    }
  }
  loadContent(): void {
    if (!this.courseId) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.courseService.getCourseContent(this.courseId).subscribe({
      next: (content: CourseContent) => {
        this.content = content;
        this.isLoading = false;
        console.log('Course content loaded:', content);

        if (content.lessons && content.lessons.length > 0) {
          setTimeout(() => {
            this.selectLesson(content.lessons[0]);
          }, 200);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.handleLoadError(err);
      }
    });
  }

  private handleLoadError(err: any): void {
    if (err.status === 401) {
      this.errorMessage = 'برجاء تسجيل الدخول أولاً';
      this.toastr.error(this.errorMessage);
      this.router.navigate(['/login']);
    } else if (err.status === 403) {
      this.isNotEnrolled = true;
      this.errorMessage = 'أنت غير مشترك في هذا الكورس';
      this.toastr.error(this.errorMessage);
    } else if (err.status === 404) {
      this.errorMessage = 'محتوى الكورس غير متوفر';
      this.toastr.error(this.errorMessage);
    } else {
      this.errorMessage = 'حدث خطأ أثناء تحميل المحتوى';
      this.toastr.error(this.errorMessage);
    }
    console.error('Error loading course content:', err);
  }

  enrollInCourse(): void {
    if (!this.courseId) return;

    this.courseService.enrollInCourse(this.courseId).subscribe({
      next: () => {
        this.toastr.success('تم الاشتراك في الكورس بنجاح');
        this.isNotEnrolled = false;
        this.loadContent();
      },
      error: (err) => {
        this.toastr.warning(err.error?.message || 'من فضلك تواصل مع الدعم للاشتراك');
        console.error('Error enrolling in course:', err);
      }
    });
  }

  getLessonIcon(lesson: ILesson): string {
    if (lesson.videoUrl || lesson.previewVideoUrl) {
      return 'bi-play-circle-fill';
    } else if (lesson.pdfUrl) {
      return 'bi-file-earmark-pdf';
    }
    return 'bi-book';
  }

  getLessonBadge(lesson: ILesson): string {
    if (lesson.videoUrl || lesson.previewVideoUrl) {
      return 'فيديو';
    } else if (lesson.pdfUrl) {
      return 'PDF';
    }
    return 'درس';
  }


}