import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-id-dialog',
  templateUrl: './id-dialog.component.html',
  styleUrls: ['./id-dialog.component.css']
})
export class IdDialogComponent implements OnInit {
  public email: string = '';
  public name: string = ''; 

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.email = data.email;
    this.name = data.name;
  }

  ngOnInit(): void {

  }

}
