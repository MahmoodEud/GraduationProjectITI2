import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { environment } from '../../Services/register/environment';
import { AccountService } from '../../Services/account.service';
import { PrivacyComponent } from "./Tabs/privacy/privacy.component";
import { PersonalFileComponent } from "./Tabs/personal-file/personal-file.component";
import { CoursesComponent } from "../DashboardAdmin/DashboardFiles/courses/courses.component";
import { GetAllCoursesComponent } from "./Tabs/get-all-courses/get-all-courses.component";
import { TechnecalSupportComponent } from "./Tabs/technecal-support/technecal-support.component";
import { FreeCoursesComponent } from "./Tabs/free-courses/free-courses.component";
import { MyCoursesComponent } from "./Tabs/my-courses/my-courses.component";
import { MainStudentPageComponent } from "./Tabs/main-student-page/main-student-page.component";
import { MyInvoicesComponent } from "./Tabs/my-invoices/my-invoices.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterModule, PrivacyComponent, PersonalFileComponent, GetAllCoursesComponent, TechnecalSupportComponent, FreeCoursesComponent, MyCoursesComponent,
    MainStudentPageComponent,
    MyInvoicesComponent
],
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

