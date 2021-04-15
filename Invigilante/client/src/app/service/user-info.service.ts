import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {RoleEnum} from '../models/RoleEnum';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  constructor(
    private cookieService: CookieService
  ) {
  }

  getRoleCode(): number {
    return parseInt(this.cookieService.get('role'));
  }

  getEmail(): string {
    return this.cookieService.get('email');
  }

  getName(): string {
    return this.cookieService.get('name');
  }

  getRoleName(): string {
    const roleCode = this.getRoleCode();
    if (roleCode === RoleEnum.INSTRUCTOR) {
      return 'Instructor';
    } else if (roleCode === RoleEnum.STUDENT) {
      return 'Student';
    }
    return '';
  }

  isInstructor(): boolean {
    return this.getRoleCode() === RoleEnum.INSTRUCTOR;
  }
}
