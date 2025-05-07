import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {Router} from '@angular/router';
import {LoyaltyPointsService} from '../../../services/loyalty-points/loyalty-points.service';
import {tap} from 'rxjs/operators';
import {Preferences} from '@capacitor/preferences';

@Component({
  selector: 'app-loyalty-points',
  templateUrl: './loyalty-points.component.html',
  styleUrls: ['./loyalty-points.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoyaltyPointsComponent {
  @Output() closeWindow = new EventEmitter();
  @Output() openRedeemed = new EventEmitter();

  @Input() fullScreenWindow = true;

  @ViewChild('newBalanceLoyaltyPoints') newBalanceLoyaltyPoints;
  @ViewChild('businessLoyaltyPointsInfo') businessLoyaltyPointsInfo;

  userType: number = null;
  loyaltyPointBalance$ = this.loyaltyPointsService.userLoyaltyPoints$;

  constructor(
    private loyaltyPointsService: LoyaltyPointsService,
    private router: Router
  ) {
    this.init();
  }

  async init() {
    const retUserType = await Preferences.get({key: 'rpx_userType'});
    this.userType = parseInt(retUserType.value);
  }

  closeThis() {
    if (this.router.url.indexOf('scan') > -1) {
      this.router.navigate(['/user-home']);
    } else {
      this.closeWindow.emit();
    }
  }
}
