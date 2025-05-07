import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Redeemable} from '../../../../models/redeemable';
import {LoyaltyPointsService} from '../../../../services/loyalty-points/loyalty-points.service';
import {LoadingController, ModalController} from '@ionic/angular';
import {filter} from 'rxjs/operators';
import {FeedbackComponent} from '../feedback/feedback.component';

@Component({
  selector: 'app-redeemed',
  templateUrl: './redeemed.component.html',
  styleUrls: ['./redeemed.component.scss', '../my-list.component.css'],
})
export class RedeemedComponent implements OnInit {
  lpRedeemed$ = new BehaviorSubject<boolean>(false);
  lpRedeemedList$ = new BehaviorSubject<Array<Redeemable>>([]);
  lpRedeemedPage$ = new BehaviorSubject<number>(1);
  lpRedeemedTotal$ = new BehaviorSubject<number>(0);
  loadMore$ = new BehaviorSubject<boolean>(false);
  loading$ = new BehaviorSubject<boolean>(false);
  loader: HTMLIonLoadingElement;

  constructor(
    private loyaltyPointsService: LoyaltyPointsService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController
  ) {
    this.initLoading();
  }

  ngOnInit() {
    this.lpRedeemed$.next(true);
    this.getRedeemed();
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

  getRedeemed() {
    this.loading$.next(true);

    const getRedeemedObj = {
      page: this.lpRedeemedPage$.getValue(),
    };

    this.loyaltyPointsService.getRedeemed(getRedeemedObj).subscribe({
      next: resp => {
        const redeemItemData: Redeemable[] = resp.redeemedList.data;

        this.lpRedeemedTotal$.next(redeemItemData.length);
        this.lpRedeemedPage$.next(resp.redeemedList.current_page);

        const lastPage = resp.redeemedList.last_page;

        if (this.lpRedeemedPage$.getValue() === lastPage) {
          this.loadMore$.next(false);
        } else {
          this.loadMore$.next(true);
        }

        redeemItemData.forEach((redeemItem: Redeemable) => {
          this.lpRedeemedList$.next([
            ...this.lpRedeemedList$.getValue(),
            redeemItem,
          ]);
        });

        this.loading$.next(false);
      },
      error: error => {
        console.log('getRedeemed', error);
      },
    });
  }

  loadMoreItems() {
    if (this.lpRedeemed$.getValue()) {
      this.lpRedeemedPage$.next(this.lpRedeemedPage$.getValue() + 1);
      this.getRedeemed();
    }
  }

  showLoadMore() {
    if (this.lpRedeemed$.getValue() && this.lpRedeemedTotal$.getValue() > 0) {
      return true;
    }
  }

  identify(index, item: Redeemable) {
    return item.uuid;
  }

  async leaveFeedback(redeemedItem: Redeemable) {
    const modal = await this.modalCtrl.create({
      component: FeedbackComponent,
      componentProps: {
        feedback: redeemedItem?.feedback,
        ledgerId: redeemedItem?.loyalty_point_ledger?.id,
        businessName: redeemedItem.business.name,
      },
    });
    modal.present();

    const {data, role} = await modal.onWillDismiss();

    if (role === 'feedback_sent' || role === 'feedback_updated') {
      // Need to update the redeemableItem
      const newList = this.lpRedeemedList$
        .getValue()
        .filter(item => item.uuid !== redeemedItem.uuid);

      if (role === 'feedback_sent') {
        redeemedItem.feedback = data.feedback;
      } else {
        redeemedItem.feedback.feedback_text = data.feedback.feedback_text;
      }

      this.lpRedeemedList$.next([redeemedItem, ...newList]);
    }
  }
}
