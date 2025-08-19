import { Component, inject, ViewChild } from '@angular/core';
import { AccountService } from '../../../../Services/account.service';
import { StudentService } from '../../../../Services/student.service';
import { IStudent } from '../../../../Interfaces/istudent';
import { IAdminChangePassword } from '../../../../Interfaces/iadmin-change-password';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:'./user-setting.component.html',
  styleUrl: './user-setting.component.css'
})
export class UserSettingComponent {
  private accountService = inject(AccountService);
  private studentService = inject(StudentService);

  @ViewChild('userSettingForm') userSettingForm!: NgForm;

  users: IStudent[] = [];
  selectedUserId: string = '';
  selectedUserName: string = '';
  selectedRole: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMsg: string = '';
  successMsg: string = '';
  isLoading: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  roles: string[] = ['Admin', 'Student', 'Assistance'];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.studentService.getAllStudents().subscribe({
      next: res => {
        console.log('Users:', res.items);
        this.users = res.items;
      },
      error: err => {
        console.error('Error fetching users:', err);
        this.errorMsg = 'فشل جلب المستخدمين';
      }
    });
  }

  submit(form: NgForm): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!form.valid) {
      this.markFormGroupTouched(form);
      return;
    }

    if (!this.selectedUserId || !this.selectedUserName) {
      this.errorMsg = 'يرجى اختيار مستخدم';
      form.form.markAsPristine();
      return;
    }

    // إذا تم إدخال باسورد، نفّذ تغيير الباسورد
    if (this.newPassword || this.confirmPassword) {
      if (this.newPassword !== this.confirmPassword) {
        this.errorMsg = 'كلمات المرور غير متطابقة';
        form.form.markAsPristine();
        return;
      }

      if (this.newPassword.length < 8) {
        this.errorMsg = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
        form.form.markAsPristine();
        return;
      }

      this.changePassword();
    } 
    // إذا تم اختيار دور، نفّذ تعيين الدور
    else if (this.selectedRole) {
      this.assignRole();
    } 
    else {
      this.errorMsg = 'يرجى إدخال كلمة مرور جديدة أو اختيار دور';
      form.form.markAsPristine();
      return;
    }
  }

  changePassword(): void {
    this.isLoading = true;
    this.accountService.adminChangePassword(this.selectedUserId, { newPassword: this.newPassword } as IAdminChangePassword)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Password change response:', response);
          this.successMsg = response.message || 'تم تغيير كلمة المرور بنجاح!';
          setTimeout(() => {
            this.resetForm();
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Password change error:', error);
          console.log('Error details:', error.status, error.error);
          this.errorMsg = error.error?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
        }
      });
  }

  assignRole(): void {
    this.isLoading = true;
    this.accountService.assignRole(this.selectedUserName, this.selectedRole)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Assign role response:', response);
          this.successMsg = response.message || 'تم تعيين الدور بنجاح!';
          setTimeout(() => {
            this.resetForm();
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Assign role error:', error);
          console.log('Error details:', error.status, error.error);
          this.errorMsg = error.error?.message || 'حدث خطأ أثناء تعيين الدور';
        }
      });
  }

  resetForm(): void {
    this.selectedUserId = '';
    this.selectedUserName = '';
    this.selectedRole = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMsg = '';
    this.successMsg = '';
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    if (this.userSettingForm) {
      this.userSettingForm.resetForm();
      this.userSettingForm.form.markAsPristine();
      this.userSettingForm.form.markAsUntouched();
    }
  }

  togglePasswordVisibility(field: 'new' | 'confirm'): void {
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  private markFormGroupTouched(form: NgForm): void {
    Object.values(form.controls).forEach(c => c.markAsTouched());
  }

  onUserChange(): void {
    const selectedUser = this.users.find(user => user.id === this.selectedUserId);
  this.selectedUserName = this.users.find(u => u.id === this.selectedUserId)?.userName || '';
  }
}