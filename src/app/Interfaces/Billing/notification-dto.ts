export type NotificationType = 'General' | 'Invoice' | 'Exam' | 'Meeting';

export interface NotificationDto {
  id: number;
  studentId: number;
  title: string;
  body: string;
  createdAt: string;     
  isRead: boolean;
  type: NotificationType;
  actionUrl?: string | null;
}