import { Component } from '@angular/core';
import { StudentsComponent } from "../DashboardFiles/students/students.component";
import { CoursesComponent } from "../DashboardFiles/courses/courses.component";
import { AdminCourseManagementComponent } from '../DashboardFiles/admin-course-management/admin-course-management.component';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [StudentsComponent, CoursesComponent, AdminCourseManagementComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

}
