import {Component, OnInit} from '@angular/core';
import {LoyaltyPointBalance} from '../../../../models/loyalty-point-balance';
import {BehaviorSubject} from 'rxjs';
import {LoyaltyPointsService} from '../../../../services/loyalty-points/loyalty-points.service';
import {filter} from 'rxjs/operators';
import {LoadingController} from '@ionic/angular';

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['./balances.component.scss', '../my-list.component.css'],
})
export class BalancesComponent implements OnInit {
  userType: string;

  showBalanceList$ = new BehaviorSubject<boolean>(false);
  balanceList$ = new BehaviorSubject<Array<LoyaltyPointBalance>>([]);
  balanceListPage$ = new BehaviorSubject<number>(1);
  balanceListTotal$ = new BehaviorSubject<number>(0);
  loading$ = new BehaviorSubject<boolean>(false);
  showLoadMore$ = new BehaviorSubject<boolean>(true);
  loader: HTMLIonLoadingElement;

  constructor(
    private loyaltyPointsService: LoyaltyPointsService,
    private loadingCtrl: LoadingController
  ) {
    this.initLoading();
  }

  ngOnInit() {
    this.showBalanceList$.next(true);
    this.getBalanceList();
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

  getBalanceList() {
    this.loading$.next(true);

    const getBalanceListObj = {
      page: this.balanceListPage$.getValue(),
    };

    this.loyaltyPointsService.getBalanceList(getBalanceListObj).subscribe({
      next: resp => {
        const balanceListData: LoyaltyPointBalance[] = resp.balanceList.data;
        this.balanceList$.next([...this.balanceList$.getValue(), ...balanceListData]);
        this.showLoadMore$.next(!(resp.balanceList.current_page === resp.balanceList.last_page));
        this.loading$.next(false);
      },
      error: error => {
        console.log('getBalanceList', error);
      },
    });
  }

  loadMoreItems() {
    this.balanceListPage$.next(this.balanceListPage$.getValue() + 1);
    this.getBalanceList();
  }

  getBalanceListStyle() {
    if (this.showBalanceList$.getValue()) {
      return {'background-color': 'rgb(80 216 120)'};
    }
  }

  showLoadMore() {
    if (this.balanceList$.getValue() && this.balanceListTotal$.getValue() > 0) {
      return true;
    }
  }

  getLpStyle(lpPoints: number) {
    if (lpPoints < 0) {
      return 'sb-text-red-gradient';
    } else {
      return 'sb-text-light-green-gradient';
    }
  }
}
