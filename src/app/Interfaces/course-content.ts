import { ILesson } from "./ILesson";

export interface CourseContent {
  courseId: number;
  title: string;
  lessons: ILesson[];
}

