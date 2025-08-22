import { Component, computed, inject, signal } from '@angular/core';
import { InvoiceStatus } from '../../../../../Interfaces/Billing/invoice-status';
import { InvoiceDto } from '../../../../../Interfaces/Billing/invoice-dto';
import { InvoiceSearchFilter } from '../../../../../Interfaces/Billing/invoice-search-filter';
import { InvoicesServiceService } from '../../../../../Services/Billing/invoices-service.service';
import { IPagedResult } from '../../../../../Interfaces/ipaged-result';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-invoices-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-invoices-list.component.html',
  styleUrl: './admin-invoices-list.component.css'
})
export class AdminInvoicesListComponent {
  studentId = signal<number | null>(null);
  courseId  = signal<number | null>(null);
  status    = signal<InvoiceStatus | 'all'>('all');
  dateFrom  = signal<string | null>(null); // <input type="date">
  dateTo    = signal<string | null>(null);

  // paging
  page = signal(1);
  pageSize = signal(20);

  // data + ui state
  loading = signal(false);
  error = signal<string | null>(null);
  items = signal<InvoiceDto[]>([]);
  totalCount = signal(0);
  totalPages = signal(1);

  // deps
  private invoices = inject(InvoicesServiceService);
  private toast = inject(ToastrService);
  private router = inject(Router);

  statusOptions = [
    { label: 'الكل', value: 'all' as const },
    { label: 'Draft', value: InvoiceStatus.Draft },
    { label: 'Sent', value: InvoiceStatus.Sent },
    { label: 'Paid', value: InvoiceStatus.Paid },
    { label: 'Cancelled', value: InvoiceStatus.Cancelled },
  ];

  rangeLabel = computed(() => {
    const p = this.page();
    const ps = this.pageSize();
    const total = this.totalCount();
    const start = (p - 1) * ps + 1;
    const end = Math.min(p * ps, total);
    if (total === 0) return 'لا توجد بيانات';
    return `${start} - ${end} من ${total}`;
  });

  constructor() {
    this.load();
  }

  private toIsoDate(d: string | null): string | undefined {
    // من input type="date" (YYYY-MM-DD). الباك يقبله كما هو
    return d ?? undefined;
  }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const filter: InvoiceSearchFilter = {
        studentId: this.studentId() || undefined,
        courseId: this.courseId() || undefined,
        status: this.status() === 'all' ? undefined : (this.status() as InvoiceStatus),
        dateFrom: this.toIsoDate(this.dateFrom()),
        dateTo: this.toIsoDate(this.dateTo()),
        page: this.page(),
        pageSize: this.pageSize()
      };
      const res = await this.invoices.search(filter).toPromise() as IPagedResult<InvoiceDto>;
      this.items.set(res.items || []);
      this.totalCount.set(res.totalCount || 0);
      this.totalPages.set(res.totalPages || 1);
    } catch (e: any) {
      this.error.set(e?.error?.message || e?.message || 'تعذر تحميل الفواتير');
    } finally {
      this.loading.set(false);
    }
  }

  clearFilters() {
    this.studentId.set(null);
    this.courseId.set(null);
    this.status.set('all');
    this.dateFrom.set(null);
    this.dateTo.set(null);
    this.page.set(1);
    this.load();
  }

  prev() { if (this.page() > 1) { this.page.set(this.page() - 1); this.load(); } }
  next() { if (this.page() < this.totalPages()) { this.page.set(this.page() + 1); this.load(); } }

  // === Actions (edit/delete) ===
  canDelete(it: InvoiceDto) {
    // يدعم enum أو string
    return it.status === InvoiceStatus.Draft || (it as any).status === 'Draft';
  }

  async delete(it: InvoiceDto) {
    if (!this.canDelete(it)) {
      this.toast.error('لا يمكن حذف إلا الفواتير المسودة');
      return;
    }
    if (!confirm(`هتحذف المسودة #${it.id}. متأكد؟`)) return;

    this.loading.set(true);
    try {
      await this.invoices.deleteDraft(it.id).toPromise();
      this.toast.success('تم حذف المسودة');
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.error?.message || e?.message || 'تعذّر حذف المسودة');
    } finally {
      this.loading.set(false);
    }
  }

  edit(it: InvoiceDto) {
    // لو عامل روت: admin/invoices/:id/edit
    this.router.navigate(['/admin/invoices', it.id, 'edit']);
    // لو حابب query param بدلها:
    // this.router.navigate(['/admin/invoice-edit'], { queryParams: { id: it.id } });
  }

  // === Helpers لعرض الحالة ===
  statusNameAr(st: number | string | null | undefined): string {
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

  statusBadge(s: number | string) {
    const v = typeof s === 'string' ? s : (s as any);
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

  trackById = (_: number, it: InvoiceDto) => it.id;
}
