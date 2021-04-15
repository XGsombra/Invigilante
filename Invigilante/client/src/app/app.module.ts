import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { PortalModule } from '@angular/cdk/portal';

import { CookieService } from 'ngx-cookie-service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninDialogComponent } from './dialog/signin-dialog/signin-dialog.component';
import { NavigationComponent } from './navigation/navigation.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { AppMaterialModule } from './app-material.module';
import { JoinusComponent } from './joinus/joinus.component';
import { SignupDialogComponent } from './dialog/signup-dialog/signup-dialog.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardEntryComponent } from './dashboard-entry/dashboard-entry.component';
import { ViewComponent } from './view/view.component';
import { ExamroomComponent } from './examroom/examroom.component';
import { AccountDialogComponent } from './dialog/account-dialog/account-dialog.component';
import { ErrorDialogComponent } from './dialog/error-dialog/error-dialog.component';
import {MatChipsModule} from "@angular/material/chips";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import { IdUploadComponent } from './id-upload/id-upload.component';
import { NewexamDialogComponent } from './dialog/newexam-dialog/newexam-dialog.component';
import { EnterexamDialogComponent } from './dialog/enterexam-dialog/enterexam-dialog.component';
import { EmailVerificationDialogComponent } from './dialog/email-verification-dialog/email-verification-dialog.component';
import { AppCreditComponent } from './app-credit/app-credit.component';
import { IpCheckDialogComponent } from './dialog/ip-check-dialog/ip-check-dialog.component';
import { LeaveExamDialogComponent } from './dialog/leave-exam-dialog/leave-exam-dialog.component';
import { IdDialogComponent } from './dialog/id-dialog/id-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    AuthenticationComponent,
    SigninDialogComponent,
    JoinusComponent,
    SignupDialogComponent,
    DashboardComponent,
    DashboardEntryComponent,
    ViewComponent,
    ExamroomComponent,
    AccountDialogComponent,
    ErrorDialogComponent,
    IdUploadComponent,
    NewexamDialogComponent,
    EnterexamDialogComponent,
    EmailVerificationDialogComponent,
    AppCreditComponent,
    IpCheckDialogComponent,
    LeaveExamDialogComponent,
    IdDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    PortalModule,
    MatChipsModule,
    MatAutocompleteModule,
  ],
  providers: [
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
