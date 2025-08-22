import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Inject, inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ButtonsAnimationDirective } from '../../directives/ButtonsAnimation/buttons-animation.directive';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { AccountService } from '../../Services/account.service';
import { environment } from '../../Services/register/environment';
import { filter, Subject, takeUntil } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, RouterLinkActive,ButtonsAnimationDirective,RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('progressBar') progressBar!: ElementRef<HTMLElement>;
  @ViewChild('myBtn') myBtn!: ElementRef<HTMLElement>;

  @Input() isDarkMode: boolean = false;
  @Output() darkModeToggled = new EventEmitter<void>();

  public acc = inject(AccountService);

  currentRoute = '';
  profileImageUrl = '';

  private destroy$ = new Subject<void>();
  private ctx?: gsap.Context;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
    private host: ElementRef<HTMLElement>
  ) {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((e) => {
        this.currentRoute = e.urlAfterRedirects ?? e.url;

        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          requestAnimationFrame(() => ScrollTrigger.refresh());
          setTimeout(() => ScrollTrigger.refresh(), 0);
        }
      });
  }

  ngOnInit(): void {
    const storedImage = localStorage.getItem('profileImage');
    this.profileImageUrl = storedImage
      ? `${environment.imageBaseUrl}${storedImage}`
      : 'assets/Profil4.png';
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ctx = gsap.context(() => {
      const bar = this.progressBar?.nativeElement;
      if (!bar) return;

      gsap.set(bar, { width: '0%', opacity: 0, transformOrigin: 'left center' });

      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 0,
        end: () => document.documentElement.scrollHeight - window.innerHeight,
        onUpdate: (self) => {
          gsap.to(bar, {
            width: `${Math.round(self.progress * 100)}%`,
            ease: 'none',
            overwrite: 'auto',
            duration: 0
          });

          bar.style.opacity = self.progress > 0.01 ? '1' : '0';
        }
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, this.host.nativeElement);
  }

  toggleMode() {
    this.darkModeToggled.emit();
  }

  @HostListener('window:scroll')
  onScroll(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.ctx?.revert();
  }
}
