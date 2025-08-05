import { Component } from '@angular/core';
import { HomeSideComponent } from '../home-side/home-side.component';
import { RouterModule } from '@angular/router';
import { LogoutService } from '../../Services/Logout/logout.service';
import { environment } from '../../Services/register/environment';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HomeSideComponent, RouterModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {

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
}

