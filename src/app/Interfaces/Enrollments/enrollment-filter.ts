export interface EnrollmentFilter {
  search?: string;
  studentYear?: string | number;
  courseId?: number;
  category?: string;
  accessType?: 'free' | 'paid' | 'granted';
  dateFrom?: string | Date;
  dateTo?: string | Date;
  page?: number;
  pageSize?: number;
  sortBy?: 'studentName' | 'courseTitle' | 'price' | 'enrolledAt';
  sortDir?: 'asc' | 'desc';
}