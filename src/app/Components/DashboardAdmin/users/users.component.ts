import { Component } from '@angular/core';
import { LessonComponent } from "../DashboardFiles/lesson/lesson.component";
import { StudentsComponent } from "../DashboardFiles/students/students.component";
import { CreateCourseComponent } from "../DashboardFiles/courses/create-course/create-course.component";
import { DashboardStats } from '../../../Interfaces/dashboard-stats';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [LessonComponent, StudentsComponent, CreateCourseComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

}
