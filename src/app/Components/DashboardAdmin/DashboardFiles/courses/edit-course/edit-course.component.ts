import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CourseService } from '../../../../../Services/course.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Course } from '../../../../../Interfaces/ICourse';

@Component({
  selector: 'app-edit-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.css']
})
export class EditCourseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editForm: FormGroup;
  isSubmitting: boolean = false;
  imagePreview: string | ArrayBuffer | null = null;
  courseId: number | null = null;

  constructor() {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      year: ['', Validators.required],
      category: [''],
      imageFile: [null]
    });
  }

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.courseId) {
      this.loadCourse();
    } else {
      this.toastr.error('معرف الكورس غير صالح');
      this.router.navigate(['/admin/users']);
    }
  }

  loadCourse() {
    this.courseService.getCourseById(this.courseId!).subscribe({
      next: (course: Course) => {
        this.editForm.patchValue({
          title: course.title,
          description: course.description,
          price: course.price,
          year: course.year.toString(),
          category: course.category || ''
        });
        if (course.picturalUrl) {
          this.imagePreview = course.picturalUrl;
          console.log('Loaded course image:', course.picturalUrl);
        }
      },
      error: (err) => {
        console.error('Error loading course:', err);
        this.toastr.error('حدث خطأ أثناء تحميل الكورس');
        this.router.navigate(['/admin/users']);
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      console.log('Selected file:', { name: file.name, size: file.size, type: file.type });
      if (!file.type.startsWith('image/')) {
        this.toastr.error('من فضلك، اختر ملف صورة صالح (jpg, png, إلخ)');
        input.value = '';
        return;
      }
      this.editForm.patchValue({ imageFile: file });
      this.editForm.get('imageFile')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        console.log('Image preview set:', !!this.imagePreview);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
      this.editForm.patchValue({ imageFile: null });
      this.imagePreview = null;
    }
  }

  onSubmit() {
    if (this.editForm.invalid) {
      this.toastr.error('من فضلك، املأ جميع الحقول المطلوبة');
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('title', this.editForm.get('title')?.value || '');
    formData.append('description', this.editForm.get('description')?.value || '');
    formData.append('price', this.editForm.get('price')?.value.toString() || '0');
    formData.append('year', this.editForm.get('year')?.value || '');
    formData.append('category', this.editForm.get('category')?.value || '');
    const imageFile = this.editForm.get('imageFile')?.value;
    if (imageFile) {
      formData.append('PicturalUrl', imageFile, imageFile.name); // تغيير imageFile إلى PicturalUrl
      console.log('Image file added to FormData:', imageFile.name);
    } else {
      console.log('No image file included in FormData');
    }

    for (let pair of (formData as any).entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    this.courseService.updateCourse(this.courseId!, formData).subscribe({
      next: (course) => {
        console.log('Update course response:', course);
        this.toastr.success('تم تعديل الكورس بنجاح!');
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        console.error('Error updating course:', err);
        this.toastr.error('حدث خطأ أثناء تعديل الكورس: ' + (err.error?.message || 'خطأ غير معروف'));
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/users']);
  }
}