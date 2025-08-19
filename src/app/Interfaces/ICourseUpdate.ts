export interface CreateCourse {
  title: string;
  description: string;
  price: number;
  picturalUrl?: string;
  year: string;
  category?: string;
  CourseId: number;
}
