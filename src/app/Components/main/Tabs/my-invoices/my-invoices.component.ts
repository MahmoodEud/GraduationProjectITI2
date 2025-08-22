import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { InvoiceDto } from '../../../../Interfaces/Billing/invoice-dto';
import { InvoicesServiceService } from '../../../../Services/Billing/invoices-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../Services/register/environment';

const STATUS_BY_INDEX = ['Draft','Sent','Paid','Cancelled'] as const;
type InvoiceStatus = typeof STATUS_BY_INDEX[number];
@Component({
  selector: 'app-my-invoices',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './my-invoices.component.html',
  styleUrl: './my-invoices.component.css'
})
export class MyInvoicesComponent implements OnInit {
  private api = inject(InvoicesServiceService);

  loading = signal(false);
  error   = signal<string|null>(null);
  all     = signal<InvoiceDto[]>([]);

  // فلاتر
  search     = signal('');
  status     = signal<'all' | InvoiceStatus>('all');
  dateFrom   = signal(''); // YYYY-MM-DD
  dateTo     = signal(''); // YYYY-MM-DD
  onlyUnpaid = signal(false);

  // Helper: حوّل أي قيمة حالة (رقم/سترينج) إلى InvoiceStatus مضبوط
  private toStr(st: InvoiceStatus | number): InvoiceStatus {
    return typeof st === 'number'
      ? (STATUS_BY_INDEX[st] ?? 'Draft')
      : st;
  }

  rows = computed(() => {
    const term  = this.search().trim().toLowerCase();
    const st    = this.status();
    const fromS = this.dateFrom();
    const toS   = this.dateTo();
    const unpaid = this.onlyUnpaid();

    const parseDate = (s?: string | null) => (s ? new Date(s) : null);

    let list = this.all().slice();

    if (term) {
      list = list.filter(it =>
        (it.invoiceNo ?? '').toLowerCase().includes(term) ||
        (it.notes ?? '').toLowerCase().includes(term)
      );
    }

    if (st !== 'all') list = list.filter(it => this.toStr(it.status) === st);
    if (unpaid)       list = list.filter(it => this.toStr(it.status) !== 'Paid');

    if (fromS) {
      const from = new Date(fromS + 'T00:00:00');
      list = list.filter(it => {
        const d = parseDate(it.updatedAt ?? it.createdAt);
        return d ? d >= from : false;
      });
    }
    if (toS) {
      const to = new Date(toS + 'T23:59:59');
      list = list.filter(it => {
        const d = parseDate(it.updatedAt ?? it.createdAt);
        return d ? d <= to : false;
      });
    }

    // sort بالزمن تنازلي
    list.sort((a, b) => {
      const da = new Date((a.updatedAt ?? a.createdAt) || 0).getTime();
      const db = new Date((b.updatedAt ?? b.createdAt) || 0).getTime();
      return db - da;
    });

    return list;
  });

  async ngOnInit() {
    await this.load();
  }

  async load() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const data = await firstValueFrom(this.api.getMine());
      this.all.set(data);
    } catch (e: any) {
      this.error.set(e?.message ?? 'تعذر تحميل الفواتير');
    } finally {
      this.loading.set(false);
    }
  }

  statusBadge(st: InvoiceStatus | number): string {
    const s = this.toStr(st);
    switch (s) {
      case 'Draft':     return 'badge bg-secondary';
      case 'Sent':      return 'badge bg-info text-dark';
      case 'Paid':      return 'badge bg-success';
      case 'Cancelled': return 'badge bg-danger';
      default:          return 'badge bg-light text-dark';
    }
  }

  fileUrl(path?: string | null): string {
    if (!path) return '#';
    if (/^https?:\/\//i.test(path)) return path;
    const base = environment.apiUrl; // عدّلها لو عندك environment
    return `${base}${path.replace(/^\/+/, '')}`;
  }
}

