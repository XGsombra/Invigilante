import {Injectable} from '@angular/core';
import AgoraRTC, {
  CameraVideoTrackInitConfig,
  IAgoraRTCClient,
  ICameraVideoTrack,
  ILocalTrack,
  IMicrophoneAudioTrack, IRemoteVideoTrack,
  MicrophoneAudioTrackInitConfig
} from 'agora-rtc-sdk-ng';
import {from, Observable, Subject} from 'rxjs';
import {ApiService} from './api.service';
import {map, startWith, takeUntil} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {StudentInfo} from '../models/StudentInfo';


export declare type UID = number | string;

@Injectable({
  providedIn: 'root'
})
export class AgoraWrapperService {

  // @ts-ignore
  client: IAgoraRTCClient = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});
  // @ts-ignore
  localAudioTrack: IMicrophoneAudioTrack;
  // @ts-ignore
  localVideoTrack: ICameraVideoTrack;
  remoteUsers: StudentInfo[] = [];
  remoteStreams = [];
  // @ts-ignore
  filteredUsers: Observable<string[]>;
  userCtrl = new FormControl();
  invigilators: string[] = [];
  status = {
    connected: false,
    audioEnabled: false,
    videoEnabled: false,
    noUpdate: false     // deprecated
  };

  // @ts-ignore
  public ngUnsubscribe: Subject<void>;

  public subscribe(): void {
    this.ngUnsubscribe = new Subject<void>();
  }

  public unsubscribe(): void {
    if (!this.ngUnsubscribe) return;
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  statsInterval = 0;

  constructor(
    private apiService: ApiService,
  ) {
  }

  public createClient(): void {
    this.client = AgoraRTC.createClient({mode: 'rtc', codec: 'vp8'});
  }

  public createCall(course: string): void {
    this.createClient();
    this.apiService.generateAgoraToken(course).subscribe(async agoraConfig => {
      this.status.noUpdate = false;
      this.subscribe();
      if (!agoraConfig) {
        return;
      }
      const uid = await this.client.join(agoraConfig.appid, agoraConfig.channel, agoraConfig.token, agoraConfig.uid);
      this.status.connected = true;

      this.subscribeToClient(true, course, uid);
      // this.updateInvigilators(course);

      // get both audio and video track
      try {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        this.status.audioEnabled = true;
      } catch (error) {
        console.log(error);
      }

      try {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        this.localVideoTrack.play('agora_local');
        this.status.videoEnabled = true;
      } catch (error) {
        console.log(error);
      }
      // publish the local tracks
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);

      console.log('publish success!');
    });
  }

  public startBasicCall(course: string): void {
    this.createClient();
    this.apiService.getAgoraSpec(course).subscribe(async agoraConfig => {
      this.status.noUpdate = false;
      this.subscribe();
      if (!agoraConfig) {
        return;
      }
      const uid = await this.client.join(agoraConfig.appid, agoraConfig.channel, agoraConfig.token, agoraConfig.uid);
      this.status.connected = true;

      this.subscribeToClient(false, course, uid);

      // get both audio and video track
      try {
        this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        this.status.audioEnabled = true;
      } catch (error) {
        console.log(error);
      }

      try {
        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        this.localVideoTrack.play('agora_local');
        this.status.videoEnabled = true;
      } catch (error) {
        console.log(error);
      }
      // publish the local tracks
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);

      console.log('publish success!');

      this.initStats(this.client);
    });
  }

  private playAudioOrVideo(user: any, mediaType: any): void {
    // taking the video track
    if (mediaType === 'video') {
      // after published, get the video track fro mthe user
      const remoteVideoTrack = user.videoTrack;

      // add new id into remoteTracks for ngFor display
      this.apiService.getUsernameByEmail(user.uid.toString()).subscribe(res => {
        if (this.remoteUsers.every(student => student.email !== user.uid.toString())) {
          this.remoteUsers.push({
            email: user.uid.toString(),
            name: res.username,
            isSus: false,
            confidence: 0,
            message: ''
          });
          // wait a sec to play the track, let html created first
          setTimeout(() => remoteVideoTrack?.play(`agora_remote${user.uid.toString()}`), 1000);
          console.log(user.uid, 'joined the chat');
        }
      });
    }

    // taking the audio track
    if (mediaType === 'audio') {
      // no need to change DOM for audio
      user.audioTrack?.play();
    }
  }

  public subscribeToClient(isHost: boolean, course: string, uid: UID): void {
    console.log('subscribeToClient ...');
    this.client.on('user-published', async (user, mediaType) => {
      // subscribe remote users
      await this.client.subscribe(user, mediaType);
      console.log('subscribe success');

      if (isHost) {
        this.playAudioOrVideo(user, mediaType);

        this.filteredUsers = this.userCtrl.valueChanges.pipe(
          startWith(null),
          map((userid: string | null) => userid ? this._filter(userid) : this._allUsers().slice())
        );
      } else {
        // @ts-ignore
        this.remoteStreams.push({user, mediaType});
      }
    });

    this.client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {

        // remove the id from the remote track array
        this.remoteUsers.forEach((student, index) => {
          if (student.email === user.uid.toString()) {
            this.remoteUsers.splice(index, 1);
          }
        });
        console.log(user.uid, 'left the chat');
      }
    });

    this.apiService.getInvigilatorsList(course).subscribe(invigilators => {
      this.invigilators = invigilators.invigilators;
    });

    if (!isHost) {
      this.refresh(course, uid);
    } else {
      this.updateInvigilators(course, uid);
    }
  }

  private refresh(course: string, uid: UID): void {
    // setTimeout(() => {
    //   if (!this.status.noUpdate) {
    //     this.apiService.getInvigilatorsList(course).subscribe(invigilators => {
    //       this.invigilators = invigilators.invigilators;
    //       if (this.invigilators.includes(uid.toString())) {
    //         this.remoteStreams.forEach(item => {
    //           // @ts-ignore
    //           this.playAudioOrVideo(item.user, item.mediaType);
    //         });
    //         this.remoteStreams = [];
    //         this.updateInvigilators(course);
    //       } else {
    //         this.refresh(course, uid);
    //       }
    //     });
    //   }
    // }, 2000);

    this.apiService.getInvigilatorsListLongPoll(course, uid.toString())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(invigilators => {
        if (invigilators) {
          this.invigilators = invigilators.invigilators;
          if (this.invigilators.includes(uid.toString())) {
            this.remoteStreams.forEach(item => {
              // @ts-ignore
              this.playAudioOrVideo(item.user, item.mediaType);
            });
            this.remoteStreams = [];
            this.updateInvigilators(course, uid);
          } else {
            this.refresh(course, uid);
          }
        } else {
          this.refresh(course, uid);
        }
      });
  }

  private updateInvigilators(course: string, uid: UID): void {
    // setTimeout(() => {
    //   if (!this.status.noUpdate) {
    //     this.apiService.getInvigilatorsList(course).subscribe(invigilators => {
    //       this.invigilators = invigilators.invigilators;
    //       this.updateInvigilators(course);
    //     });
    //   }
    // }, 2000);
    this.apiService.getInvigilatorsListLongPoll(course, uid.toString())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(invigilators => {
        if (invigilators) {
          this.invigilators = invigilators.invigilators;
        }
        this.updateInvigilators(course, uid);
      });
    this.client.on('user-published', async (user, mediaType) => {
      // subscribe remote users
      await this.client.subscribe(user, mediaType);
      console.log('subscribe success');

      this.playAudioOrVideo(user, mediaType);

      this.filteredUsers = this.userCtrl.valueChanges.pipe(
        startWith(null),
        map((userid: string | null) => userid ? this._filter(userid) : this._allUsers().slice())
      );
    });
  }

  async leaveCall() {
    this.status.noUpdate = true;
    this.unsubscribe();

    // close the local tracks
    if (this.status.audioEnabled) {
      this.localAudioTrack.close();
      this.status.audioEnabled = false;
    }
    if (this.status.videoEnabled) {
      this.localVideoTrack.close();
      this.status.videoEnabled = false;
    }

    this.destructStats();

    // clean the remote tracks
    this.remoteUsers = [];
    this.invigilators = [];

    // leave the client
    await this.client.leave();

    this.status.connected = false;
  }

  async toggleAudio() {
    this.status.audioEnabled = !this.status.audioEnabled;
    await this.localAudioTrack.setEnabled(this.status.audioEnabled);
  }

  async toggleVideo() {
    this.status.videoEnabled = !this.status.videoEnabled;
    await this.localVideoTrack.setEnabled(this.status.videoEnabled);
  }


  private _allUsers(): string[] {
    return this.remoteUsers.map(student => student.email.toString());
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this._allUsers().filter(user => user.toLowerCase().indexOf(filterValue) === 0);
  }

  initStats(client: any): void {
    this.statsInterval = setInterval(() => {
      this.flushStats(client);
    }, 1000);
  }

