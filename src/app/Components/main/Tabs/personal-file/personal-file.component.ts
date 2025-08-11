import { Component, computed } from '@angular/core';
import { AccountService } from '../../../../Services/account.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-personal-file',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './personal-file.component.html',
  styleUrl: './personal-file.component.css'
})
export class PersonalFileComponent {
currentUserId = '';
currentUser = computed(() => this.acc.currentUser());
  constructor(private acc: AccountService) {}
ngOnInit() {
  this.currentUserId = this.acc.getCurrentUserId() || '';
}

}
