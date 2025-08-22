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
import Swal from 'sweetalert2';

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
alert(){
Swal.fire({
  title: "<strong> سياسة الخصوصية</strong>",
  icon: "info",
  html: `
  <p>لضمان تشغيل المنصة بدون أي عطل أو بطء في تحميل الفيديوهات، يرجى الالتزام بالتعليمات التالية:</p>
<p>1-المنصة عبارة عن موقع ويب متاح على متصفحات الويب مثل جوجل كروم او فاير فوكس فقط وليست تطبيق  للاندرويد او الايفون .</p>
<p>2-يجب فتح المنصة من هاتف محمول أو جهاز كمبيوتر أو لاب توب، ويحظر تماماً استخدام أجهزة التابلت الخاصة بالمدارس لأنها غير مؤهلة لاستخدام المنصة حتى وإن كانت متهكرة.</p>
<p>
    3-بعد الاشتراك، مش هيكون متاح استرجاع الكورس أو تبديله، لذا يجب التأكد جيداً من الكورس الذي ترغب في الاشتراك فيه.🚫
</p>
<p>
    4- الحساب مخصص لاستخدامك الشخصي فقط ولا يُسمح بمشاركته مع أصدقائك. في حالة اكتشاف مشاركة الحساب سيتم إغلاقه نهائياً.
</p>
<p>
    5-يجب استخدام إنترنت قوي ومستقر ويفضل استخدام شبكة واي فاي مستقرة.
</p>
<p>
    6-عند التسجيل على المنصة، يجب التأكد من صحة بياناتك لضمان المتابعة الدورية بشكل صحيح.
</p>
<p>
    7-يجب كتابة الاسم باللغة العربية كما هو في البطاقة عند التسجيل.
</p>
<p>
    8-لا تنسَ التأكد من رقم الهاتف وكلمة المرور وكتابة هذه المعلومات في مكان آمن حتى لا تنساها.
</p>
<p>
    9-يمكنك مشاهدة الفيديو الواحد على المنصة بحد أقصى خمس مرات خلال العام الدراسي الواحد.

</p>
<p>
    10-تُحسب المشاهدة عند تجاوز 30% من مدة الفيديو.
</p>
<p>
    11-يجب متابعة المنصة بشكل دوري وحل الواجبات والاختبارات لأن هناك تقارير أسبوعية تُرسل إلى ولي الأمر حول نشاطك على المنصة.
</p>
<p>
    12- ستكون المنصة متاحة لك حتى امتحانات الدور الأول فقط.
</p>
<p>يرجى الالتزام بهذه التعليمات لضمان استفادتك الكاملة من خدمات المنصة.</p> 

  `,
  width:900,
  showCloseButton: true,
  showCancelButton: true,
  focusConfirm: false,
  confirmButtonText: `
    <i class="fa fa-thumbs-up"></i>موافق
  `,
  confirmButtonAriaLabel: "Thumbs up, great!",
 
});
}
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
