import {
  Component
 
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LottieComponent } from 'ngx-lottie';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollRevealDirective } from '../../directives/onScrollAnimation/scroll-reveal.directive';
import { ButtonsAnimationDirective } from '../../directives/ButtonsAnimation/buttons-animation.directive';
import { AccountService } from '../../Services/account.service';
import { AiChatbotComponent } from "../ai-chat/ai-chat.component";

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, ScrollRevealDirective, ButtonsAnimationDirective, AiChatbotComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent   {


constructor(private account:AccountService,private router:Router) {
      const user = this.account.currentUser();
      if (user)   {
      this.router.navigate(['/main']);
}

}
  animationOptions = {
    path: '/assets/Animation/svg.json',
    autoplay: true,
    loop: true
  };


}
