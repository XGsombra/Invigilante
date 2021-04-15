import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthService } from './service/auth.service';
import { JoinusComponent } from './joinus/joinus.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExamroomComponent } from './examroom/examroom.component';
import { AppCreditComponent } from './app-credit/app-credit.component';

const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: JoinusComponent },
  { path: 'credit', component: AppCreditComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthService] },
  { path: 'exam/:course', component: ExamroomComponent, canActivate: [AuthService] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
