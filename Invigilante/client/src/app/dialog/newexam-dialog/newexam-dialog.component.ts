import {Component, OnInit, Inject, EventEmitter, Output} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import {ApiService} from '../../service/api.service';
import {UserInfoService} from '../../service/user-info.service'

@Component({
  selector: 'app-newexam-dialog',
  templateUrl: './newexam-dialog.component.html',
  styleUrls: ['./newexam-dialog.component.css']
})
export class NewexamDialogComponent implements OnInit {
  public examName: string = "";
  public examPass: string = "";

  @Output() examCreated: EventEmitter<any> = new EventEmitter();

  constructor(
    private apiService: ApiService,
    public userService: UserInfoService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
  }

  create() {
    this.apiService.addExam(this.examName, this.examPass).subscribe(addResult => {
      if (!addResult) {
        this.examCreated.emit(false);
        return;
      }
      this.apiService.initPersonGroup(this.examName).subscribe(initResult => {
        if (!initResult) this.examCreated.emit(false);
        else this.examCreated.emit(true);
      });
    });
  }
}
