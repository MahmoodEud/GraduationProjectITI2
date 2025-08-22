import { Component, computed, inject, signal } from '@angular/core';
import { NotificationDto } from '../../../../Interfaces/Billing/notification-dto';
import { NotificationsServiceService } from '../../../../Services/Billing/notifications-service.service';
import { CommonModule } from '@angular/common';
import { InvoiceDto } from '../../../../Interfaces/Billing/invoice-dto';
import { InvoicesServiceService } from '../../../../Services/Billing/invoices-service.service';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-notifications',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './my-notifications.component.html',
  styleUrl: './my-notifications.component.css'
})
export class MyNotificationsComponent {
private api = inject(NotificationsServiceService);

  loading = signal(false);
  error   = signal<string | null>(null);

  // البيانات
  items = signal<NotificationDto[]>([]);

  // فلاتر محلية
  onlyUnread = signal(false);
  search = signal<string>('');

  // عدّاد غير المقروء
  unreadCount = computed(() => this.items().filter(x => !x.isRead).length);

  // صفوف العرض بعد الفلترة
  rows = computed(() => {
    const list = this.items();
    const unread = this.onlyUnread();
    const q = this.search().trim().toLowerCase();

    return list.filter(n => {
      if (unread && n.isRead) return false;
      if (q) {
        const hay = (n.title + ' ' + n.body).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  });

  ngOnInit() { this.load(); }

  async load() {
    this.loading.set(true);
    this.error.set(null);
    try {
      // لازم يكون عندك endpoint: GET /api/notifications/mine
      const data = await firstValueFrom(this.api.mine());
      this.items.set(data || []);
    } catch (e: any) {
      this.error.set(e?.error || e?.message || 'فشل تحميل الإشعارات');
    } finally {
      this.loading.set(false);
    }
  }

  async markRead(n: NotificationDto) {
    if (n.isRead) return;
    try {
      await firstValueFrom(this.api.markRead(n.id));
      this.items.update(arr => arr.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    } catch { /* ignore */ }
  }

  async markAllRead() {
    try {
      await firstValueFrom(this.api.markAllRead());
      this.items.update(arr => arr.map(x => ({ ...x, isRead: true })));
    } catch { /* ignore */ }
  }

  badgeClass(n: NotificationDto): string {
    return n.isRead ? 'badge bg-light text-muted' : 'badge bg-primary';
  }
}
