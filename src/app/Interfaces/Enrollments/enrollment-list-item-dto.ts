export type EnrollmentAccessType = 'Free' | 'Paid' | 'Granted';

export interface EnrollmentListItemDto {
  studentId: number;
  studentName: string;
  email?: string | null;
  studentYear: string;

  courseId: number;
  courseTitle: string;
  courseYear: string;
  category: string;
  price: number;

  isCourseFree: boolean;
  hasPaidInvoice: boolean;
  accessType: EnrollmentAccessType;

  enrolledAt?: string | null;
}