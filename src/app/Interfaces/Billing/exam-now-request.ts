export interface ExamNowRequest {
  year: number;
  courseId: number;
  lessonId: number;     
  title?: string;
  body?: string;
}
