import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AllowedAccountTypes} from '../../../helpers/enum/account-type.enum';
import {Business} from '../../../models/business';
import {Reward} from '../../../models/reward';
import {BusinessMenuServiceService} from '../../../services/rpx-logged-in/business-menu/business-menu-service.service';
import {RewardCreatorComponent} from './reward-creator/reward-creator.component';
import {RewardComponent} from './reward/reward.component';
import {environment} from '../../../../environments/environment';
import {BehaviorSubject} from 'rxjs';
import {Preferences} from '@capacitor/preferences';
import {LoyaltyTier} from '../../../models/loyalty-point-tier.balance';

@Component({
  selector: 'app-reward-menu',
  templateUrl: './reward-menu.component.html',
  styleUrls: ['./reward-menu.component.css'],
})
export class RewardMenuComponent implements OnInit {
  @ViewChild('rewardCreator') rewardCreator: RewardCreatorComponent;
  @ViewChild('appRewardViewer') appRewardViewer: RewardComponent;

  @Input() rewardAppFullScreen = false;
  @Input() fullScreenMode = true;
  @Input() loyaltyPoints: string;
  @Input() qrCodeLink: string = null;
  @Input() businessTiers: LoyaltyTier[];

  @Output() closeWindowEvt = new EventEmitter();
  @Output() notEnoughLpEvt = new EventEmitter();

  eAllowedAccountTypes = AllowedAccountTypes;
  rewardApp$ = new BehaviorSubject(false);
  userPointToDollarRatio$ = new BehaviorSubject<number>(null);
  rewards$ = new BehaviorSubject<Array<Reward>>(null);
  reward$ = new BehaviorSubject<Reward>(null);
  userType$ = new BehaviorSubject<number>(null);
  business$ = new BehaviorSubject<Business>(null);
  isLoggedIn$ = new BehaviorSubject<string>(null);
  tier$ = new BehaviorSubject<LoyaltyTier>(null);

  constructor(
    private businessMenuService: BusinessMenuServiceService,
    private router: Router,
    route: ActivatedRoute
  ) {
    if (this.router.url.indexOf('business-menu') > -1) {
      this.qrCodeLink = route.snapshot.params.qrCode;
    }
  }

  getWindowClass() {
    if (this.fullScreenMode) {
      return 'rpx-overlay-window';
    } else {
      return '';
    }
  }

  fetchRewards(qrCodeLink: string = null) {
    let fetchRewardsReq = null;

    fetchRewardsReq = {
      qrCodeLink: this.qrCodeLink,
    };

    this.businessMenuService.fetchRewards(fetchRewardsReq).subscribe(resp => {
      this.fetchRewardsCb(resp);
    });
  }

  private async fetchRewardsCb(resp) {
    if (resp.success) {
      this.rewards$.next(resp.rewards);

      this.userPointToDollarRatio$.next(
        resp.loyalty_point_dollar_percent_value as number
      );

      this.business$.next(resp.business);
    }
  }

  closeWindow() {
    this.closeWindowEvt.emit();
  }

  openReward(reward: Reward) {
    reward.link = `${environment.baseUrl}business-menu/${this.qrCodeLink}/${reward.uuid}`;
    this.reward$.next(reward);
    this.tier$.next(
      this.businessTiers.find(
        tier => tier.id === this.reward$.getValue().tier_id
      )
    );
    this.rewardApp$.next(true);
  }

  closeReward() {
    this.reward$.next(null);
    this.rewardApp$.next(false);
  }

  rewardTileStyling(reward: Reward) {
    if (reward.type === 0) {
      return {background: 'url(' + reward.images + ')'};
    } else {
      return {background: 'linear-gradient(90deg,#35a99f,#64e56f)'};
    }
  }

  async ngOnInit() {
    const userRet = await Preferences.get({key: 'rpx_userType'});
    this.userType$.next(parseInt(userRet.value));

    const retUserLoggedIn = await Preferences.get({key: 'rpx_loggedIn'});
    this.isLoggedIn$.next(retUserLoggedIn.value);

    if (this.userType$.getValue() !== this.eAllowedAccountTypes.Personal) {
      this.fetchRewards();
    } else {
      this.fetchRewards(this.qrCodeLink);
    }
  }
}
