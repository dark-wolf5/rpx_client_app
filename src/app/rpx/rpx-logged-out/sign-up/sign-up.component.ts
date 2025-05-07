import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {Router} from '@angular/router';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ValidateUsername} from '../../../helpers/username.validator';
import {ValidatePassword} from '../../../helpers/password.validator';
import {SignUpService} from '../../../services/rpx-logged-out/sign-up/sign-up.service';
import {catchError, filter, tap} from 'rxjs/operators';
import {Observable} from 'rxjs/internal/Observable';
import {BehaviorSubject, EMPTY, of, switchMap} from 'rxjs';
import {EmailConfirmationService} from '../../email-confirmation/email-confirmation.service';
import {ValidateUniqueEmail} from '../../../validators/email-unique.validator';
import {
  faEye,
  faEyeSlash,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import {AppLauncher} from '@capacitor/app-launcher';
import {LoadingController} from '@ionic/angular';
import {Preferences} from '@capacitor/preferences';
import {ChangeDetection} from '@angular/cli/lib/config/workspace-schema';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['../../menu.component.css', './sign-up.component.css'],
})
export class SignUpComponent implements OnInit {
  @ViewChild('rpxRegisterInfo') rpxRegisterInfo;
  @ViewChild('rpxSignUpIssues') rpxSignUpIssues;

  @Output() closeWindow = new EventEmitter();
  @Output() logInEvent = new EventEmitter();
  @Input() windowObj;

  faEye = faEye;
  faEyeSlash = faEyeSlash;

  signUpFormx: UntypedFormGroup;
  signingUp$ = new BehaviorSubject<boolean>(false);
  submitted$ = new BehaviorSubject<boolean>(false);
  loading$ = new BehaviorSubject<boolean>(undefined);
  passwordShow$ = new BehaviorSubject<boolean>(false);
  loader: HTMLIonLoadingElement;

  constructor(
    private router: Router,
    private signUpService: SignUpService,
    private formBuilder: UntypedFormBuilder,
    private loadingCtrl: LoadingController,
    private changeDetection: ChangeDetectorRef
  ) {
    this.initLoading();
  }

  get rpxUsername() {
    return this.signUpFormx.get('rpxUsername').value;
  }
  get rpxEmail() {
    return this.signUpFormx.get('rpxEmail').value;
  }
  get rpxPassword() {
    return this.signUpFormx.get('rpxPassword').value;
  }

  get f() {
    return this.signUpFormx.controls;
  }

  ngOnInit() {
    this.initSignUpForm();
  }

  closeWindowX(): void {
    this.closeWindow.emit(this.windowObj);
  }

  removeWhiteSpace(key) {
    this.signUpFormx.get(key).setValue(this.signUpFormx.get(key).value.trim());
  }

  togglePassword() {
    this.passwordShow$.next(!this.passwordShow$.getValue());
  }

  initSignUp(): void {
    this.submitted$.next(true);
    this.rpxSignUpIssues.nativeElement.scrollTo(0, 0);
    this.signUpFormx.updateValueAndValidity();

    // stop here if form is invalid
    if (this.signUpFormx.invalid) {
      if (this.signUpFormx.get('rpxUsername').invalid) {
        document.getElementById('rpx_username').style.border =
          '1px solid red';
      } else {
        document.getElementById('rpx_username').style.border = 'unset';
      }

      if (this.signUpFormx.get('rpxEmail').invalid) {
        document.getElementById('user_email').style.border = '1px solid red';
      } else {
        document.getElementById('user_email').style.border = 'unset';
      }

      if (this.signUpFormx.get('rpxPassword').invalid) {
        document.getElementById('user_pass').style.border = '1px solid red';
      } else {
        document.getElementById('user_pass').style.border = 'unset';
      }

      return;
    } else {
      document.getElementById('rpx_username').style.border = 'unset';
      document.getElementById('user_email').style.border = 'unset';
      document.getElementById('user_pass').style.border = 'unset';
    }

    const username = this.rpxUsername;
    const password = this.rpxPassword;
    const email = this.rpxEmail;

    const signUpObj = {
      username,
      password,
      email,
      route: this.router.url,
    };

    this.loading$.next(true);

    this.signUpService
      .initRegister(signUpObj)
      .pipe(
        catchError(this.signUpError()),
        filter(r => !!r)
      )
      .subscribe(resp => {
        this.initSignUpCallback(resp);
      });
  }

