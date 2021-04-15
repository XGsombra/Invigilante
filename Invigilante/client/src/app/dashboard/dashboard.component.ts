import {Component, OnDestroy, OnInit} from '@angular/core';
import {ApiService} from '../service/api.service';
import {MessageService} from '../service/message.service';
import {UserInfoService} from '../service/user-info.service';
import {NewexamDialogComponent} from '../dialog/newexam-dialog/newexam-dialog.component';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  courseName = '';

  public entries: string[] = [];

  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    public userService: UserInfoService
  ) {
  }

  ngOnInit(): void {
    this.getActiveExams();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshExams(): void {
    this.apiService.getCourseNamesLongPoll()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res) {
          this.entries = res;
        }
        this.refreshExams();
      });
  }

  getActiveExams() {
    this.apiService.getCourseNames().subscribe(res => {
      if (!res) {
        return;
      }
      this.entries = res;
      this.refreshExams();
    });
  }

  renderNewExamForm() {
    let dialogRef = this.messageService.renderMessage(NewexamDialogComponent);
    dialogRef.componentInstance.examCreated.subscribe((isCreateSuccessful: any) => {
      if (isCreateSuccessful) {
        dialogRef.close();
        // this.getActiveExams();
      }
    });
  }

  deleteExam(course: any) {
    this.apiService.deleteExam(course).subscribe(res => {
      // this.getActiveExams();
    }, error => {
      console.log(error);
    });
  }

}
