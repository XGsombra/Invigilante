import {Component, OnInit, Inject, EventEmitter, Output} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import {ApiService} from '../../service/api.service';

@Component({
  selector: 'app-signup-dialog',
  templateUrl: './signup-dialog.component.html',
  styleUrls: ['./signup-dialog.component.css']
})
export class SignupDialogComponent implements OnInit {

  public email: string = "";
  public username: string = "";
  public password: string = "";
  public signupError?: string;
  // @ts-ignore
  public selectedRole: number;

  @Output() signedUp: EventEmitter<any> = new EventEmitter();

  constructor(
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.selectedRole = data.role
  }

  ngOnInit(): void {
  }

  signup() {
    // console.log(this.email, this.username, this.password, this.selectedRole);
    this.apiService.signUp(
      this.email,
      this.username,
      this.password,
      this.selectedRole
    ).subscribe(result => {
      if (!result) this.signedUp.emit(false);
      else this.signedUp.emit(true);
    });
  }

}
