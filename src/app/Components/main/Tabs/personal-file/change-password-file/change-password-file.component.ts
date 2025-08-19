import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentService } from '../../../../../Services/student.service';
import { AccountService } from '../../../../../Services/account.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { IUserChangePassword } from '../../../../../Interfaces/iuser-change-password';
import { IPasswordChangeForm } from '../../../../../Interfaces/ipassword-change-form';

@Component({
  selector: 'app-change-password-file',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './change-password-file.component.html',
  styleUrl: './change-password-file.component.css'
})
export class ChangePasswordFileComponent {
   private accountService = inject(AccountService);
  private router=inject(Router);

  model: IPasswordChangeForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  errorMsg: string = '';
  successMsg: string = '';
  isLoading: boolean = false;
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor() { }

  submit(form: NgForm): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!form.valid) {
      this.markFormGroupTouched(form);
      return;
    }

    if (this.model.newPassword !== this.model.confirmPassword) {
      this.errorMsg = 'كلمات المرور غير متطابقة';
      return;
    }

    if (this.model.newPassword.length < 8) {
      this.errorMsg = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
      return;
    }

    this.changePassword();
  }

  changePassword(): void {
    this.isLoading = true;
    
    const changePasswordModel: IUserChangePassword = {
      currentPassword: this.model.currentPassword,
      newPassword: this.model.newPassword
    };

    this.accountService.studentChangePassword(changePasswordModel).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMsg = 'تم تغيير كلمة المرور بنجاح!';
        this.resetForm();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Password change error:', error);
        
        if (error.status === 400) {
          this.errorMsg = 'كلمة المرور الحالية غير صحيحة';
        } else if (error.status === 422) {
          this.errorMsg = 'كلمة المرور الجديدة لا تتوافق مع المتطلبات';
        } else if (error.status === 404) {
          this.errorMsg = 'المستخدم غير موجود';
        } else {
          this.errorMsg = 'حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة مرة أخرى';
        }
      }
    });
  }

  cancel(): void {
    this.resetForm();
    this.router.navigate(['/main']);

  }

  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  private markFormGroupTouched(form: NgForm): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.controls[key];
      control.markAsTouched();
    });
  }

  private resetForm(): void {
    this.model = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.errorMsg = '';
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }
}
