import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {MessageService} from '../service/message.service';
import {SigninDialogComponent} from '../dialog/signin-dialog/signin-dialog.component';
import {AccountDialogComponent} from '../dialog/account-dialog/account-dialog.component';
import {ApiService} from '../service/api.service';
import {CookieService} from 'ngx-cookie-service';
import {RoleEnum} from '../models/RoleEnum';
import {UserInfoService} from "../service/user-info.service";
import {EmailVerificationDialogComponent} from '../dialog/email-verification-dialog/email-verification-dialog.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  constructor(
    public cookieService: CookieService,
    public userService: UserInfoService,
    private apiService: ApiService,
    private messageService: MessageService,
    public router: Router
  ) {
  }

  ngOnInit(): void {
  }

  // display pop-up sign-in form
  renderSignin(): void {
    if (this.cookieService.get('email') !== '') {
      this.checkIfVerified();
    } else {
      let dialogRef = this.messageService.renderMessage(SigninDialogComponent);
      dialogRef.componentInstance.signedIn.subscribe((isSignInSuccessful: any) => {
        if (!isSignInSuccessful) return;
        
        dialogRef.close();
        
        this.checkIfVerified();
        // this.router.navigate(['/dashboard']);
      });
    }
  }

  // check whether the use has verified his email
  checkIfVerified(): void {
    this.apiService.isEmailVerified().subscribe(result => {
      if (result.verified === "false") { // TODO: ask GXD to change the response type to int
        this.renderEmailVerificationForm();
      } else {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  // display pop-up form to send a verification email if the user has not been verified
  renderEmailVerificationForm(): void {
    let verificationDialogRef = this.messageService.renderMessage(EmailVerificationDialogComponent);
    verificationDialogRef.componentInstance.emailSent.subscribe((isSentSuccessful: any) => {
      if (isSentSuccessful) {
        console.log("email sent successfully");
        verificationDialogRef.close();
      } else {
        console.log("email sent failed");
      }
    });
  }

  // display poo-up user information
  renderUserInfo(): void {
    this.messageService.renderMessage(AccountDialogComponent, {
      name: this.userService.getName(),
      email: this.userService.getEmail(),
      identity: this.userService.getRoleName()
    });
  }

  // log out functionality and its two callback handlers
  signOut(): void {
    this.apiService.signOut().subscribe(result => {
      if (result) this.router.navigate(['/welcome']);
    });
  }

  // go to the home page.
  // The home page is dashboard if user has logged in, and is welcome page otherwise.
  home(): void {
    let page = (this.cookieService.get('email') !== '') ? '/dashboard' : 'welcome';
    this.router.navigate([page]);
  }

}
