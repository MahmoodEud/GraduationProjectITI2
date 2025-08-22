import { Component, inject, signal } from '@angular/core';
import { InvoiceDto } from '../../../../../Interfaces/Billing/invoice-dto';
import { PaymentMethod } from '../../../../../Interfaces/Billing/payment-method';
import { InvoicesServiceService } from '../../../../../Services/Billing/invoices-service.service';
import { StudentCourseService } from '../../../../../Services/student-course.service';
import { InvoiceCreateDto } from '../../../../../Interfaces/Billing/invoice-create-dto';
import { InvoicePaymentDto } from '../../../../../Interfaces/Billing/invoice-payment-dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CourseService } from '../../../../../Services/course.service';
import { StudentService } from '../../../../../Services/student.service';
import { IStudent } from '../../../../../Interfaces/istudent';
import { Course } from '../../../../../Interfaces/ICourse';
import { IPagedResult } from '../../../../../Interfaces/ipaged-result';
import { InvoiceStatus } from '../../../../../Interfaces/Billing/invoice-status';
import { InvoiceUpdateDraftDto, toIsoOrNull } from '../../../../../Interfaces/Billing/invoice-update-draft-dto';

@Component({
  selector: 'app-admin-enroll-invoice',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-enroll-invoice.component.html',
  styleUrl: './admin-enroll-invoice.component.css'
})
export class AdminEnrollInvoiceComponent {
 private api = inject(InvoicesServiceService);
  private toast = inject(ToastrService);
  private courseApi = inject(CourseService);
  private studentApi = inject(StudentService);

  // UI state
  loading = signal(false);
  error = signal<string | null>(null);

  // Lookups
  students: IStudent[] = [];
  courses: Course[] = [];

  // Form state
  studentId = signal<number | null>(null);
  courseId  = signal<number | null>(null);

  accessStart = signal<string | null>(null);  // from <input type="datetime-local">
  accessEnd   = signal<string | null>(null);

  amount   = signal<number | null>(null);
  currency = signal('EGP'); // مقفولة
  notes    = signal<string>('');

  // Created/loaded invoice
  createdInvoice = signal<InvoiceDto | null>(null);

  // Payment modal
  showPay = signal(false);
  paymentMethod = signal<number>(0); // 0 Cash / 1 Bank / 2 Wallet / 3 Other
  paymentRef    = signal<string>('');
  paymentNotes  = signal<string>('');

  // Attachment
  attachmentFile: File | null = null;

  async ngOnInit() {
    await Promise.all([this.loadStudents(), this.loadCourses()]);
  }

  private async loadStudents() {
    try {
      const res = await this.studentApi.getAllStudents().toPromise() as IPagedResult<IStudent>;
      this.students = res?.items ?? [];
    } catch {
      this.toast.error('فشل تحميل قائمة الطلاب');
    }
  }

  private async loadCourses() {
    try {
      const res = await this.courseApi.getCourses().toPromise() as IPagedResult<Course>;
      this.courses = res?.items ?? [];
    } catch {
      this.toast.error('فشل تحميل قائمة الكورسات');
    }
  }

  private validateDraft(): string | null {
    if (!this.studentId()) return 'اختر الطالب أولاً';
    if (!this.amount() || this.amount()! <= 0) return 'أدخل مبلغًا صالحًا';
    return null;
  }

  /** إنشاء مسودة */
  async createDraft() {
    const msg = this.validateDraft();
    if (msg) { this.toast.error(msg); return; }

    this.loading.set(true); this.error.set(null);
    try {
      const dto = {
        studentId: this.studentId()!,
        courseId: this.courseId() ?? undefined,
        amount: this.amount()!,
        currency: this.currency(),
        notes: this.notes() || undefined,
        accessStart: toIsoOrNull(this.accessStart()),
        accessEnd: toIsoOrNull(this.accessEnd())
      };
      const res = await this.api.createDraft(dto).toPromise();
      this.createdInvoice.set(res!);
      this.toast.success('تم إنشاء المسودة');
    } catch (e: any) {
      this.error.set(e?.error || e?.message || 'فشل إنشاء المسودة');
    } finally {
      this.loading.set(false);
    }
  }

  /** إرسال المسودة */
  async send() {
    if (!this.createdInvoice() || !this.isDraft()) return;
    this.loading.set(true); this.error.set(null);
    try {
      const res = await this.api.send(this.createdInvoice()!.id).toPromise();
      this.createdInvoice.set(res!);
      this.toast.success('تم إرسال الفاتورة');
    } catch (e: any) {
      this.error.set(e?.error || e?.message || 'فشل إرسال الفاتورة');
    } finally {
      this.loading.set(false);
    }
  }

