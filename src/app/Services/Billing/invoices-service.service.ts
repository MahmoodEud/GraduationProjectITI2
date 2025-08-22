import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../register/environment';
import { InvoiceDto } from '../../Interfaces/Billing/invoice-dto';
import { InvoiceCreateDto } from '../../Interfaces/Billing/invoice-create-dto';
import { InvoicePaymentDto } from '../../Interfaces/Billing/invoice-payment-dto';
import { InvoiceSearchFilter } from '../../Interfaces/Billing/invoice-search-filter';
import { IPagedResult } from '../../Interfaces/ipaged-result';
import { InvoiceUpdateDraftDto } from '../../Interfaces/Billing/invoice-update-draft-dto';

function joinUrl(...parts: (string|number)[]) {
  return parts.map(p => String(p).replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/');
}
@Injectable({
  providedIn: 'root'
})

export class InvoicesServiceService {

private http = inject(HttpClient);
  private base = joinUrl(environment.apiUrl, 'Invoices');

  
  search(filter: InvoiceSearchFilter) {
    let params = new HttpParams();
    if (filter.studentId != null) params = params.set('studentId', filter.studentId);
    if (filter.courseId != null)  params = params.set('courseId',  filter.courseId);
    if (filter.status != null)    params = params.set('status',     filter.status);
    if (filter.dateFrom)          params = params.set('dateFrom',   filter.dateFrom);
    if (filter.dateTo)            params = params.set('dateTo',     filter.dateTo);
    params = params
      .set('page', (filter.page ?? 1))
      .set('pageSize', (filter.pageSize ?? 20));
    return this.http.get<IPagedResult<InvoiceDto>>(this.base, { params });
  }


  getById(id: number) {
    return this.http.get<InvoiceDto>(joinUrl(this.base, id));
  }

  // Admin/Assistant
  getByStudent(studentId: number) {
    return this.http.get<InvoiceDto[]>(joinUrl(this.base, 'by-student', studentId));
  }

  // Student
  getMine() {
    return this.http.get<InvoiceDto[]>(joinUrl(this.base, 'mine'));
  }

  // Student
  mineById(id: number) {
    return this.http.get<InvoiceDto>(joinUrl(this.base, 'mine', id));
  }

  // Admin/Assistant: Create Draft
  createDraft(dto: InvoiceCreateDto) {
    return this.http.post<InvoiceDto>(this.base, dto);
  }

  // Admin/Assistant: Send
  send(id: number) {
    return this.http.post<InvoiceDto>(joinUrl(this.base, id, 'send'), {});
  }

  // Admin/Assistant: Mark Paid
  markPaid(id: number, body: InvoicePaymentDto) {
    return this.http.post<InvoiceDto>(joinUrl(this.base, id, 'pay'), body);
  }

  // Admin/Assistant: Cancel
  cancel(id: number, reason?: string) {
    return this.http.post<InvoiceDto>(joinUrl(this.base, id, 'cancel'), { reason: reason ?? null });
  }

  // Admin/Assistant: Upload Attachment
  uploadAttachment(id: number, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<InvoiceDto>(joinUrl(this.base, id, 'attachment'), form);
  }

// Admin/Assistant: Update Draft
updateDraft(id: number, dto: InvoiceUpdateDraftDto) {
  return this.http.put<InvoiceDto>(joinUrl(this.base, id), dto);
}

// Admin/Assistant: Delete Draft (مسودات فقط)
deleteDraft(id: number) {
  return this.http.delete<void>(joinUrl(this.base, id));
}

}
