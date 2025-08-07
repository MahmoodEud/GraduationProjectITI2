import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../Services/register/environment';
import { AccountService } from '../../Services/account.service';
import { PrivacyComponent } from "./Tabs/privacy/privacy.component";
import { PDFsComponent } from "./Tabs/pdfs/pdfs.component";
import { PersonalFileComponent } from "./Tabs/personal-file/personal-file.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterModule, PrivacyComponent, PDFsComponent, PersonalFileComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  private router = inject(Router);
  accountService = inject(AccountService);

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}

