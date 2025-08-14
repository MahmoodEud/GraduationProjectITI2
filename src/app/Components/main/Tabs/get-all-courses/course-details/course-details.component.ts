import { Component, inject } from '@angular/core';
import { CourseService } from '../../../../../Services/course.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Course } from '../../../../../Interfaces/ICourse';
import { finalize } from 'rxjs';
import { environment } from '../../../../../Services/register/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.css'
})
export class CourseDetailsComponent {
  private api = inject(CourseService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);

  course: Course | null = null;
  defaultImage: string = '/assets/images/default-course.jpg'; 
  baseUrl: string = environment.apiUrl;   
  imageBaseUrl: string = environment.imageBaseUrl; 
  isLoading: boolean = false;
  errorMessage: string = '';
  cour:Course[]=[]
  ngOnInit(): void {
    const courseId = Number(this.route.snapshot.paramMap.get('id'));
    if (courseId) {
      this.loadCourseDetails(courseId);
    }
  }

  loadCourseDetails(courseId: number) {
    this.isLoading = true;
    this.api
      .getCourseById(courseId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (course) => {
          this.course = course;
          if (course.picturalUrl && !course.picturalUrl.startsWith('http')) {
           course.picturalUrl = `${this.imageBaseUrl}/${course.picturalUrl}`;
        }
        

        },
        error: (err) => {
          console.error('Error loading course details', err);
          this.errorMessage = 'حدث خطأ أثناء تحميل تفاصيل الكورس';
          this.toastr.error(this.errorMessage);
        }
      });
  }

 getImageUrl(picturalUrl?: string): string {
  if (!picturalUrl || picturalUrl === 'default.jpg') {
    return 'assets/images/default.jpg';
  }
  return picturalUrl.startsWith('http') 
         ? picturalUrl 
         : `${environment.imageBaseUrl}/${picturalUrl}`; 
}


  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/default.jpg';
  }

enrollInCourse(courseId: number) {
  this.api.enrollInCourse(courseId).subscribe({
    next: (res: any) => {
      const message = res?.message || 'تم التسجيل بنجاح';
      this.toastr.success(message);
    },
    error: (err) => {
      if (err.status === 200) {
        const message = err.error?.message || 'تم التسجيل بنجاح';
        this.toastr.success(message);
        return;
      }

      let errorMessage = 'حدث خطأ أثناء التشغيل';
      if (typeof err.error === 'string') {
        errorMessage = err.error;
      } else if (err.error?.message || err.error?.title || err.error?.detail) {
        errorMessage = err.error.message || err.error.title || err.error.detail;
      } else if (err.status === 409) { 
        errorMessage = 'أنت مشترك في هذا الكورس من قبل';
      }
      this.toastr.error(errorMessage);
    }
  });
}


}

