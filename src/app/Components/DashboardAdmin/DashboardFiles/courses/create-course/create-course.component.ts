import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CourseService } from '../../../../../Services/course.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.css']
})
export class CreateCourseComponent {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  createForm: FormGroup;
  isSubmitting: boolean = false;
  imagePreview: string | ArrayBuffer | null = null;

  constructor() {
    this.createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      year: ['', Validators.required],
      category: [''],
      imageFile: [null]
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
      this.createForm.patchValue({ imageFile: file });
      this.createForm.get('imageFile')?.updateValueAndValidity();

      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        console.log('Image preview set:', !!this.imagePreview);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
      this.createForm.patchValue({ imageFile: null });
      this.imagePreview = null;
    }
  }

  onSubmit() {
    if (this.createForm.invalid) {
      this.toastr.error('من فضلك، املأ جميع الحقول المطلوبة');
      this.createForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('title', this.createForm.get('title')?.value || '');
    formData.append('description', this.createForm.get('description')?.value || '');
    formData.append('price', this.createForm.get('price')?.value.toString() || '0');
    formData.append('year', this.createForm.get('year')?.value || '');
    formData.append('category', this.createForm.get('category')?.value || '');
    const imageFile = this.createForm.get('imageFile')?.value;
    if (imageFile) {
      formData.append('PicturalUrl', imageFile, imageFile.name); // تغيير imageFile إلى PicturalUrl
      console.log('Image file added to FormData:', imageFile.name);
    } else {
      console.log('No image file included in FormData');
    }

    // طباعة FormData للتحقق
    for (let pair of (formData as any).entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    this.courseService.createCourse(formData).subscribe({
      next: (course) => {
        console.log('Create course response:', course);
        this.toastr.success('تم إنشاء الكورس بنجاح!');
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        console.error('Error creating course:', err);
        this.toastr.error('حدث خطأ أثناء إنشاء الكورس: ' + (err.error?.message || 'خطأ غير معروف'));
        this.isSubmitting = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/users']);
  }
}