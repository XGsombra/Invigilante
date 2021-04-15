import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-signin-dialog',
  templateUrl: './signin-dialog.component.html',
  styleUrls: ['./signin-dialog.component.css']
})
export class SigninDialogComponent implements OnInit {

  public email: string = "";
  public password: string = "";
  public signinError?: string;

  @Output() signedIn: EventEmitter<any> = new EventEmitter();

  constructor(
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
  }

  signin() {
    this.apiService.signIn(this.email, this.password).subscribe(result => {
      if (!result) this.signedIn.emit(false);
      else this.signedIn.emit(true);
    });
  }
}
