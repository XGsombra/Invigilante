import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {ActivatedRoute} from "@angular/router";
import {FormControl} from "@angular/forms";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {Router} from '@angular/router';
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";

import {AgoraWrapperService} from '../service/agora-wrapper.service';
import {ApiService} from "../service/api.service";
import {IdUploadComponent} from "../id-upload/id-upload.component";
import {MessageService} from '../service/message.service';
import {UserInfoService} from "../service/user-info.service";
import {IpCheckDialogComponent} from '../dialog/ip-check-dialog/ip-check-dialog.component';
import {LeaveExamDialogComponent} from '../dialog/leave-exam-dialog/leave-exam-dialog.component';
import {IdDialogComponent} from '../dialog/id-dialog/id-dialog.component';

import html2canvas from 'html2canvas';
import { image } from 'html2canvas/dist/types/css/types/image';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, OnDestroy {
  separatorKeysCodes: number[] = [ENTER, COMMA];
  public idUploaded = false;
  public selectedStudents: string[] = [];
  public newSelectedStudents: string[] = [];

  // @ts-ignore
  @ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
  // @ViewChild('agora_local') screen!: ElementRef;
  // @ViewChild('canvas') canvas!: ElementRef;
  @ViewChild('downloadLink') downloadLink!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    public agoraService: AgoraWrapperService,
    public userService: UserInfoService,
    private apiService: ApiService,
    private messageServive: MessageService,
    public router: Router
  ) {
    // this.agoraService.createClient();
  }

  afterUploaded(result: boolean): void {
    this.idUploaded = result;
  }

  screenShot() {
    this.agoraService.remoteUsers.forEach(student => {
      const remoteUserEmail = student.email;
      const screen = document.getElementById('agora_remote'+remoteUserEmail);
      if (!screen) return;
      const canvas = document.createElement('canvas');

      const video = screen.querySelector('video');
      if (!video) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      video.style.backgroundImage = `url(${canvas.toDataURL()})`;
      video.style.backgroundSize = 'cover';

      html2canvas(video).then(_canvas => {
        _canvas.toBlob((blob: Blob | null) => {
          if (blob != null) this.processScreenShot(blob, remoteUserEmail);
        });

        // let imgLink = document.createElement('a');
        // imgLink.href = _canvas.toDataURL();
        // imgLink.download = "examScreenShot.png";

        // document.body.appendChild(imgLink);
        // imgLink.click();
        // document.body.removeChild(imgLink);

        // this.downloadLink.nativeElement.href = _canvas.toDataURL('image/png');
        // this.downloadLink.nativeElement.download = 'examScreenShot.png';
        // this.downloadLink.nativeElement.click();
      });
    });

  }

  processScreenShot(blob: Blob, email: string) {
    // File representation of the screenshot
    let screenShotFile: any = blob;
    screenShotFile.lastModifiedDate = new Date();
    screenShotFile.name = 'screenshot';

    this.apiService.getPersonId(email).subscribe((personIdObj: any) => {
      if (!personIdObj) {
        return;
      }
      this.apiService.uploadScreenshot(screenShotFile, personIdObj.personId).subscribe(result => {
        for (const user of this.agoraService.remoteUsers) {
          if (user.email === email) {
            user.isSus = (!result.isIdentical) || (!result.headPose);
            user.confidence = result.confidence;
            if (result.message) {
              user.message = result.message;
            } else {
              user.message = '';
            }
          }
        }
      });
    });
  }

  processScreenShotResult() {
    if (this.newSelectedStudents.length > this.selectedStudents.length) {
      this.newSelectedStudents.forEach(student => {
        if (!this.selectedStudents.includes(student)) { // new student added
          let remoteScreen = document.getElementById('remote-tile-'+student);
          if (!remoteScreen) return;
          else remoteScreen.classList.add('focused-screen');
        }
      });
      this.selectedStudents = this.newSelectedStudents;
    }
    else if (this.newSelectedStudents.length < this.selectedStudents.length) {
      this.selectedStudents.forEach(student => {
        if (!this.newSelectedStudents.includes(student)) { // student de-selected
          let remoteScreen = document.getElementById('remote-tile-'+student);
          if (!remoteScreen) return;
          else remoteScreen.classList.remove('focused-screen');
        }
      });
      this.selectedStudents = this.newSelectedStudents
    }
  }

  addInvigilator(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our invigilator
    if ((value || '').trim()) {
      this.promoteInvigilator(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.agoraService.userCtrl.setValue(null);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.promoteInvigilator(event.option.viewValue);
    this.userInput.nativeElement.value = '';
    this.agoraService.userCtrl.setValue(null);
  }

  promoteInvigilator(user: string): void {
    this.apiService.promoteInvigilator(this.getCourseName(), user)
      .subscribe(res => {
        if (!res) return;
        this.agoraService.invigilators.push(user);
      });
  }

  getCourseName(): string {
    // this.agoraService.createClient();
    // @ts-ignore
    return this.route.snapshot.paramMap.get('course');
  }

  showIpCheck(): void {
    this.apiService.getDuplicateIpStudent(this.getCourseName()).subscribe(res => {
      if (!res) return;

      this.messageServive.renderMessage(IpCheckDialogComponent, res);
    });
  }

  showId(name: string, email: string): void {
    this.messageServive.renderMessage(IdDialogComponent, {name: name, email: email});
  }

  ngOnInit(): void {
    this.route.params.subscribe(val => {
      console.log('entered course: ', val.course);
    });
  }

  leaveCall(): void {
    let dialogRef = this.messageServive.renderMessage(LeaveExamDialogComponent);
    dialogRef.componentInstance.leaveConfirmed.subscribe((isConfirmed: any) => {
      dialogRef.close();

      if (isConfirmed) {
        this.agoraService.leaveCall();
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnDestroy(): void {
    this.agoraService.leaveCall();
  }

}
