import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {UserInfoService} from "./user-info.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {

  constructor(
    private userService: UserInfoService,
    private router: Router
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.userService.getEmail()) {
      return true;
    } else {
      this.router.navigate(['/'], {queryParams: {returnUrl: state.url}});
      return false;
    }
  }
}
