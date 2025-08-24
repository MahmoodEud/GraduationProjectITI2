import { Component } from '@angular/core';
import { StudentsComponent } from "../DashboardFiles/students/students.component";
import { CoursesComponent } from "../DashboardFiles/courses/courses.component";
import { AdminCourseManagementComponent } from '../DashboardFiles/admin-course-management/admin-course-management.component';
import { LessonsComponent } from "../DashboardFiles/lessons/lessons.component";
import { UserSettingComponent } from "../DashboardFiles/user-setting/user-setting.component";
import { AssessmentsListComponent } from "../DashboardFiles/assessments-list/assessments-list.component";
import { ReportsDashboardComponent } from "../DashboardFiles/Reportes/reports-dashboard/reports-dashboard.component";
import { NotificationManagementComponent } from "../DashboardFiles/notification-management/notification-management.component";
import { StdCrsComponent } from '../DashboardFiles/stdcrs/stdcrs.component'; 


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [StudentsComponent, CoursesComponent, AdminCourseManagementComponent, LessonsComponent, UserSettingComponent, AssessmentsListComponent, ReportsDashboardComponent, NotificationManagementComponent, StdCrsComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

}
