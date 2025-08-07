import { Component, computed } from '@angular/core';
import { AccountService } from '../../../../Services/account.service';

@Component({
  selector: 'app-personal-file',
  standalone: true,
  imports: [],
  templateUrl: './personal-file.component.html',
  styleUrl: './personal-file.component.css'
})
export class PersonalFileComponent {
currentUser = computed(() => this.acc.currentUser());
  constructor(private acc: AccountService) {}

}
