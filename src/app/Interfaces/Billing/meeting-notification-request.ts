export interface MeetingNotificationRequest {
  courseId: number;
  year?: number;        
  title: string;
  joinUrl: string;
  startAt?: string;     
  endAt?: string;       
}