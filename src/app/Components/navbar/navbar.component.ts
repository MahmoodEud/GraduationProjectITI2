import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ButtonsAnimationDirective } from '../../directives/ButtonsAnimation/buttons-animation.directive';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { AccountService } from '../../Services/account.service';
import { environment } from '../../Services/register/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, ButtonsAnimationDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  @ViewChild('progressBar') progressBar!: ElementRef;
  @ViewChild('myBtn') myBtn!: ElementRef;

  currentRoute: string = '';

  public acc=inject(AccountService);
  constructor(private router: Router) {
  
     this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // console.log(event.urlAfterRedirects);
        
        this.currentRoute = event.url;
      }
    })
  }

    profileImageUrl: string = '';
    ngOnInit(): void {
    const storedImage = localStorage.getItem('profileImage');
    if (storedImage) {
      this.profileImageUrl = `${environment.imageBaseUrl}${storedImage}`;
    } else {
      this.profileImageUrl = 'assets/Profil4.png';
    }
  }
    








    ngAfterViewInit(): void {
    const bar = this.progressBar.nativeElement;
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(bar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    });
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);
  }
  @HostListener('window:scroll', [])
  onScroll(): void {
    const bar = this.progressBar.nativeElement;
    if (window.scrollY > 10) {
      bar.style.opacity = '1';
    } else {
      bar.style.opacity = '0';
    }
  }
  
  @Input() isDarkMode: boolean = false;
  @Output() darkModeToggled = new EventEmitter<void>();

  toggleMode() {
    this.darkModeToggled.emit();
  }
}
