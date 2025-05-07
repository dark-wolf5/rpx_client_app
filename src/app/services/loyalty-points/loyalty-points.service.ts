import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {handleError} from '../../helpers/error-helper';
import {Store} from '@ngrx/store';
import {setValue} from '../../rpx/rpx-logged-in/loyalty-points/loyalty-points.actions';
import {LoyaltyPointBalance} from '../../models/loyalty-point-balance';
import * as rpxGlobals from '../../globals';
import {LoyaltyTier} from '../../models/loyalty-point-tier.balance';

const LOYATLY_POINTS_API = rpxGlobals.API + 'loyalty-points';
const REDEEMABLE_API = rpxGlobals.API + 'redeemable';
const FEEDBACK_API = rpxGlobals.API + 'feedback';

@Injectable({
  providedIn: 'root',
})
export class LoyaltyPointsService {
  userLoyaltyPoints$: Observable<number> = this.store.select('loyaltyPoints');
  loyaltyPointBalance: LoyaltyPointBalance;

  constructor(
    private http: HttpClient,
    private store: Store<{loyaltyPoints}>
  ) {}

  getLedger(request: any): Observable<any> {
    const apiUrl = `${REDEEMABLE_API}/ledger?page=${request.page}`;

    return this.http
      .get<any>(apiUrl, request)
      .pipe(catchError(handleError('getLedger')));
  }

  getBalanceList(request: any): Observable<any> {
    const apiUrl = `${REDEEMABLE_API}/balance-list?page=${request.page}`;

    return this.http
      .get<any>(apiUrl, request)
      .pipe(catchError(handleError('getBalanceList')));
  }

  getRedeemed(request: any): Observable<any> {
    const apiUrl = `${REDEEMABLE_API}/lp-redeemed?page=${request.page}`;

    return this.http.get<any>(apiUrl, request).pipe(
      catchError(handleError('getRedeemed')),
      tap(r => console.log('GET REDEEMED', r))
    );
  }

  getRewards(request: any): Observable<any> {
    const apiUrl = `${REDEEMABLE_API}/index?page=${request.page}`;

    return this.http
      .get<any>(apiUrl, request)
      .pipe(catchError(handleError('getRewards')));
  }

  getLoyaltyPointBalance(): any {
    const apiUrl = `${LOYATLY_POINTS_API}/show`;

    this.http
      .post<any>(apiUrl, null)
      .pipe(catchError(handleError('getLoyaltyPointBalance')))
      .subscribe(resp => {
        if (resp.success) {
          const loyaltyPointBalance = resp.loyalty_points;
          this.store.dispatch(setValue({loyaltyPointBalance}));
        }
      });
  }

  saveLoyaltyPoint(businessLoyaltyPointsObj: any): Observable<any> {
    const apiUrl = `${LOYATLY_POINTS_API}/store`;

    return this.http
      .post<any>(apiUrl, businessLoyaltyPointsObj)
      .pipe(catchError(handleError('saveLoyaltyPoint')));
  }

  addLoyaltyPoints(businessLoyaltyPointsObj: any): Observable<any> {
    const apiUrl = `${REDEEMABLE_API}/redeem`;

    return this.http
      .post<any>(apiUrl, businessLoyaltyPointsObj)
      .pipe(catchError(handleError('saveLoyaltyPoint')));
  }

  saveFeedback(feedbackText: string, ledgerRecordId: string) {
    const apiUrl = `${FEEDBACK_API}/store`;

    return this.http
      .post<any>(apiUrl, {
        feedback_text: feedbackText,
        ledger_id: ledgerRecordId,
      })
      .pipe(catchError(handleError('saveFeedbackService')));
  }

  updateFeedback(feedbackText: string, feedbackId: string) {
    const apiUrl = `${FEEDBACK_API}/update/${feedbackId}`;

    return this.http
      .patch<any>(apiUrl, {feedback_text: feedbackText})
      .pipe(catchError(handleError('updateFeedback')));
  }
}
