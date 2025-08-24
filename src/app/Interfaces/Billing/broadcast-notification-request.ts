import { NotificationType } from "./notification-dto";

export interface BroadcastNotificationRequest {
  year?: number;            
  courseId?: number;         
  title: string;
  body?: string;
  type?: NotificationType;    
  actionUrl?: string;
}
