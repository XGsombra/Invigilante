import {Component, OnInit, Inject, EventEmitter, Output} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import {ApiService} from '../../service/api.service';

@Component({
  selector: 'app-email-verification-dialog',
  templateUrl: './email-verification-dialog.component.html',
  styleUrls: ['./email-verification-dialog.component.css']
})
export class EmailVerificationDialogComponent implements OnInit {

  @Output() emailSent: EventEmitter<any> = new EventEmitter();

  constructor(private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    }

  ngOnInit(): void {
  }

  sendEmail() {
    this.apiService.verifyEmail().subscribe(result => {
      if (!result) this.emailSent.emit(false);
      else this.emailSent.emit(true);
    });
    // this.apiService.signUp(
    //   this.email,
    //   this.username,
    //   this.password,
    //   this.selectedRole
    // ).subscribe(result => {
    //   if (!result) this.signedUp.emit(false);
    //   else this.signedUp.emit(true);
    // });
  }

}
