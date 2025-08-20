export interface ILessonProgressUpsert {
  watchedSeconds: number;
  durationSeconds?: number;
  isCompleted?: boolean;
}
