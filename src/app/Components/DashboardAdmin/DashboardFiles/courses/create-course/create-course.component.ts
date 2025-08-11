import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../../../../Services/course.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule, NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule, NgClass],
  templateUrl: './create-course.component.html',
  styleUrl: './create-course.component.css'
})
export class CreateCourseComponent {
  
  submitting = false;
  previewUrl: string | null = null;
  serverError: string | null = null;
  form = this.fb.group({
    Title: ['', [Validators.required, Validators.maxLength(50)]],
    Category: ['', [Validators.required, Validators.maxLength(50)]],
    Year: [1, [Validators.required]],
    Price: [0, [Validators.required, Validators.min(0)]],
    Description: ['', [Validators.required, Validators.maxLength(500)]],
    Status: [true, [Validators.required]],
    PicturalUrl: [null as File | null]
  });

  constructor(private fb: FormBuilder, private api: CourseService,private toast:ToastrService) {}

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.form.patchValue({ PicturalUrl: file });
    this.previewUrl && URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = file ? URL.createObjectURL(file) : null;
  }

  submit() {
    this.serverError = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;

    const fd = new FormData();
    fd.append('Title', this.form.value.Title!);
    fd.append('Category', this.form.value.Category!);
    fd.append('Year', String(this.form.value.Year!));
    fd.append('Price', String(this.form.value.Price!));
    fd.append('Description', this.form.value.Description!);
    fd.append('Status', String(this.form.value.Status!));
    const file = this.form.value.PicturalUrl as File | null;
    if (file) fd.append('PicturalUrl', file);

    this.api.createCourse(fd).subscribe({
      next: _ => {
        this.submitting = false;
        this.form.reset({ Year: 1, Status: true, Price: 0 });
        if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
        this.previewUrl = null;
        this.toast.success('طرقعنا كورس جديد خش شوف يمكن يعجبك');
      },
      error: (e: HttpErrorResponse) => {
        this.submitting = false;
        this.serverError = e.error?.title || e.error?.message || 'فشل إنشاء الكورس';
      }
    });
  }
}
