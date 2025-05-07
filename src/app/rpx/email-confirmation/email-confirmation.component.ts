import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {EmailConfirmationError} from '../../errors/user.errors';
import {logErrorMessage} from '../../helpers/retry.operators';
import {EmailConfirmationService} from './email-confirmation.service';

@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.css'],
})
export class EmailConfirmationComponent implements OnInit {
  emailAddressChange = new EventEmitter();
  providedEmail: string;
  firstName: string;
  emailConfirmationPassed = false;
  affirmEmail = true;
  confirmEmail = false;
  codeCheckTried = false;
  confirmEmailForm: UntypedFormGroup;
  pinForm: UntypedFormGroup;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<EmailConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) private dat,
    private emailConfirmationService: EmailConfirmationService,
    private formBuilder: UntypedFormBuilder,
    private matDialog: MatDialog
  ) {}

  sendCode(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;

    const email = this.providedEmail;
    const firstName = this.firstName;

    this.emailConfirmationService.sendCode(firstName, email).subscribe(
      resp => {
        this.sendCodeCallback(resp);
      },
      error => {
        const sentryContext: any = {
          errorName: 'Email Confirmation Error',
          email,
          confirmationCode: this.confirmationCode,
          errorMessage: 'There was an error confirming your e-mail.',
          error: null,
        };

        sentryContext.error = new EmailConfirmationError(
          sentryContext.errorName
        );

        this.loading = false;

        logErrorMessage(3, error, sentryContext, this.matDialog);
      }
    );
  }

  sendCodeCallback(httpResponse: any) {
    if (httpResponse === undefined) {
      return;
    }

    if (httpResponse.success) {
      if (httpResponse.status === 'confirmation.sent') {
        this.initPinForm();

        this.affirmEmail = false;
        this.confirmEmail = true;
      } else if (httpResponse.status === 'confirmation.verified') {
        this.codeCheckTried = true;
        this.emailConfirmationPassed = true;
        this.affirmEmail = false;
        this.confirmEmail = false;
      }
    } else {
      console.log('sendCodeCallback', httpResponse);
    }

    this.loading = false;
  }

  checkCode(): void {
    this.loading = true;

    this.emailConfirmationService
      .checkCode(this.confirmationCode, this.rpxEmail)
      .subscribe(resp => {
        this.checkCodeCallback(resp);
      });
  }

  checkCodeCallback(httpResponse: any): void {
    this.confirmEmail = false;
    this.codeCheckTried = true;
    this.loading = false;

    if (httpResponse === undefined) {
      return;
    }

    if (httpResponse.success) {
      if (httpResponse.is_valid) {
        this.emailConfirmationPassed = true;

        const parentObj: any = {
          emailConfirmed: this.emailConfirmationPassed,
        };

        setTimeout(
          function () {
            this.dialogRef.close(parentObj);
          }.bind(this, parentObj),
          3000
        );
      } else {
        this.emailConfirmationPassed = false;
      }
    } else {
      this.emailConfirmationPassed = false;
    }
  }

  changeParentEmail(): void {
    this.emailAddressChange.emit(this.rpxEmail);
  }

  get d() {
    return this.confirmEmailForm.controls;
  }

  get rpxEmail() {
    return this.confirmEmailForm.get('rpxEmail').value;
  }

  initEmailForm(): void {
    const emailValidators = [Validators.required];

    this.confirmEmailForm = this.formBuilder.group({
      rpxEmail: ['', emailValidators],
    });

    this.confirmEmailForm.get('rpxEmail').setValue(this.providedEmail);
  }

  get f() {
    return this.pinForm.controls;
  }

  get confirmationCode() {
    return this.pinForm.get('confirmationCode').value;
  }

  initPinForm(): void {
    const codeValidators = [Validators.required];

    this.pinForm = this.formBuilder.group({
      confirmationCode: ['', codeValidators],
    });
  }

  backToFirst(): void {
    this.affirmEmail = true;
    this.confirmEmail = false;
    this.codeCheckTried = false;
  }

  close(): void {
    const parentObj: any = {
      emailConfirmed: this.emailConfirmationPassed,
    };

    this.dialogRef.close(parentObj);
  }

  ngOnInit(): void {
    this.providedEmail = this.dat.email;
    this.firstName = this.dat.firstName;

    this.initEmailForm();
  }
}
