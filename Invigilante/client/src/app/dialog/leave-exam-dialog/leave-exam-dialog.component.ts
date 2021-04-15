import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-leave-exam-dialog',
  templateUrl: './leave-exam-dialog.component.html',
  styleUrls: ['./leave-exam-dialog.component.css']
})
export class LeaveExamDialogComponent implements OnInit {

  @Output() leaveConfirmed: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  confirmLeaving(isConfirmed: boolean): void {
    this.leaveConfirmed.emit(isConfirmed);
  }

}
