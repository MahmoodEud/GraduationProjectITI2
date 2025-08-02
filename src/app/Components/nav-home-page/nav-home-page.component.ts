import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-nav-home-page',
  standalone: true,
  imports: [],
  templateUrl: './nav-home-page.component.html',
  styleUrl: './nav-home-page.component.css'
})
export class NavHomePageComponent implements AfterViewInit{
    @ViewChild('progressBar') progressBar!: ElementRef;

  ngAfterViewInit(): void {
    const bar = this.progressBar.nativeElement;

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
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const bar = this.progressBar.nativeElement;
    bar.style.opacity = window.scrollY > 10 ? '1' : '0';
  }
}


