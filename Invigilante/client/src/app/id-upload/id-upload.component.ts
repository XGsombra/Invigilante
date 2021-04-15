import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import {ApiService} from "../service/api.service";
import {MessageService} from '../service/message.service';

@Component({
  selector: 'app-id-upload',
  templateUrl: './id-upload.component.html',
  styleUrls: ['./id-upload.component.css']
})
export class IdUploadComponent implements OnInit {

  public uploaded: boolean = false;
  @Output() onIdUploaded: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('idInput') idInput: any;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
  }

  idInputChange(event: any) {
    if (event.target.files[0].size > 700000) {
      this.messageService.renderErrorMessage({
        errMessage: "Your file size is too big",
        suggestion: "try an image less than 700kb"
      });
      this.idInput.nativeElement.value = '';
      return;
    }

    this.apiService.initPersonGroupTarget().subscribe(initResult => {    
      if (!initResult) {
        this.idInput.nativeElement.value = '';
        this.onIdUploaded.emit(false);
        return;
      }
      else {
        this.apiService.uploadId(event.target.files[0]).subscribe(targetResult => {
          if (!targetResult) {
            this.idInput.nativeElement.value = '';
            this.onIdUploaded.emit(false);
          }
          else {
            this.idInput.nativeElement.value = '';
            this.onIdUploaded.emit(true);
          }
        });
      }
    });
  }
}
