import { Component, inject, signal } from '@angular/core';
import { NotificationsServiceService } from '../../../../Services/Billing/notifications-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../../Services/course.service';
import { LessonService } from '../../../../Services/lesson.service';
import { Course } from '../../../../Interfaces/ICourse';
import { ILesson } from '../../../../Interfaces/ILesson';

@Component({
  selector: 'app-notification-management',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './notification-management.component.html',
  styleUrl: './notification-management.component.css'
})
export class NotificationManagementComponent {
private api = inject(NotificationsServiceService);
  private coursesApi = inject(CourseService);
  private lessonsApi = inject(LessonService);

  loading = signal(false);
  msg      = signal<string | null>(null);
  err      = signal<string | null>(null);

  years = [
    { value: 1, label: 'سنة أولى' },
    { value: 2, label: 'سنة تانية' },
    { value: 3, label: 'سنة تالتة' },
  ];
  courses = signal<Course[]>([]);
  examLessons = signal<ILesson[]>([]);   

  bYear: number | null = null;
  bCourseId: number | null = null;
  bTitle = '';
  bBody = '';
  bType: 'General' | 'Exam' | 'Meeting' | 'Invoice' = 'General';
  bActionUrl = '';

  eYear: number | null = null;
  eCourseId: number | null = null;
  eLessonId: number | null = null;
  eTitle = '';
  eBody = '';

  mCourseId: number | null = null;
  mYear: number | null = null;
  mTitle = '';
  mJoinUrl = '';
  mStartAt = ''; 
  mEndAt   = ''; 

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.coursesApi.getCourses(undefined, undefined, undefined, undefined, 1, 1000)
      .subscribe({
        next: (res: any) => {
          const arr: Course[] = res?.items ?? res?.data ?? res ?? [];
          this.courses.set(arr);
        },
        error: (e) => this.err.set(e?.error || 'فشل تحميل الكورسات')
      });
  }

  onExamCourseChange(courseId: number | null) {
    this.eLessonId = null;
    this.examLessons.set([]);
    if (!courseId) return;
    this.lessonsApi.getByCourse(courseId).subscribe({
      next: (lessons) => this.examLessons.set(lessons ?? []),
      error: _ => this.err.set('فشل تحميل الدروس لهذا الكورس')
    });
  }

  resetAlerts() { this.msg.set(null); this.err.set(null); }

  sendBroadcast() {
    this.resetAlerts();
    if (!this.bTitle.trim()) { this.err.set('العنوان مطلوب'); return; }
    this.loading.set(true);
    this.api.broadcast({
      year: this.bYear ?? undefined,
      courseId: this.bCourseId ?? undefined,
      title: this.bTitle.trim(),
      body: this.bBody || undefined,
      type: this.bType,
      actionUrl: this.bActionUrl || undefined
    }).subscribe({
      next: r => this.msg.set(`تم الإرسال إلى ${r.count} طالب`),
      error: e => this.err.set(e?.error || 'فشل الإرسال'),
      complete: () => this.loading.set(false)
    });
  }

  sendExamNow() {
    this.resetAlerts();
    if (!this.eYear || !this.eCourseId || !this.eLessonId) {
      this.err.set('السنة والكورس والدرس مطلوبة'); return;
    }
    this.loading.set(true);
    this.api.examNow({
      year: this.eYear,
      courseId: this.eCourseId,
      lessonId: this.eLessonId,
      title: this.eTitle || undefined,
      body: this.eBody || undefined
    }).subscribe({
      next: r => this.msg.set(`تم إرسال إشعار الامتحان إلى ${r.count} طالب`),
      error: e => this.err.set(e?.error || 'فشل الإرسال'),
      complete: () => this.loading.set(false)
    });
  }

  sendMeeting() {
    this.resetAlerts();
    if (!this.mCourseId || !this.mTitle.trim() || !this.mJoinUrl.trim()) {
      this.err.set('CourseId و Title و JoinUrl مطلوبة'); return;
    }
    this.loading.set(true);
    this.api.meeting({
      courseId: this.mCourseId,
      year: this.mYear ?? undefined,
      title: this.mTitle.trim(),
      joinUrl: this.mJoinUrl.trim(),
      startAt: this.mStartAt || undefined,
      endAt: this.mEndAt || undefined
    }).subscribe({
      next: r => this.msg.set(`تم إرسال إشعار الميتنج إلى ${r.count} طالب`),
      error: e => this.err.set(e?.error || 'فشل الإرسال'),
      complete: () => this.loading.set(false)
    });
  }
}
