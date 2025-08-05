import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { gsap } from 'gsap';
@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements AfterViewInit{

  constructor(private el: ElementRef) {}
 @Input('appScrollReveal') animation: string = 'fadeUp';


  ngAfterViewInit(): void {
    const el = this.el.nativeElement;

    let animationConfig: gsap.TweenVars = {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      opacity: 0,
      duration: 1.2,
      ease: 'power2.out'
    };

    switch (this.animation) {
      case 'fadeUp':
        animationConfig.y = 40;
        break;
      case 'fadeDown':
        animationConfig.y = -40;
        break;
      case 'fadeLeft':
        animationConfig.x = -40;
        break;
      case 'fadeRight':
        animationConfig.x = 40;
        break;
      case 'zoomIn':
        animationConfig.scale = 0.7;
        break;
      case 'zoomOut':
        gsap.set(el, { scale: 1.3 });
        animationConfig.scale = 1;
        break;
      case 'rotate':
        animationConfig.rotation = 45;
        break;
      case 'bounce':
        animationConfig.y = -20;
        animationConfig.ease = 'bounce.out';
        break;
      case 'flipX':
        gsap.set(el, { rotationX: -90 });
        animationConfig.rotationX = 0;
        break;
      case 'flipY':
        gsap.set(el, { rotationY: -90 });
        animationConfig.rotationY = 0;
        break;
      case 'skewSlide':
        gsap.set(el, { x: 80, skewX: 20 });
        animationConfig.x = 0;
        animationConfig.skewX = 0;
        break;
      default:
        animationConfig.y = 40;
        break;
    }

    gsap.from(el, animationConfig);
  }
}
