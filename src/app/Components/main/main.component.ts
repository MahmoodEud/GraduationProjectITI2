import { Component, inject } from '@angular/core';
import { HomeSideComponent } from '../home-side/home-side.component';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../Services/register/environment';
import { AccountService } from '../../Services/account.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HomeSideComponent, RouterModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  /*
constructor(public Logoutservices:LogoutService){}
      profileImageUrl: string = '';
    ngOnInit(): void {
    const storedImage = localStorage.getItem('profileImage');
    if (storedImage) {
      debugger;
      this.profileImageUrl = `${environment.imageBaseUrl}${storedImage}`;
    } else {
      debugger;
      this.profileImageUrl = 'assets/Profil4.png';
    }
  }
      logout(){
      this.Logoutservices.logout();
    }
    */

  private router = inject(Router);
  accountService = inject(AccountService);

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}

