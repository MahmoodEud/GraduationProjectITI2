import { PaymentMethod } from "./payment-method";

export interface InvoicePaymentDto {
  paymentMethod: PaymentMethod;
  paymentRef?: string | null;
  notes?: string | null;
}
