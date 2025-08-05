import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { LottieComponent } from 'ngx-lottie';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollRevealDirective } from '../../directives/onScrollAnimation/scroll-reveal.directive';
import { ButtonsAnimationDirective } from '../../directives/ButtonsAnimation/buttons-animation.directive';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, LottieComponent,ScrollRevealDirective,ButtonsAnimationDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('progressBar') progressBar!: ElementRef;
  @ViewChild('myBtn') myBtn!: ElementRef;

  animationOptions = {
    path: '/assets/Animation/svg.json',
    autoplay: true,
    loop: true
  };

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
