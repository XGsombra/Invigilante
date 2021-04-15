import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from '../service/message.service';
import { EnterexamDialogComponent } from '../dialog/enterexam-dialog/enterexam-dialog.component'

@Component({
  selector: 'app-dashboard-entry',
  templateUrl: './dashboard-entry.component.html',
  styleUrls: ['./dashboard-entry.component.css']
})
export class DashboardEntryComponent implements OnInit {

  @Input() course?: string;
  @Input() courseId?: string;

  constructor(
    private messageService: MessageService,
    private router: Router) { }

  ngOnInit(): void {
  }

  enterExam() {
    this.router.navigate(['/exam/' + this.course]);
  }

  renderEnterExamDialog() {
    let dialogRef = this.messageService.renderMessage(EnterexamDialogComponent, {courseName: this.course});
    dialogRef.componentInstance.validated.subscribe((isStudentValidated: any) => {
      if (isStudentValidated) {
        dialogRef.close();
        this.enterExam();
      }
    });
  }

}
