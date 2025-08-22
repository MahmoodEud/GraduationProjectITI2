export interface InvoiceCreateDto {
  studentId: number;
  courseId?: number | null;

  amount: number;
  currency?: string;            
    notes?: string;
  accessStart?: string | null;  
  accessEnd?: string | null;
}
