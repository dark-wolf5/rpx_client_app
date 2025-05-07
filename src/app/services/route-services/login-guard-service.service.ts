import {Injectable} from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import {logOutCallback} from '../../helpers/logout-callback';
import {UserauthService} from '../userauth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuardServiceService {
  constructor(
    private router: Router,
    private userAuthService: UserauthService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const response = await this.userAuthService.checkIfLoggedIn();

    if (response.message === '1') {
      return true;
    } else {
      const resp = {
        success: true,
      };

      logOutCallback(resp);

      return false;
    }
  }
}
