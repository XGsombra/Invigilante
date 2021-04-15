import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ActivatedRoute} from "@angular/router";

import { ApiService } from '../../service/api.service';

@Component({
  selector: 'app-enterexam-dialog',
  templateUrl: './enterexam-dialog.component.html',
  styleUrls: ['./enterexam-dialog.component.css']
})
export class EnterexamDialogComponent implements OnInit {
  private courseName: string = "";
  public examPass: string = "";
  @Output() validated: EventEmitter<any> = new EventEmitter();

  constructor(private apiService: ApiService,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.courseName = data.courseName;
    }

  ngOnInit(): void {
  }

  validateStudent() {
    this.apiService.enterExamPrep(this.courseName, this.examPass).subscribe(result => {
      if (!result) this.validated.emit(false);
      else this.validated.emit(true);
    });
  }

}
