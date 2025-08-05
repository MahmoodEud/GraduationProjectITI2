import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { gsap } from 'gsap';

@Directive({
  selector: '[appButtonsAnimation]',
  standalone: true
})
export class ButtonsAnimationDirective {
 @Input() animation:
    | 'scale'
    | 'rotate'
    | 'bounce'
    | 'pulse'
    | 'flip'
    | 'shake'
    | 'glow'
    | 'skew'
    | 'zoom-in'
    | 'pop' = 'scale';

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    gsap.set(this.el.nativeElement, {
      scale: 1,
      rotation: 0,
      rotationY: 0,
      x: 0,
      y: 0,
      boxShadow: 'none',
      skewX: 0,
    });
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    const el = this.el.nativeElement;

    switch (this.animation) {
      case 'scale':
        gsap.to(el, { scale: 1.1, duration: 0.3, ease: 'power2.out' });
        break;

      case 'rotate':
        gsap.to(el, { rotation: 10, duration: 0.3, ease: 'power2.out' });
        break;

      case 'bounce':
        gsap.to(el, {
          y: -10,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'bounce.out'
        });
        break;

      case 'pulse':
        gsap.to(el, {
          scale: 1.15,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut'
        });
        break;

      case 'flip':
        gsap.to(el, {
          rotationY: 180,
          duration: 0.5,
          ease: 'power4.out'
        });
        break;

      case 'shake':
        gsap.to(el, {
          x: '+=5',
          duration: 0.1,
          repeat: 5,
          yoyo: true,
          ease: 'sine.inOut'
        });
        break;

      case 'glow':
        gsap.to(el, {
          boxShadow: '0 0 15px rgba(0,123,255,0.8)',
          duration: 0.3
        });
        break;

      case 'skew':
        gsap.to(el, {
          skewX: 10,
          duration: 0.3,
          ease: 'power1.out'
        });
        break;

      case 'zoom-in':
        gsap.fromTo(el, { scale: 0.8 }, {
          scale: 1,
          duration: 0.4,
          ease: 'expo.out'
        });
        break;

      case 'pop':
        gsap.to(el, {
          scale: 1.2,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: 'back.out(2)'
        });
        break;
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    const el = this.el.nativeElement;

    gsap.to(el, {
      scale: 1,
      rotation: 0,
      rotationY: 0,
      skewX: 0,
      x: 0,
      y: 0,
      boxShadow: '0 0 0 transparent',
      duration: 0.3,
      ease: 'power2.inOut'
    });
  }
}

