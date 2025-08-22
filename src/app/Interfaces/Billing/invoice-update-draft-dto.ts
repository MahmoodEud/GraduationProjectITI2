export interface InvoiceUpdateDraftDto {
  studentId?: number | null;     
  courseId?: number | null;      
  amount?: number | null;        
  paymentRef?: string | null;    
  notes?: string | null;        
  accessStart?: string | null;   
  accessEnd?: string | null;     
}
export function toIsoOrNull(d?: Date | string | null): string | null {
  if (!d) return null;
  return (d instanceof Date) ? d.toISOString() : new Date(d).toISOString();
}