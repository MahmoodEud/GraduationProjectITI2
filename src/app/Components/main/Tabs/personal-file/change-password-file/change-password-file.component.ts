import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudentService } from '../../../../../Services/student.service';
import { AccountService } from '../../../../../Services/account.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-password-file',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './change-password-file.component.html',
  styleUrl: './change-password-file.component.css'
})
export class ChangePasswordFileComponent {
  errorMsg: string | null = null;

  private accountService = inject(AccountService);
  private toastr = inject(ToastrService);

  model: any = {};

  constructor(
    private router: Router,
  ) {}

  submit() {
    this.accountService.studentChangePassword(this.model).subscribe({
      next: () => {
        this.router.navigate(['/main']);
      },
      error: error => this.toastr.error(error.error)
    });
  }

  cancel() {
    this.router.navigate(['/main']);
  }
}
