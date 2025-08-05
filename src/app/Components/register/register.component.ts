import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { registerService } from '../../Services/register/Register-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  selectedImage: File | null = null;

  constructor(private registerService:registerService ) {}

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


matchPasswords(control: AbstractControl): ValidationErrors | null{
    const form = control as FormGroup;
  const password = form.get('Password')?.value;
  const confirmPassword = form.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
  }


onImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedImage = input.files[0];
  }
}



 onSubmit() {
  if (this.registrationForm.valid && this.selectedImage) {
    const formData = new FormData();
    const data = this.registrationForm.value;

    formData.append('Name', data.name!);
    formData.append('UserName', data.username!);
    formData.append('Phone', data.PhoneNumber!);
    formData.append('ParentPhone', data.parentphonenumber!);
    formData.append('Birthdate', data.BirthDate!);
    formData.append('studentYear', data.Grade!.toString());
    formData.append('Password', data.Password!);
    formData.append('ConfirmPassword', data.confirmPassword!);
    formData.append('ProfilePicture', this.selectedImage!);

    this.registerService.onChange(formData); 
  } else {
    this.registrationForm.markAllAsTouched();
  }
}
  }
