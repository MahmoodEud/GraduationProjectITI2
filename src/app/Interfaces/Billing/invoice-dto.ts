import { InvoiceStatus } from "./invoice-status";
import { PaymentMethod } from "./payment-method";

export interface InvoiceDto {
    id: number;
  invoiceNo?: string | null;

  studentId: number;
  courseId?: number | null;

  amount: number;
  currency: string;

  status: InvoiceStatus;

  paymentMethod?: PaymentMethod | null;
  paymentRef?: string | null;

  notes?: string | null;
  attachmentPath?: string | null;

  accessStart?: string | null;  
  accessEnd?: string | null;    

  createdAt: string;            
  createdByUserId?: string | null;

  updatedAt?: string | null;    
  updatedByUserId?: string | null;
}
