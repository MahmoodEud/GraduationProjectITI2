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
  private isInitializing = false;
  enrolledCourses$: Observable<number[]>; 


  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  private player: Player | null = null;
constructor() {
    this.enrolledCourses$ = this.studentCourseService.getMyCourses().pipe(
      map(courses => courses.map(course => course.id))
    );
  }
  ngOnInit(): void {
   this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.courseId) {
      debugger;
      this.enrolledCourses$.subscribe(enrolledIds => {
        if (!enrolledIds.includes(this.courseId ?? 0)) {
          this.isNotEnrolled = true;
          this.errorMessage = 'أنت غير مشترك في هذا الكورس';
          this.toastr.warning(this.errorMessage);
        } else {
          this.isNotEnrolled = false;
          this.loadContent();
        }
      });
    } 
    else {
      this.errorMessage = 'رقم الكورس غير صالح';
      this.toastr.error(this.errorMessage);
    }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this.initializeVideoJs();
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
  }

  initializeVideoJs() {
    if (this.isInitializing) {
      return;
    }

    this.isInitializing = true;

    if (this.player) {
      this.player.dispose();
      this.player = null;
    }

    if (!this.videoPlayer || !this.videoPlayer.nativeElement) {
      this.isInitializing = false;
      return;
    }

    if (this.selectedLesson && this.hasVideoContent()) {
      try {
        const videoSource = this.getCurrentVideoUrl();

        this.player = videojs(this.videoPlayer.nativeElement, {
          controls: true,
          autoplay: false,
          fluid: true,
          responsive: true,
          aspectRatio: '16:9',
          fill: false,
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
          sources: [{
            src: videoSource,
            type: 'video/mp4'
          }],
          userActions: {
            hotkeys: true
          }
        });

        this.player.ready(() => {
          console.log('Video.js player is ready');
          this.maintainVideoSize();
          this.isInitializing = false;
        });

        this.player.on('error', () => {
          this.toastr.error('حدث خطأ في تحميل الفيديو');
          this.isInitializing = false;
        });

        this.player.on('loadstart', () => {
          console.log('Video loading started');
          this.maintainVideoSize();
        });

        this.player.on('canplay', () => {
          this.maintainVideoSize();
        });

      } catch (error) {
        console.error('Error initializing Video.js:', error);
        this.toastr.error('حدث خطأ في تحميل مشغل الفيديو');
        this.isInitializing = false;
      }
    } else {
      this.isInitializing = false;
    }
  }

  maintainVideoSize() {
    if (this.player) {
      this.player.dimensions('100%', 'auto');
      this.player.fluid(true);
    }
  }

  selectLesson(lesson: ILesson) {
    this.selectedLesson = {
      ...lesson,
      videoUrl: lesson.videoUrl || 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      previewVideoUrl: lesson.previewVideoUrl || 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    };
    this.isPreviewMode = false;

    this.cdr.detectChanges();
    this.initializeVideoJs();
  }

  togglePreview() {
    if (!this.selectedLesson?.previewVideoUrl) {
      this.toastr.warning('لا يوجد فيديو مختصر لهذا الدرس');
      return;
    }

    this.isPreviewMode = !this.isPreviewMode;
    this.updateVideoSourceOnly();
  }

  updateVideoSourceOnly() {
    if (this.player && this.selectedLesson && this.hasVideoContent()) {
      const videoSource = this.getCurrentVideoUrl();
      const currentTime = this.player.currentTime();

      this.player.src({
        src: videoSource,
        type: 'video/mp4'
      });

      setTimeout(() => {
        this.maintainVideoSize();
      }, 100);
    }
  }

  updateVideoSource() {
    if (this.player && this.selectedLesson && this.hasVideoContent()) {
      const videoSource = this.getCurrentVideoUrl();

      this.player.src([{
        src: videoSource,
        type: 'video/mp4'
      }]);

      this.player.load();

      setTimeout(() => {
        this.maintainVideoSize();
      }, 100);
    } else {
      this.initializeVideoJs();
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

  downloadPDF() {
    if (this.selectedLesson?.pdfUrl) {
      window.open(this.selectedLesson.pdfUrl, '_blank');
    } else {
      this.toastr.warning('لا يوجد ملف PDF لهذا الدرس');
    }
  }

  loadContent() {
    if (!this.courseId) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.courseService.getCourseContent(this.courseId).subscribe({
      next: (content: CourseContent) => {
        this.content = content;
        this.isLoading = false;
        console.log('Course content loaded:', content);

        if (content.lessons && content.lessons.length > 0) {
          this.selectLesson(content.lessons[0]);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.handleLoadError(err);
      }
    });
  }

  private handleLoadError(err: any) {
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

  enrollInCourse() {
    if (!this.courseId) return;

    this.courseService.enrollInCourse(this.courseId).subscribe({
      next: () => {
        this.toastr.success('تم الاشتراك في الكورس بنجاح');
        this.isNotEnrolled = false;
        this.loadContent();
      },
      error: (err) => {
        this.toastr.warning(err.error?.message || 'من فضلك تواصل مع الدعم للأشتراك');
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