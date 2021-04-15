import { Component, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { catchError, map, tap } from 'rxjs/operators';

import { ErrorDialogComponent } from '../dialog/error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = "https://localhost:3000";
  displayMessage: string = "";

  constructor(
    public dialog: MatDialog
  ) { }

  renderMessage(dynamicComponent: any, meta: object = {}): MatDialogRef<any> {
    let messageType = "type here";
    let messageContent = "content here";
    const dialogConfig = new MatDialogConfig();

    // dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
        messageType: messageType,
        messageContent: messageContent
    };
    dialogConfig.minWidth = 300;

    let dialogRef = this.dialog.open(dynamicComponent, {
      width: '400px',
      data: meta
    });

    return dialogRef;
  }

  renderErrorMessage(meta: object = { errMessage: "opps, an error occur" }): MatDialogRef<any> {
    return this.renderMessage(ErrorDialogComponent, meta);
  }

  clear() {
    this.displayMessage = "";
  }
}
