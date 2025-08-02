import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registrationForm = new FormGroup(
    {
      name: new FormControl('', [
        Validators.pattern(
          '^(?:[\u0600-\u06FFa-zA-Z]{2,}\\s+){3,}[\u0600-\u06FFa-zA-Z]{2,}$'
        ),
        Validators.required,
      ]),
      username: new FormControl('', [
        Validators.pattern(
          '^(?!.*[_.]{2})(?![_.])[a-zA-Z0-9._]{4,18}(?<![_.])$'
        ),
        Validators.required,
      ]),
      PhoneNumber: new FormControl('', [
        Validators.pattern('^01[0125][0-9]{8}$'),
        Validators.required,
      ]),
      parentphonenumber: new FormControl('', [
        Validators.pattern('^01[0125][0-9]{8}$'),
        Validators.required,
      ]),
      Grade:new FormControl(
        '',
        [Validators.required]
      ),
      BirthDate: new FormControl('', Validators.required),
      Password: new FormControl('', [
        Validators.minLength(6),
        Validators.required,
      ]),
      confirmPassword: new FormControl('', [
        Validators.minLength(6),
        Validators.required,
      ]),
    },
    { validators: (form) => this.matchPasswords(form) }
  );
  matchPasswords(form: any) {
    const password = form.get('Password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }
  onSubmit() {
    if (this.registrationForm.valid) {
      console.log(this.registrationForm.value);
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }
}
