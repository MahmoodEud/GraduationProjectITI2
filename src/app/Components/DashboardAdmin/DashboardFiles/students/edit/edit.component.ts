import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentService } from '../../../../../Services/student.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AccountService } from '../../../../../Services/account.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent {
  currentStudent: any;
  form!: FormGroup;
  isLoading = true;
  errorMsg: string | null = null;
  isAdminMode = false;
  targetId = '';

  years = [
    { value: 1, label: 'الصف الأول الثانوي' },
    { value: 2, label: 'الصف الثاني الثانوي' },
    { value: 3, label: 'الصف الثالث الثانوي' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private students: StudentService,
    private auth: AccountService
  ) {}

  ngOnInit() {
    // بدون حقول الباسورد علشان ما توقفش الزرار
    this.form = this.fb.group({
      name: ['', [
        Validators.pattern('^(?:[\\u0600-\\u06FFa-zA-Z]{2,}\\s+){3,}[\\u0600-\\u06FFa-zA-Z]{2,}$'),
        Validators.required,
      ]],
      username: ['', [
        Validators.pattern('^(?!.*[_.]{2})(?![_.])[a-zA-Z0-9._]{4,18}(?<![_.])$'),
        Validators.required,
      ]],
      PhoneNumber: ['', [
        Validators.pattern('^01[0125][0-9]{8}$'),
        Validators.required,
      ]],
      parentphonenumber: ['', [
        Validators.pattern('^01[0125][0-9]{8}$'),
        Validators.required,
      ]],
      Grade: ['', [Validators.required]],
      BirthDate: ['', Validators.required],
    });

    const paramId = this.route.snapshot.paramMap.get('id');
    this.isAdminMode = !!paramId;
    this.targetId = paramId ?? (this.auth.getCurrentUserId() ?? '');

    if (!this.targetId) {
      this.errorMsg = 'تعذر تحديد المستخدم';
      this.isLoading = false;
      return;
    }

    this.students.getStudentById(this.targetId).subscribe({
      next: s => {
        this.currentStudent = s; // نحتفظ بالقيم غير الموجودة في الفورم (زي isActive)
        this.form.patchValue({
          name: s.name ?? '',
          username: s.userName ?? '',
          PhoneNumber: s.phoneNumber ?? '',
          parentphonenumber: s.parentNumber ?? '',
          BirthDate: s.birthdate ? s.birthdate.substring(0, 10) : '',
          Grade: this.mapLevelToYearNumber(s.studentLevel),
        });
        this.isLoading = false;
      },
      error: err => {
        this.errorMsg = typeof err.error === 'string' ? err.error : 'فشل جلب البيانات';
        this.isLoading = false;
      }
    });
  }

  mapLevelToYearNumber(level?: string) {
    switch (level) {
      case 'الصف_الأول_الثانوي': return 1;
      case 'الصف_الثاني_الثانوي': return 2;
      case 'الصف_الثالث_الثانوي': return 3;
      default: return 1;
    }
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.value;
    const s = this.currentStudent || {};

    // مطابق لـ IStudentUpdate (userId + isActive)
    const payload = {
      userId: this.targetId,
      isActive: s.isActive ?? true,
      name: v.name as string,
      userName: (v.username || s.userName) as string,
      phoneNumber: v.PhoneNumber as string,
      parentNumber: v.parentphonenumber as string,
      birthdate: v.BirthDate ? new Date(v.BirthDate as string).toISOString() : (s.birthdate ?? null),
      year: Number(v.Grade) // لو الـ API بيستخدم studentYear غيّر المفتاح هنا
    };

    this.students.updateStudent(this.targetId, payload).subscribe({
      next: _ => {
        this.router.navigate(this.isAdminMode ? ['/admin','users'] : ['/account']);
      },
      error: err => {
        const msg = typeof err.error === 'string'
          ? err.error
          : (err.error?.detail || err.error?.title || 'فشل حفظ التعديلات');
        this.errorMsg = msg;
      }
    });
  }

  cancel() {
    this.router.navigate(this.isAdminMode ? ['/admin','users'] : ['/account']);
  }
}
