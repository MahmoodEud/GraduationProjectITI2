import { Component, computed, inject, signal } from '@angular/core';
import { NotificationDto } from '../../../../Interfaces/Billing/notification-dto';
import { NotificationsServiceService } from '../../../../Services/Billing/notifications-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-notifications',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './my-notifications.component.html',
  styleUrl: './my-notifications.component.css'
})
export class MyNotificationsComponent {
  private api = inject(NotificationsServiceService);
  private router = inject(Router);

  loading = signal(false);
  error   = signal<string | null>(null);

  items = signal<NotificationDto[]>([]);

  onlyUnread = signal(false);
  search = signal<string>('');
  typeFilter = signal<'all' | 'Exam' | 'Meeting' | 'Invoice' | 'General'>('all');

  unreadCount = computed(() => this.items().filter(x => !x.isRead).length);

  rows = computed(() => {
    const list = this.items();
    const unreadOnly = this.onlyUnread();
    const q = this.search().trim().toLowerCase();
    const tf = this.typeFilter();

    return list.filter(n => {
      if (unreadOnly && n.isRead) return false;
      if (tf !== 'all' && n.type !== tf) return false;
      if (q) {
        const hay = (n.title + ' ' + n.body).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.api.mine().subscribe({
      next: data => this.items.set(data ?? []),
      error: err => this.error.set(err?.error || err?.message || 'فشل تحميل الإشعارات'),
      complete: () => this.loading.set(false)
    });
  }

  markRead(n: NotificationDto, e?: Event) {
    e?.preventDefault();
    if (n.isRead) return;
    this.items.update(arr => arr.map(x => x.id === n.id ? { ...x, isRead: true } : x));
    this.api.markRead(n.id).subscribe({ error: _ => this.refresh() });
  }

  markAllRead() {
    this.items.update(arr => arr.map(x => ({ ...x, isRead: true })));
    this.api.markAllRead().subscribe({ error: _ => this.refresh() });
  }

  open(n: NotificationDto, e?: Event) {
    e?.preventDefault();
    this.markRead(n);
    if (!n.actionUrl) return;
    if (n.actionUrl.startsWith('/')) this.router.navigateByUrl(n.actionUrl);
    else window.open(n.actionUrl, '_blank');
  }

  refresh() {
    this.api.mine().subscribe(list => this.items.set(list ?? []));
  }

  badgeClass(n: NotificationDto): string {
    if (n.type === 'Exam') return 'badge bg-warning text-dark';
    if (n.type === 'Meeting') return 'badge bg-info text-dark';
    if (n.type === 'Invoice') return 'badge bg-success';
    return 'badge bg-secondary';
  }
}
