import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ip-check-dialog',
  templateUrl: './ip-check-dialog.component.html',
  styleUrls: ['./ip-check-dialog.component.css']
})
export class IpCheckDialogComponent implements OnInit {

  displayedColumns: string[] = ['ip', 'student'];
  public dataSource: any[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.procesesData(data.repeatedIP);
  }

  procesesData(repeatedIp: object): void {
    for (let [ip, students] of Object.entries(repeatedIp)) {
      // if (students.length < 2) continue;

      students.forEach((student: string, i: number) => {
        if (i == 0) this.dataSource.push({"ip": ip, "student": student});
        else this.dataSource.push({"ip": '', "student": student});
      });
    }
  }

  ngOnInit(): void {
  }

}
