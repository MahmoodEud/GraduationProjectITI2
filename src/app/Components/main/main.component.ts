import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../Services/register/environment';
import { AccountService } from '../../Services/account.service';
import { PrivacyComponent } from "./Tabs/privacy/privacy.component";
import { PDFsComponent } from "./Tabs/pdfs/pdfs.component";
import { PersonalFileComponent } from "./Tabs/personal-file/personal-file.component";
import { CoursesComponent } from "../DashboardAdmin/DashboardFiles/courses/courses.component";
import { GetAllCoursesComponent } from "./Tabs/get-all-courses/get-all-courses.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterModule, PrivacyComponent, PDFsComponent, PersonalFileComponent, CoursesComponent, GetAllCoursesComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  private router = inject(Router);
  accountService = inject(AccountService);

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('Login');
  }
}

