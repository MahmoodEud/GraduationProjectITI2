import { Component, effect, inject, NgZone, OnDestroy, signal } from '@angular/core';
import { NotificationsServiceService } from '../../Services/Billing/notifications-service.service';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../Services/register/environment';
import * as signalR from '@microsoft/signalr';
import { AccountService } from '../../Services/account.service';
import { filter } from 'rxjs';

function hubUrlFromApi(apiUrl: string) {
  const base = apiUrl.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
  return `${base}/hubs/notifications`;
}

@Component({
  selector: 'app-notification-bell-i',
  standalone: true,
  imports: [],
  templateUrl: './notification-bell-i.component.html',
  styleUrl: './notification-bell-i.component.css'
})
export class NotificationBellIComponent implements OnDestroy{
   private api = inject(NotificationsServiceService);
  private acc = inject(AccountService);
  private router = inject(Router);
  private zone = inject(NgZone); 

  count = signal(0);
  private conn?: signalR.HubConnection;

  constructor() {
    effect(() => {
      const user = this.acc.currentUser(); // Signal
      this.stopHub();

      if (user?.token) {
        this.api.unreadCount().subscribe(n => this.count.set(n ?? 0));
        this.startHub(user.token);
      } else {
        this.count.set(0);
      }
    });

    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      if (e.urlAfterRedirects.startsWith('/me/notifications')) {
        this.count.set(0);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopHub();
  }

  private startHub(token: string) {
    const url = hubUrlFromApi(environment.apiUrl);
    this.conn = new signalR.HubConnectionBuilder()
      .withUrl(url, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

      this.conn.on('new-notification', () => {
      this.zone.run(() => {
        this.count.update(v => v + 1);
      });
    });

    this.conn.start().catch((err: unknown) => {
      console.error('SignalR connect error', err);
    });
  }

  private stopHub() {
    if (this.conn) {
      this.conn.stop().catch(() => {});
      this.conn = undefined;
    }
  }

  goToNotifications() {
    this.router.navigateByUrl('/me/notifications');
  }
}
