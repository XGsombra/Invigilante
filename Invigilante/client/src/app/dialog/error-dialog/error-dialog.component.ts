import { Component, OnInit, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.css']
})
export class ErrorDialogComponent implements OnInit {

  public errMessage: string = '';
  public suggestion: string = 'Close this window, we take care of the rest :)'; // TODO: a placeholder in case we want to suggest the user what to do

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.errMessage = data.errMessage;
    if (data.suggestion && data.suggestion != "") this.suggestion = data.suggestion
  }

  ngOnInit(): void {
  }

}
