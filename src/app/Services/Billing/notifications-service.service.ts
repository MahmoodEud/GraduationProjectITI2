import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../register/environment';
import { NotificationDto } from '../../Interfaces/Billing/notification-dto';
function joinUrl(...parts: (string|number)[]) {
  return parts.map(p => String(p).replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/');
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsServiceService {

private http = inject(HttpClient);
  private base = joinUrl(environment.apiUrl, 'Notifications');

  // Admin: إنشاء إشعار لطالب
  create(studentId: number, title: string, body: string) {
    return this.http.post<NotificationDto>(this.base, { studentId, title, body });
  }

  // Admin: جلب إشعارات طالب (اختياري take)
  getByStudent(studentId: number, take?: number) {
    let params = new HttpParams();
    if (take != null) params = params.set('take', take);
    return this.http.get<NotificationDto[]>(joinUrl(this.base, 'by-student', studentId), { params });
  }

  // Student: إشعاراتي
  mine() {
    return this.http.get<NotificationDto[]>(joinUrl(this.base, 'mine'));
  }

  // Student: عدد غير المقروء
  unreadCount() {
    return this.http.get<number>(joinUrl(this.base, 'mine', 'unread-count'));
  }

  // Student: تعليم كمقروء
  markRead(notificationId: number) {
    return this.http.post(joinUrl(this.base, 'mine', 'mark-read', notificationId), {});
  }

  // Student: تعليم الكل كمقروء
  markAllRead() {
    return this.http.post<number>(joinUrl(this.base, 'mine', 'mark-all-read'), {});
  }}