// stop collect and show stats information
  destructStats(): void {
    clearInterval(this.statsInterval);
    const statElmt = document.getElementById('local-stats');
    if (!statElmt) {
      return;
    }
    statElmt.innerHTML = '';
  }

  public flushStats(client: any): void {
    const localStats = {video: client.getLocalVideoStats(), audio: client.getLocalAudioStats()};
    const localStatsList = [
      {description: 'Send audio bit rate', value: localStats.audio.sendBitrate, unit: 'bps'},
      {description: 'Total audio bytes sent', value: localStats.audio.sendBytes, unit: 'bytes'},
      {description: 'Total audio packets sent', value: localStats.audio.sendPackets, unit: ''},
      {description: 'Total audio packets loss', value: localStats.audio.sendPacketsLost, unit: ''},
      {description: 'Video capture resolution height', value: localStats.video.captureResolutionHeight, unit: ''},
      {description: 'Video capture resolution width', value: localStats.video.captureResolutionWidth, unit: ''},
      {description: 'Video send resolution height', value: localStats.video.sendResolutionHeight, unit: ''},
      {description: 'Video send resolution width', value: localStats.video.sendResolutionWidth, unit: ''},
      {description: 'video encode delay', value: Number(localStats.video.encodeDelay).toFixed(2), unit: 'ms'},
      {description: 'Send video bit rate', value: localStats.video.sendBitrate, unit: 'bps'},
      {description: 'Total video bytes sent', value: localStats.video.sendBytes, unit: 'bytes'},
      {description: 'Total video packets sent', value: localStats.video.sendPackets, unit: ''},
      {description: 'Total video packets loss', value: localStats.video.sendPacketsLost, unit: ''},
      {description: 'Video duration', value: localStats.video.totalDuration, unit: 's'},
      {description: 'Total video freeze time', value: localStats.video.totalFreezeTime, unit: 's'},
    ];

    const statElmt = document.getElementById('local-stats');
    if (!statElmt) {
      return;
    }
    statElmt.innerHTML = `
      ${localStatsList.map(stat => `<p class="stats-row">${stat.description}: ${stat.value} ${stat.unit}</p>`).join('')}
      `;
  }

}
