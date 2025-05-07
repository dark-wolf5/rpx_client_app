import {Injectable} from '@angular/core';
import * as rpxGlobals from '../../../../globals';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {handleError} from '../../../../helpers/error-helper';
import {catchError} from 'rxjs/operators';
import {Reward} from '../../../../models/reward';
import {Store} from '@ngrx/store';
import {setValue} from '../../../../rpx/rpx-logged-in/loyalty-points/loyalty-points.actions';
import {LoyaltyPointBalance} from '../../../../models/loyalty-point-balance';

const REWARD_API = `${rpxGlobals.API}reward`;

@Injectable({
  providedIn: 'root',
})
export class RewardCreatorService {
  constructor(
    private http: HttpClient,
    private store: Store<{loyaltyPoints}>
  ) {}

  public saveItem(itemObj: Reward): Observable<any> {
    const placeToEatRewardApi = `${REWARD_API}/create`;

    const itemObjToSave = {
      name: itemObj.name,
      description: itemObj.description,
      images: itemObj.images,
      point_cost: itemObj.point_cost,
      type: itemObj.type,
    };

    return this.http
      .post<any>(placeToEatRewardApi, itemObjToSave)
      .pipe(catchError(handleError('completeReset')));
  }

  public updateItem(itemObj: Reward): Observable<any> {
    const placeToEatRewardApi = `${REWARD_API}/update`;

    const itemObjToSave = {
      name: itemObj.name,
      description: itemObj.description,
      images: itemObj.images,
      point_cost: itemObj.point_cost,
      type: itemObj.type,
      id: itemObj.id,
    };

    return this.http
      .post<any>(placeToEatRewardApi, itemObjToSave)
      .pipe(catchError(handleError('completeReset')));
  }

  public deleteMe(itemObj: Reward): Observable<any> {
    const placeToEatRewardApi = `${REWARD_API}/delete`;

    const itemObjToSave = {
      id: itemObj.id,
    };

    return this.http
      .post<any>(placeToEatRewardApi, itemObjToSave)
      .pipe(catchError(handleError('completeReset')));
  }

  public claimReward(businessLoyaltyPointsObj: any, callback: Function): any {
    const apiUrl = `${REWARD_API}/claim`;

    this.http
      .post<any>(apiUrl, businessLoyaltyPointsObj)
      .pipe(catchError(handleError('addLoyaltyPoints')))
      .subscribe(resp => {
        if (resp.success) {
          const loyaltyPointBalance: number = resp.loyalty_points;
          this.store.dispatch(setValue({loyaltyPointBalance}));
        }
        callback(resp);
      });
  }
}
