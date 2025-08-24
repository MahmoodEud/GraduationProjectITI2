import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../Services/register/environment';
import { AccountService } from '../../Services/account.service';
import { ILoginUser } from '../../Interfaces/ilogin-user';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  /*
  constructor(public Login:LoginService,private router: Router,private toaster:ToastrService) {}
  onSubmit(){
    this.Login.login().subscribe({
      next:res=>{
        this.toaster.success('تم تسجيل الدخول بنجاح');
        localStorage.setItem('token', JSON.stringify(res));
        this.router.navigateByUrl('/MainPage')
      },
        error: err => {
         this.toaster.error('خطأ في اسم المستخدم أو كلمة المرور');
      }
    })
  }
  */

  private router = inject(Router);
  private toastr = inject(ToastrService);
  accoutnService = inject(AccountService);
  // model:any;
  model: ILoginUser = { 
    username:'',
    password:''
  };
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
sweat(){
  Swal.fire({
  title: "<strong> هل نسيت كلمة المرور ؟</strong>",
  icon: "info",
  html: `
  <p>يتم تعديل كلمة المرور عن طريق الأدمن أو عن طريق الطالب داخل المنصة
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
  onSubmit() {
    this.accoutnService.login(this.model).subscribe({
      next: (res) => {
          this.toastr.success('تم تسجيل الدخول بنجاح');
        this.router.navigateByUrl('/main');
      },
      // The error will not always be related to the client
      // Maybe it is a server error...so we will not make any assumptions
      error: error =>{ 
        this.toastr.error('خطأ في اسم المستخدم أو كلمة المرور');
        // this.toastr.error(error.error)
      }
    });
  }
}