  populateErrors(r) {
    const errorList = r.errors;

    if (errorList.username) {
      const errors: {[k: string]: any} = {};
      errorList.username.forEach(err => {
        errors[err] = true;
      });

      this.signUpFormx.controls['rpxUsername'].setErrors(errors);
      document.getElementById('rpx_username').style.border =
        '1px solid red';
    } else {
      document.getElementById('rpx_username').style.border = 'unset';
    }

    if (errorList.email) {
      const errors: {[k: string]: any} = {};
      errorList.email.forEach(err => {
        errors[err] = true;
      });

      this.signUpFormx.get('rpxEmail').setErrors(errors);
      document.getElementById('user_email').style.border = '1px solid red';
    } else {
      document.getElementById('user_email').style.border = 'unset';
    }

    if (errorList.password) {
      const errors: {[k: string]: any} = {};
      errorList.password.forEach(err => {
        errors[err] = true;
      });

      this.signUpFormx.get('rpxPassword').setErrors(errors);
      document.getElementById('user_pass').style.border = '1px solid red';
    } else {
      document.getElementById('user_pass').style.border = 'unset';
    }

    this.changeDetection.markForCheck();
    this.loading$.next(false);
  }

  signUpError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      return of(error as T);
    };
  }

  logIn() {
    this.logInEvent.emit();
    this.closeWindowX();
  }

  initSignUpForm() {
    const usernameValidators = [Validators.required];
    const passwordValidators = [Validators.required];
    const emailValidators = [Validators.required, Validators.email];

    this.signUpFormx = this.formBuilder.group(
      {
        rpxUsername: ['', usernameValidators],
        rpxEmail: ['', emailValidators],
        rpxPassword: ['', passwordValidators],
      },
      {
        validators: [
          ValidateUsername('rpxUsername'),
          ValidatePassword('rpxPassword'),
        ],
      }
    );
  }

  async openTerms() {
    await AppLauncher.openUrl({url: 'https://rpx.com/terms'});
    return;
  }

  initLoading() {
    this.loading$
      .pipe(filter(loading => loading !== undefined))
      .subscribe(async loading => {
        if (loading) {
          this.loader = await this.loadingCtrl.create({
            message: 'LOADING...',
          });
          this.loader.present();
        } else {
          if (this.loader) {
            this.loader.dismiss();
            this.loader = null;
          }
        }
      });
  }

  private initSignUpCallback(resp: any) {
    console.log('error', resp);

    const signUpInstructions = this.rpxSignUpIssues.nativeElement;

    if (resp.message === 'success') {
      Preferences.set({key: 'rpx_userLogin', value: resp.user.username});
      Preferences.set({key: 'rpx_loggedIn', value: '1'});
      Preferences.set({key: 'rpx_rememberMe', value: '0'});
      Preferences.set({
        key: 'rpx_userType',
        value: resp.rpx_user.user_type,
      });
      Preferences.set({
        key: 'rpxcom_session',
        value: resp.token_info.original.access_token,
      });

      signUpInstructions.innerHTML =
        "<span class='rpx-text-gradient'>Welcome to Rpx!</span>";

      window.location.reload();
    } else {
      signUpInstructions.innerHTML =
        "<span class='rpx-text-gradient rpx-error'>There has been an error signing up.</span>";
      this.populateErrors(resp.error);
    }

    this.loading$.next(false);
    this.signingUp$.next(false);
  }
}
