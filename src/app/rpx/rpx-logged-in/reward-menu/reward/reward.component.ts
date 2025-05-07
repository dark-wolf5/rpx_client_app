import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {Reward} from '../../../../models/reward';
import {Preferences} from '@capacitor/preferences';
import {LoyaltyTier} from '../../../../models/loyalty-point-tier.balance';
import {Business} from '../../../../models/business';

@Component({
  selector: 'app-reward',
  templateUrl: './reward.component.html',
  styleUrls: ['./reward.component.css'],
})
export class RewardComponent implements OnInit, AfterViewInit {
  @Output() closeWindowEvt = new EventEmitter();

  @Input() fullScreenMode = true;
  @Input() reward: Reward;
  @Input() userPointToDollarRatio: number;
  @Input() tier: LoyaltyTier;
  @Input() business: Business;

  loading = false;
  successful_url_copy = false;
  isLoggedIn: string;

  constructor() {}

  async ngAfterViewInit() {
    const isLoggedInRet = await Preferences.get({key: 'rpx_loggedIn'});
    this.isLoggedIn = isLoggedInRet.value;

    // I'm sure there's a better way to do this but I don't have time right now.
    const closeButton = document.getElementById('sb-closeButtonReward');

    const p =
      this.isLoggedIn === '0' || !this.isLoggedIn
        ? document.getElementById('ionToolbarLoggedOut').offsetHeight
        : document.getElementById('ionToolbarLoggedIn').offsetHeight;

    closeButton.style.top = p + 'px';
  }

  ngOnInit() {}

  getFullScreenModeClass() {
    if (this.fullScreenMode) {
      return 'fullScreenMode';
    } else {
      return '';
    }
  }

  closeThis() {
    this.closeWindowEvt.emit();
  }

  linkCopy(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, inputElement.value.length);
    this.successful_url_copy = true;

    setTimeout(() => {
      this.successful_url_copy = false;
    }, 2500);
  }
}
