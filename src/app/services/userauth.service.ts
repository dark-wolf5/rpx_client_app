import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {handleError} from '../helpers/error-helper';
import {User} from '../models/user';

import * as rpxGlobals from '../globals';

const USER_API = rpxGlobals.API + 'user';

@Injectable({
  providedIn: 'root',
})
export class UserauthService {
  userLogin: string;
  userPassword: string;
  userRememberMe: string;
  userRememberMeToken: string;
  userTimezone: string;
  route: string;
  userProfile: User = new User();
  myId$: Observable<number> = new Observable();

  constructor(private http: HttpClient) {}

  async checkIfLoggedIn(): Promise<any> {
    const checkLoginObject = {};
    const loginApi = `${USER_API}/check-user-auth`;

    return new Promise((resolve, reject) => {
      this.http.post<any>(loginApi, checkLoginObject).subscribe(resp => {
        this.myId$ = of(resp.user_id);
        if (resp.message === '1') {
          resolve(resp);
        } else {
          reject();
        }
      });
    });
  }

  logOut(): Observable<any> {
    const logOutApi = `${USER_API}/logout`;
    return this.http.post<any>(logOutApi, null);
  }

  initLogin(
    userLogin: string,
    userPassword: string,
    userRememberMe: string
  ): Observable<any> {
    this.userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const params = {
      login: userLogin,
      password: userPassword,
      remember_me_opt: userRememberMe,
      timezone: this.userTimezone,
      route: this.route,
    };

    const logInApi = `${USER_API}/login`;

    return this.http.post<any>(logInApi, params).pipe(
      catchError(err => {
        throw err;
      })
    );
  }

  getSettings(): Observable<any> {
    const getSettingsApi = `${USER_API}/settings`;

    return this.http.post<any>(getSettingsApi, null).pipe(
      tap(settings => {
        this.userProfile = settings;
      }),
      catchError(err => {
        throw err;
      })
    );
  }

  saveSettings(user: User): Observable<any> {
    const saveSettingsApi = `${USER_API}/update`;

    let saveSettingsObj;

    if (user.business === undefined) {
      saveSettingsObj = {
        _method: 'PUT',
        username: user.username,
        email: user.email,
        first_name: user.rpx_user.first_name,
        last_name: user.rpx_user.last_name,
        phone_number: '+1'+user.rpx_user.phone_number,
        sms_opt_in: user.rpx_user.sms_opt_in,
        ghost_mode: user.rpx_user.ghost_mode,
        privacy: user.rpx_user.privacy,
        account_type: user.rpx_user.user_type,
      };
    } else {
      saveSettingsObj = {
        _method: 'PUT',
        username: user.username,
        email: user.email,
        first_name: user.rpx_user.first_name,
        last_name: user.rpx_user.last_name,
        phone_number: '+1'+user.rpx_user.phone_number,
        sms_opt_in: user.rpx_user.sms_opt_in,
        ghost_mode: user.rpx_user.ghost_mode,
        privacy: user.rpx_user.privacy,
        account_type: user.rpx_user.user_type,
        origin_description: user.business.description,
        origin_address: user.business.address,
        origin_title: user.business.name,
        origin_x: user.business.loc_x,
        origin_y: user.business.loc_y,
      };
    }

    return this.http.post<any>(saveSettingsApi, saveSettingsObj).pipe(
      catchError(err => {
        throw err;
      })
    );
  }

  setPassResetPin(emailOrPhone: string, using_phone_number: boolean = false): Observable<any> {
    const resetPasswordApi = `${USER_API}/send-pass-email`;
    const setPassResetObj = {
      email: emailOrPhone,
      using_phone_number,
    };

    return this.http.post<any>(resetPasswordApi, setPassResetObj).pipe(
      catchError(err => {
        throw err;
      })
    );
  }

  completeReset(
    password: string,
    passwordConfirmation: string,
    email: string,
    token: string
  ): Observable<any> {
    const resetPasswordApi = `${USER_API}/complete-pass-reset`;
    const passResetObj = {
      _method: 'PUT',
      password,
      password_confirmation: passwordConfirmation,
      email,
      token,
    };

    return this.http
      .post<any>(resetPasswordApi, passResetObj)
      .pipe(catchError(handleError('completeReset')));
  }

  passwordChange(passwordChangeObj: any): Observable<any> {
    const resetPasswordApi = `${USER_API}/change-password`;

    const passResetObj = {
      _method: 'PUT',
      password: passwordChangeObj.password,
      password_confirmation: passwordChangeObj.passwordConfirmation,
      current_password: passwordChangeObj.currentPassword,
    };

    return this.http
      .post<any>(resetPasswordApi, passResetObj)
      .pipe(catchError(handleError('passwordChange')));
  }

  deactivateAccount(
    password: string,
    deactivation_type: boolean,
    is_social_account: boolean
  ): Observable<any> {
    const resetPasswordApi = `${USER_API}/deactivate`;
    const passResetReq = {
      body: {
        password,
        deactivation_type,
        is_social_account,
      }
    };

    return this.http
      .delete<any>(resetPasswordApi, passResetReq)
      .pipe(catchError(handleError('deactivateAccount')));
  }
}
