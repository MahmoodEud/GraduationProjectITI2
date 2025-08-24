import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../register/environment';
import { NotificationDto, NotificationType } from '../../Interfaces/Billing/notification-dto';
import { BroadcastNotificationRequest } from '../../Interfaces/Billing/broadcast-notification-request';
import { ExamNowRequest } from '../../Interfaces/Billing/exam-now-request';
import { MeetingNotificationRequest } from '../../Interfaces/Billing/meeting-notification-request';
function joinUrl(...parts: (string|number)[]) {
  return parts.map(p => String(p).replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/');
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsServiceService {

private http = inject(HttpClient);
  private base = joinUrl(environment.apiUrl, 'Notifications');

  create(studentId: number, title: string, body: string, type: NotificationType = 'General', actionUrl?: string) {
    return this.http.post<NotificationDto>(this.base, { studentId, title, body, type, actionUrl });
  }

  mine(take?: number) {
    let params = new HttpParams();
    if (take != null) params = params.set('take', take);
    return this.http.get<NotificationDto[]>(joinUrl(this.base, 'mine'), { params });
  }

  unreadCount() {
    return this.http.get<number>(joinUrl(this.base, 'mine', 'unread-count'));
  }

  markRead(notificationId: number) {
    return this.http.post(joinUrl(this.base, notificationId, 'read'), {});
  }

  markAllRead() {
    return this.http.post<number>(joinUrl(this.base, 'read-all'), {});
  }

  getByStudent(studentId: number, take?: number) {
    let params = new HttpParams();
    if (take != null) params = params.set('take', take);
    return this.http.get<NotificationDto[]>(joinUrl(this.base, 'student', studentId), { params });
  }

  broadcast(req: BroadcastNotificationRequest) {
    return this.http.post<{ count: number }>(joinUrl(this.base, 'broadcast'), req);
  }

  examNow(req: ExamNowRequest) {
    return this.http.post<{ count: number }>(joinUrl(this.base, 'exam-now'), req);
  }

  meeting(req: MeetingNotificationRequest) {
    return this.http.post<{ count: number }>(joinUrl(this.base, 'meeting'), req);
  }
}
