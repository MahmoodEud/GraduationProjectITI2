import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { MainComponent } from './Components/main/main.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'Login', component: LoginComponent},
  {path: 'Register', component: RegisterComponent},
  {
    // The children in here must pass the authGuard check successfully
    // before a redirect is done
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      {path: 'main', component: MainComponent}
    ]
  },
    {path: '**', component: MainComponent, pathMatch: 'full'},

  // {path: '**', component: HomeComponent, pathMatch: 'full'},
];
