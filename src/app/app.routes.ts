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
import { ChangePasswordFileComponent } from './Components/main/Tabs/personal-file/change-password-file/change-password-file.component';
import { LessonsComponent } from './Components/DashboardAdmin/DashboardFiles/lessons/lessons.component';


export const routes: Routes = [
  // Public Page ..
  { path: '', component: HomeComponent },
  { path: 'Login', component: LoginComponent },
  { path: 'Register', component: RegisterComponent },
  { path: 'access-denied', component: AccessDeniedComponent },

  // Student Routing ...
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      { path: 'main', component: MainComponent },
      { path: 'account/:id/edit', loadComponent: () => import('./Components/main/Tabs/personal-file/edit-personal-file/edit-personal-file.component').then(m => m.EditPersonalFileComponent) },
      { path: 'account/student-change-password', component: ChangePasswordFileComponent },
        { 
        path: 'course-progress/:courseId',
        loadComponent: () => import('./Components/main/Tabs/course-progress/course-progress.component')
          .then(m => m.CourseProgressComponent) 
      },
// routes.ts
      // { path: 'student-report/:attemptId', loadComponent: () => import('./Components/main/Tabs/main-student-page/main-student-page.component').then(m => m.MainStudentPageComponent) },
    { path: 'student-report/:attemptId', loadComponent: () =>
        import('./Components/main/Tabs/main-student-page/student-report-details/student-report-details.component')
          .then(m => m.StudentReportDetailsComponent)
    },

{ path: 'student/reports', loadComponent: () =>
    import('./Components/main/Tabs/main-student-page/main-student-page.component')
    .then(m => m.MainStudentPageComponent) },

      { path: 'courses', loadComponent: () => import('./Components/main/Tabs/get-all-courses/get-all-courses.component').then(m => m.GetAllCoursesComponent) },
      { path: 'courses/:id', loadComponent: () => import('./Components/main/Tabs/get-all-courses/course-details/course-details.component').then(m => m.CourseDetailsComponent) },
      { path: 'courses/:id/content', loadComponent: () => import('./Components/main/Tabs/get-all-courses/course-details/course-content/course-content.component').then(m => m.CourseContentComponent) },

      { path: 'quiz/:lessonId', loadComponent:() =>import('./Components/main/Tabs/get-all-courses/course-details/course-content/quiz/quiz.component').then(x=>x.QuizComponent) 
       },
       { path: 'quiz/attempt/:attemptId', loadComponent: () => import('./Components/main/Tabs/get-all-courses/course-details/course-content/quiz/quiz-attempts/quiz-attempts.component').then(m => m.QuizAttemptsComponent) },


      { path: 'quiz/summary/:attemptId', loadComponent: () => import('./Components/main/Tabs/get-all-courses/course-details/course-content/quiz/quiz-summary/quiz-summary.component').then(m => m.QuizSummaryComponent) },
      { path: 'billing/my-invoices', loadComponent: () => import('./Components/main/Tabs/my-invoices/my-invoices.component').then(m => m.MyInvoicesComponent) },
{ path: 'me/notifications', loadComponent: () => import('./Components/main/Tabs/my-notifications/my-notifications.component').then(m => m.MyNotificationsComponent) },

    ]
      },
       

//Admin Routes
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
      { 
        path: 'users/:id/edit', 
        loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/students/edit/edit.component')
          .then(m => m.EditComponent) 
      },
    { path: 'admin/billing/enroll-invoice', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/admin-course-management/admin-enroll-invoice/admin-enroll-invoice.component').then(m => m.AdminEnrollInvoiceComponent) },
    { path: 'admin/billing/invoices', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/admin-course-management/admin-invoices-list/admin-invoices-list.component').then(m => m.AdminInvoicesListComponent) },


      { path: 'lessons', component: LessonsComponent },
      { path: 'create-lesson', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/lessons/create-lesson/create-lesson.component').then(m => m.CreateLessonComponent) },
      { path: 'edit-lesson/:id', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/lessons/edit-lesson/edit-lesson.component').then(m => m.EditLessonComponent) },

      { 
        path: 'edit-course/:id',
        loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/courses/edit-course/edit-course.component')
          .then(m => m.EditCourseComponent) 
      },

      { path: 'createCourse', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/courses/create-course/create-course.component').then(m => m.CreateCourseComponent) },
      { path: 'assessments', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/assessments-list/assessments-list.component').then(m => m.AssessmentsListComponent) },

      //Create Assesment
      { path: 'CreateAssessment', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/assessments-list/add-assessment/add-assessment.component').then(m => m.AddAssessmentComponent) },
      {   path: 'assessments/:id/edit',
         loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/assessments-list/edit-assessment/edit-assessment.component').then(m => m.EditAssessmentComponent) },


        { path: 'reports', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/Reportes/reports-dashboard/reports-dashboard.component').then(m => m.ReportsDashboardComponent) },
        { path: 'reports/assessment/:id/difficulty', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/Reportes/assessment-difficulty/assessment-difficulty.component').then(m => m.AssessmentDifficultyComponent) },
        { path: 'reports/students', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/Reportes/students-performance/students-performance.component').then(m => m.StudentsPerformanceComponent) },
        { path: 'reports/activity', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/Reportes/attempts-activity/attempts-activity.component').then(m => m.AttemptsActivityComponent) },

  
      { path: 'invoices/:id/edit', loadComponent: () => import('./Components/DashboardAdmin/DashboardFiles/admin-course-management/admin-invoices-list/admin-invoice-edit/admin-invoice-edit.component').then(m => m.AdminInvoiceEditComponent) },

    ]
  },

  // ! صفحة غير موجودة
  { path: '**', component: NotFoundComponent, pathMatch: 'full' },
];

