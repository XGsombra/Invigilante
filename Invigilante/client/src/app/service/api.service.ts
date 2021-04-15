import {Injectable} from '@angular/core';
import {HttpClient, HttpRequest, HttpHeaders} from '@angular/common/http';
import {Observable, of, pipe} from 'rxjs';
import {AgoraConfig} from '../models/AgoraConfig';
import {catchError, tap, timeout} from 'rxjs/operators';

import {MessageService} from './message.service';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  baseUrl = '/api';

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router
  ) {
  }

  private send(method: any, url: string, body: any = {}): Observable<any> {
    switch (method) {
      case 'GET':
        return this.http.get<string>(this.baseUrl + url, {withCredentials: true});
      case 'POST':
        const postHeaders = {'Content-Type': 'application/json'};
        return this.http.post<string>(this.baseUrl + url, body, {headers: postHeaders, withCredentials: true});
      case 'PUT':
        const putHeaders = {'Content-Type': 'application/json'};
        return this.http.put<string>(this.baseUrl + url, body, {headers: putHeaders, withCredentials: true});
      // case "UPDATE":
      //   return;
      // case "DELETE":
      //   return;
      default:
        console.log('unhandled request type', method);
        return new Observable();
    }
  }

  private handleError<T>(operation = 'operation', suggestion: string = '', result?: T) {
    return (error: any): Observable<T> => {

      if (error.name === 'TimeoutError') {
        return of(result as T);
      }

      // TODO: send the error to remote logging infrastructure
      this.messageService.renderErrorMessage({
        errMessage: error.error.message ? error.error.message : error.error,
        suggestion: suggestion
      });

      // TODO: better job of transforming error for user consumption
      // this.log(`${operation} failed: ${error.message}`);

      if (error.status === 401) {
        this.router.navigate(['/']);
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  signUp(email: string, username: string, password: string, role: number): Observable<any> {
    return this.send('POST', '/user/signup/', {
      email: email,
      username: username,
      password: password,
      role: role
    }).pipe(
      catchError(this.handleError<any>('signUp', "try a different email address")));
  }

  signIn(email: string, password: string): Observable<any> {
    return this.send('POST', '/user/signin/', {email: email, password: password})
      .pipe(
        catchError(this.handleError<any>('signIn', "type slowly :)")));
  }

  signOut(): Observable<any> {
    return this.send('GET', '/user/signout/', {})
      .pipe(
        catchError(this.handleError<any>('signOut')));
  }

  isEmailVerified(): Observable<any> {
    return this.send('GET', '/user/verified/', {})
      .pipe(
        catchError(this.handleError<any>('isEmailVerified')));
  }

  verifyEmail(): Observable<any> {
    return this.send('PUT', '/user/authenticate/', {})
      .pipe(
        catchError(this.handleError<any>('verifyEmail')));
  }

  generateAgoraToken(courseName: string): Observable<AgoraConfig> {
    return this.send('PUT', '/exam/' + courseName, {})
      .pipe(
        catchError(this.handleError<AgoraConfig>('generateAgoraToken')));
  }

  // @ts-ignore
  addExam(course: string, pass: string) {
    return this.send('POST', '/exam/', {channel: course, passcode: pass})
      .pipe(
        catchError(this.handleError<any>('addExam', "try a different name for the exam")));
  }

  deleteExam(course: string): Observable<any> {
    return this.http.delete<any>(this.baseUrl + '/exam/' + course, {withCredentials: true})
      .pipe(
        catchError(this.handleError<any>('deleteExam'))
      );
  }

  enterExamPrep(courseName: string, password: string): Observable<any> {
    return this.send('POST', '/exam/' + courseName + '/verify', { passcode: password })
    .pipe(
      catchError(this.handleError<any>('enterExamPrep', "type slowly :)")));
  }

  getAgoraSpec(courseName: string): Observable<AgoraConfig> {
    return this.http.put<AgoraConfig>(this.baseUrl + '/exam/' + courseName + '/students/enter', {}, {withCredentials: true})
      .pipe(
        catchError(this.handleError<AgoraConfig>('generateAgoraToken')));
  }

  getCourseNames(): Observable<any> {
    return this.http.get(this.baseUrl + '/exam/exams', {withCredentials: true})
      .pipe(
        catchError(this.handleError<any>('getCourseNames'))
      );
  }

  getCourseNamesLongPoll(): Observable<any> {
    return this.http.get(this.baseUrl + '/exam/exams-longpoll', {withCredentials: true})
      .pipe(
        timeout(60 * 1000),
        catchError(this.handleError<any>('getCourseNamesLongPoll'))
      );
  }

  getInvigilatorsList(courseName: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/exam/' + courseName + '/invigilators', {withCredentials: true})
      .pipe(
        catchError(this.handleError<any>('getStudentsList'))
      );
  }

  getInvigilatorsListLongPoll(courseName: string, email: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + '/exam/invigilators-longpoll/' + courseName + '(' + email + ')', {withCredentials: true})
      .pipe(
        timeout(60 * 1000),
        catchError(this.handleError<any>('getInvigilatorsListLongPoll'))
      );
  }

  promoteInvigilator(courseName: string, user: string): Observable<any> {
    return this.http.put<any>(this.baseUrl + '/exam/' + courseName + '/promote', {email: user}, {withCredentials: true})
      .pipe(
        catchError(this.handleError<any>('getPromoteInvigilator'))
      );
  }

  initPersonGroup(course: string): Observable<any> {
    return this.send('POST', '/face/initialize/', {channel: course})
    .pipe(
      catchError(this.handleError<any>('initPersonGroup', "oops, an unexpected error occur :o")));
  }

  initPersonGroupTarget(): Observable<any> {
    return this.send('POST', '/face/personGroupPerson/', {})
    .pipe(
      catchError(this.handleError<any>('initPersonGroupTarget', "oops, an unexpected error occur :o")));
  }

  uploadId(idPic: any): Observable<any> {
    let form = new FormData();
    form.append('file', idPic);
    return this.http.post<string>(this.baseUrl + '/face/face/', form, {withCredentials: true})
      .pipe(
        catchError(this.handleError<any>('uploadFile')));
  }

  uploadScreenshot(screenshotPic: any, personId: string): Observable<any> {
    let form = new FormData();
    form.append('file', screenshotPic);
    form.append('personId', personId);
    return this.http.post<string>(this.baseUrl + '/face/face/verification/', form, {withCredentials: true})
      .pipe(
        catchError(this.handleError<any>('uploadScreenshot')));
  }

  getPersonId(email: string): Observable<any> {
    return this.send('GET', '/face/personGroupPerson/' + email)
      .pipe(
        catchError(this.handleError<any>('getPersonId')));
  }

  getUsernameByEmail(email: string): Observable<any> {
    return this.send('GET', '/user/username/' + email)
      .pipe(
        catchError(this.handleError<any>('getUsernameByEmail')));
  }

  getDuplicateIpStudent(courseName: string): Observable<any> {
    return this.send('GET', '/exam/repeatedip/' + courseName)
      .pipe(
        catchError(this.handleError<any>('getDuplicateIpStudent')));
  }
}
