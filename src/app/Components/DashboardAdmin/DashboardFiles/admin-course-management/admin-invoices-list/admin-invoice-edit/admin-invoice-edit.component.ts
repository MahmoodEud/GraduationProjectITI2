import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { InvoicesServiceService } from '../../../../../../Services/Billing/invoices-service.service';
import { StudentService } from '../../../../../../Services/student.service';
import { CourseService } from '../../../../../../Services/course.service';
import { IStudent } from '../../../../../../Interfaces/istudent';
import { Course } from '../../../../../../Interfaces/ICourse';
import { InvoiceDto } from '../../../../../../Interfaces/Billing/invoice-dto';
import { IPagedResult } from '../../../../../../Interfaces/ipaged-result';
import { InvoiceStatus } from '../../../../../../Interfaces/Billing/invoice-status';
import { InvoiceUpdateDraftDto, toIsoOrNull } from '../../../../../../Interfaces/Billing/invoice-update-draft-dto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-invoice-edit',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './admin-invoice-edit.component.html',
  styleUrl: './admin-invoice-edit.component.css'
})
export class AdminInvoiceEditComponent {
 private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastrService);
  private api = inject(InvoicesServiceService);
  private studentApi = inject(StudentService);
  private courseApi = inject(CourseService);

  loading = signal(false);
  error = signal<string | null>(null);

  students: IStudent[] = [];
  courses: Course[] = [];

  invoice = signal<InvoiceDto | null>(null);

  studentId = signal<number | null>(null);
  courseId  = signal<number | null>(null);
  amount    = signal<number | null>(null);
  currency  = signal<string>('EGP');
  notes     = signal<string>('');
  accessStart = signal<string | null>(null); 
  accessEnd   = signal<string | null>(null);

  get id(): number | null {
    const p = this.route.snapshot.paramMap.get('id');
    const q = this.route.snapshot.queryParamMap.get('id');
    const v = Number(p ?? q ?? NaN);
    return Number.isFinite(v) ? v : null;
  }

  async ngOnInit() {
    if (!this.id) {
      this.error.set('معرّف الفاتورة غير صحيح.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      // load lookups + invoice
      const [stRes, crRes, inv] = await Promise.all([
        this.studentApi.getAllStudents().toPromise() as Promise<IPagedResult<IStudent>>,
        this.courseApi.getCourses().toPromise() as Promise<IPagedResult<Course>>,
        this.api.getById(this.id).toPromise() as Promise<InvoiceDto>
      ]);
      this.students = stRes?.items ?? [];
      this.courses = crRes?.items ?? [];
      this.invoice.set(inv);
      this.patchFormFromInvoice(inv);
    } catch (e: any) {
      this.error.set(e?.error?.message || e?.message || 'تعذر تحميل بيانات الفاتورة');
    } finally {
      this.loading.set(false);
    }
  }

  private patchFormFromInvoice(inv: InvoiceDto) {
    this.studentId.set(inv.studentId ?? null);
    this.courseId.set(inv.courseId ?? null);
    this.amount.set(inv.amount ?? null);
    this.currency.set(inv.currency ?? 'EGP');
    this.notes.set(inv.notes ?? '');

    // نحتفظ بالقيمة كما هي (ISO) — كافية للـ datetime-local في أغلب الحالات
    this.accessStart.set(inv.accessStart ?? null);
    this.accessEnd.set(inv.accessEnd ?? null);
  }

  isDraft() {
    const inv = this.invoice();
    return !!inv && (inv.status === InvoiceStatus.Draft || (inv.status as any) === 'Draft');
  }

  statusNameAr(st: number | string | null | undefined): string {
    const v = typeof st === 'string' ? st : (st as any);
    switch (v) {
      case InvoiceStatus.Draft:
      case 'Draft': return 'مسودة';
      case InvoiceStatus.Sent:
      case 'Sent': return 'تم الإرسال';
      case InvoiceStatus.Paid:
      case 'Paid': return 'مدفوعة';
      case InvoiceStatus.Cancelled:
      case 'Cancelled': return 'ملغاة';
      default: return '—';
    }
  }

  statusBadge(st: number | string | null | undefined): string {
    const v = typeof st === 'string' ? st : (st as any);
    switch (v) {
      case InvoiceStatus.Draft:
      case 'Draft': return 'badge bg-secondary';
      case InvoiceStatus.Sent:
      case 'Sent':  return 'badge bg-info text-dark';
      case InvoiceStatus.Paid:
      case 'Paid':  return 'badge bg-success';
      case InvoiceStatus.Cancelled:
      case 'Cancelled': return 'badge bg-danger';
      default: return 'badge bg-light text-dark';
    }
  }

  async save() {
    if (!this.invoice()) return;
    if (!this.isDraft()) { this.toast.error('لا يمكن تعديل إلا الفواتير المسودة'); return; }
    if (!this.studentId()) { this.toast.error('اختر الطالب أولاً'); return; }
    if (!this.amount() || this.amount()! <= 0) { this.toast.error('أدخل مبلغًا صالحًا'); return; }

    this.loading.set(true);
    this.error.set(null);
    try {
      const dto: InvoiceUpdateDraftDto = {
        studentId: this.studentId(),
        courseId: this.courseId(),
        amount: this.amount(),
        notes: this.notes() ?? null,
        accessStart: toIsoOrNull(this.accessStart()),
        accessEnd: toIsoOrNull(this.accessEnd())
      };
      const res = await this.api.updateDraft(this.invoice()!.id, dto).toPromise();
      this.invoice.set(res!);
      this.toast.success('تم حفظ تعديلات المسودة');
    } catch (e: any) {
      this.error.set(e?.error?.message || e?.message || 'تعذر حفظ التعديلات');
    } finally {
      this.loading.set(false);
    }
  }

  async send() {
    if (!this.invoice() || !this.isDraft()) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.api.send(this.invoice()!.id).toPromise();
      this.invoice.set(res!);
      this.toast.success('تم إرسال الفاتورة');
    } catch (e: any) {
      this.error.set(e?.error?.message || e?.message || 'تعذر إرسال الفاتورة');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteDraft() {
    if (!this.invoice()) return;
    if (!this.isDraft()) { this.toast.error('لا يمكن حذف إلا المسودات'); return; }
    if (!confirm('سيتم حذف المسودة نهائيًا. هل أنت متأكد؟')) return;

    this.loading.set(true);
    this.error.set(null);
    try {
      await this.api.deleteDraft(this.invoice()!.id).toPromise();
      this.toast.success('تم حذف المسودة');
      this.router.navigate(['/admin/invoices']); 
    } catch (e: any) {
      this.error.set(e?.error?.message || e?.message || 'تعذر حذف المسودة');
    } finally {
      this.loading.set(false);
    }
  }

  backToList() {
    this.router.navigate(['/admin/invoices']); 
  }
}
