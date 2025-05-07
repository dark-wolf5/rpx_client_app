import {Observable, of, throwError} from 'rxjs';
import {delay, mergeMap, retryWhen} from 'rxjs/operators';
// import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {ErrorHandlerComponent} from './error-handler/error-handler.component';

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BACKOFF = 1000;

export function logErrorMessage(
  maxRetry: number,
  serverResponse,
  context: any = null,
  matDialog = null
) {
  context.requestRetries = maxRetry;
  context.serverResponse = serverResponse;

  const sentryException = context.error;

  delete context.error;

  /*Sentry.withScope((scope) => {

		let i = 0

		Object.keys(context).forEach( contextKey => {
			scope.setExtra(contextKey, Object.values(context)[i])
			i++
		});

		Sentry.captureException(sentryException)

	});


	Sentry.setContext("Error Context", context)*/

  /*	if(matDialog !== null){

		const dialogConfig = new MatDialogConfig();

		dialogConfig.autoFocus = true;
		dialogConfig.panelClass = 'errorHandlerInfoPanel';

		let errorMessage;

		if(serverResponse.error != null && serverResponse.error.errors !== undefined)
			{errorMessage = Object.values(serverResponse.error.errors)[0];}
		else
			{errorMessage = context.errorMessage;}

		dialogConfig.data = {
			errorMessage
		};

		const dialogRef = matDialog.open(
		  ErrorHandlerComponent,
		  dialogConfig
		);
	}*/
}

export function retryWithBackOff(
  delayMs: number,
  maxRetry = DEFAULT_MAX_RETRIES,
  backOffMs = DEFAULT_BACKOFF
) {
  let retries = maxRetry;
  return (src: Observable<any>) =>
    src.pipe(
      retryWhen((err: Observable<any>) =>
        err.pipe(
          mergeMap(error => {
            if (retries-- > 0) {
              const backOffTime = delayMs + (maxRetry - retries) * backOffMs;
              return of(error).pipe(delay(backOffTime));
            }
            return throwError(error);
          })
        )
      )
    );
}
