import { InvoiceStatus } from "./invoice-status";

export interface InvoiceSearchFilter {
  studentId?: number;
  courseId?: number;
  status?: InvoiceStatus;
  dateFrom?: string;     
  dateTo?: string;       
  page?: number;
  pageSize?: number;
}
