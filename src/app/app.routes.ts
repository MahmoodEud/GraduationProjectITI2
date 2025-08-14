import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { MainComponent } from './Components/main/main.component';
import { authGuard } from './guards/auth.guard';
import { NotFoundComponent } from './Components/not-found/not-found.component';
import { UsersComponent } from './Components/DashboardAdmin/users/users.component';
import { adminRoleGuard } from './guards/admin.guard';
import { OverviewComponent } from './Components/DashboardAdmin/overview/overview.component';
import { AccessDeniedComponent } from './Components/DashboardAdmin/access-denied/access-denied.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'Login', component: LoginComponent },
  { path: 'Register', component: RegisterComponent },
  { path: 'access-denied', component: AccessDeniedComponent },
  {
   
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'main', component: MainComponent },
      {path: 'account/:id/edit',canActivate: [authGuard],loadComponent: () => import('./Components/main/Tabs/personal-file/edit-personal-file/edit-personal-file.component') .then(m => m.EditPersonalFileComponent)
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./Components/main/Tabs/get-all-courses/get-all-courses.component').then((m) => m.GetAllCoursesComponent),
      },
      {
        path: 'courses/:id',
        loadComponent: () =>
          import('./Components/main/Tabs/get-all-courses/course-details/course-details.component')
          .then(m => m.CourseDetailsComponent)
      },
       {
        path: 'courses/:id/content',
        loadComponent: () =>
          import('./Components/main/Tabs/get-all-courses/course-details/course-content/course-content.component')
          .then(m => m.CourseContentComponent)
      },
  
    ]
    
  },
   {
    path: 'admin',
    runGuardsAndResolvers: 'always',
    canActivate: [adminRoleGuard],
    canActivateChild: [adminRoleGuard], 
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users' },
      { path: 'overview', component: OverviewComponent },
      { path: 'users', component: UsersComponent },
      { path: 'student/:id', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/students/student-details/student-details.component').then(m => m.StudentDetailsComponent) },
      // {
      //   path: 'users/:id/edit',
      //   loadComponent: () =>
      //   import('./Components/DashboardAdmin/DashboardFiles/courses/create-course/create-course.component')
      //   .then(m => m.CreateCourseComponent)
      // },
      {
        path: 'createCourse/:id',
        loadComponent: () =>
        import('./Components/DashboardAdmin/DashboardFiles/courses/edit-course/edit-course.component')
        .then(m => m.EditCourseComponent)
      },
      {
        path: 'createCourse',
        canActivate: [adminRoleGuard],
        loadComponent: () =>
          import('./Components/DashboardAdmin/DashboardFiles/courses/create-course/create-course.component').then((m) => m.CreateCourseComponent),
      },
    ],

  },
 { path: 'access-denied', component: AccessDeniedComponent },
 {path: '**', component: NotFoundComponent, pathMatch:'full'},

];
