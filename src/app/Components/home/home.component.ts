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
export class HomeComponent   {


  animationOptions = {
    path: '/assets/Animation/svg.json',
    autoplay: true,
    loop: true
  };



}
