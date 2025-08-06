import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ButtonsAnimationDirective } from '../../directives/ButtonsAnimation/buttons-animation.directive';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, ButtonsAnimationDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @ViewChild('progressBar') progressBar!: ElementRef;
  @ViewChild('myBtn') myBtn!: ElementRef;

  currentRoute: string = '';

  constructor(private router: Router) {
  
     this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log(event.urlAfterRedirects);
        
        this.currentRoute = event.url;
      }
    })
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

}
