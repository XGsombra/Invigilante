import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {MessageService} from '../service/message.service';
import {SignupDialogComponent} from '../dialog/signup-dialog/signup-dialog.component';
import {EmailVerificationDialogComponent} from '../dialog/email-verification-dialog/email-verification-dialog.component';

@Component({
  selector: 'app-joinus',
  templateUrl: './joinus.component.html',
  styleUrls: ['./joinus.component.css']
})
export class JoinusComponent implements OnInit {

  constructor(
    private messageService: MessageService,
    private router: Router
    ) { }

  ngOnInit(): void {
  }

  renderSignupForm(role: number): void {
    let dialogRef = this.messageService.renderMessage(SignupDialogComponent, {role: role});
    dialogRef.componentInstance.signedUp.subscribe((signupSuccessful: any) => {
      if (signupSuccessful) {
        dialogRef.close();
        this.renderEmailVerificationForm();
        // this.router.navigate(['/dashboard']);
      }
    });
  }

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

  showCreditPage(): void {
    this.router.navigate(['/credit']);
  }

}
