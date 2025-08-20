import { ILessonProgress } from './ilesson-progress';

export interface ICourseProgress {
  courseId: number;
  totalLessons: number;
  completedLessons: number;
  percent: number;
  lessons: ILessonProgress[];
}
