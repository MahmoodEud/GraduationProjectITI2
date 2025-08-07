import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { LottieComponent } from 'ngx-lottie';
import { UsersComponent } from "./Components/dashboardComp/users/users.component";
import { NavbarComponent } from "./Components/navbar/navbar.component";
import { MainComponent } from "./Components/main/main.component";
import { AccountService } from './Services/account.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UsersComponent, NavbarComponent, MainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ElbasitNaderMadkour';
    isDarkMode = false;

    constructor(private accountService: AccountService) {
    const dark = localStorage.getItem('darkMode');
    if (dark === 'true') {
      this.enableDarkMode();
      this.isDarkMode = true;
    }
    this.accountService.loadCurrentUser(); 
  }
   toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'true');
  }

  disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'false');
  }
}
