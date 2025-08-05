import { Component } from '@angular/core';
import { FirstComponentComponent } from "../first-component/first-component.component";

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FirstComponentComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

}