  /** تحصيل/دفع */
  async markPaid() {
    if (!this.createdInvoice()) return;
    this.loading.set(true); this.error.set(null);
    try {
      // الباك إند بيقرأ property اسمها "method"
      const body: any = {
        method: this.paymentMethod(),
        paymentRef: this.paymentRef() || null,
        notes: this.paymentNotes() || null
      };
      const res = await this.api.markPaid(this.createdInvoice()!.id, body).toPromise();
      this.createdInvoice.set(res!);
      this.toast.success('تم تحصيل الفاتورة');
      this.showPay.set(false);
    } catch (e: any) {
      this.error.set(e?.error || e?.message || 'فشل التحصيل');
    } finally {
      this.loading.set(false);
    }
  }

  /** رفع مرفق */
  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.attachmentFile = input.files?.[0] ?? null;
  }
  async uploadAttachment() {
    if (!this.createdInvoice() || !this.attachmentFile) return;
    this.loading.set(true); this.error.set(null);
    try {
      const res = await this.api.uploadAttachment(this.createdInvoice()!.id, this.attachmentFile).toPromise();
      this.createdInvoice.set(res!);
      this.toast.success('تم رفع المرفق');
      this.attachmentFile = null;
    } catch (e: any) {
      this.error.set(e?.error || e?.message || 'فشل رفع المرفق');
    } finally {
      this.loading.set(false);
    }
  }

  /** حفظ تعديلات المسودة */
  async saveDraft() {
    if (!this.createdInvoice() || !this.isDraft()) return;

    // تحقق سريع
    if (!this.studentId()) { this.toast.error('اختر الطالب أولاً'); return; }
    if (!this.amount() || this.amount()! <= 0) { this.toast.error('أدخل مبلغًا صالحًا'); return; }

    this.loading.set(true); this.error.set(null);
    try {
      const dto: InvoiceUpdateDraftDto = {
        studentId: this.studentId() ?? null,
        courseId: this.courseId() ?? null,
        amount: this.amount() ?? null,
        notes: this.notes() ?? null,
        accessStart: toIsoOrNull(this.accessStart()),
        accessEnd: toIsoOrNull(this.accessEnd())
      };
      const res = await this.api.updateDraft(this.createdInvoice()!.id, dto).toPromise();
      this.createdInvoice.set(res!);
      this.toast.success('تم حفظ تعديلات المسودة');
    } catch (e: any) {
      this.error.set(e?.error?.message || e?.message || 'تعذّر حفظ المسودة');
    } finally {
      this.loading.set(false);
    }
  }

  /** حذف المسودة */
  async deleteDraft() {
    if (!this.createdInvoice()) return;
    if (!this.isDraft()) { this.toast.error('لا يمكن حذف إلا المسودات'); return; }

    if (!confirm('هتحذف المسودة نهائيًا. متأكد؟')) return;

    this.loading.set(true); this.error.set(null);
    try {
      await this.api.deleteDraft(this.createdInvoice()!.id).toPromise();
      this.toast.success('تم حذف المسودة');

      // Reset form
      this.createdInvoice.set(null);
      this.studentId.set(null);
      this.courseId.set(null);
      this.amount.set(null);
      this.notes.set('');
      this.accessStart.set(null);
      this.accessEnd.set(null);
    } catch (e: any) {
      this.error.set(e?.error?.message || e?.message || 'تعذّر حذف المسودة');
    } finally {
      this.loading.set(false);
    }
  }

  /** Helpers */
  isDraft() {
    const inv = this.createdInvoice();
    return !!inv && (inv.status === InvoiceStatus.Draft || (inv.status as any) === 'Draft');
  }

  statusNameAr(st: InvoiceStatus | string | null | undefined): string {
    const v = typeof st === 'string' ? st : (st as any);
    switch (v) {
      case InvoiceStatus.Draft:
      case 'Draft':     return 'مسودة';
      case InvoiceStatus.Sent:
      case 'Sent':      return 'تم الإرسال';
      case InvoiceStatus.Paid:
      case 'Paid':      return 'مدفوعة';
      case InvoiceStatus.Cancelled:
      case 'Cancelled': return 'ملغاة';
      default: return '—';
    }
  }

  statusBadge(st: InvoiceStatus | string | null | undefined): string {
    const v = typeof st === 'string' ? st : (st as any);
    switch (v) {
      case InvoiceStatus.Draft:
      case 'Draft':     return 'badge bg-secondary';
      case InvoiceStatus.Sent:
      case 'Sent':      return 'badge bg-info text-dark';
      case InvoiceStatus.Paid:
      case 'Paid':      return 'badge bg-success';
      case InvoiceStatus.Cancelled:
      case 'Cancelled': return 'badge bg-danger';
      default: return 'badge bg-light text-dark';
    }
  }
}
