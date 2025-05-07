import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UserauthService} from "../../../services/userauth.service";
import {LoyaltyPointsService} from "../../../services/loyalty-points/loyalty-points.service";
import {Router} from "@angular/router";
import {MenuController} from "@ionic/angular";
import {logOutCallback} from "../../../helpers/logout-callback";
import {Preferences} from "@capacitor/preferences";
import {AllowedAccountTypes} from "../../../helpers/enum/account-type.enum";
import {Capacitor} from "@capacitor/core";

@Component({
  selector: 'app-menu-logged-in-bar',
  templateUrl: './menu-logged-in-bar.component.html',
  styleUrls: [
    './menu-logged-in-bar.component.scss',
    '../menu-logged-in.component.scss'
  ],
})
export class MenuLoggedInBarComponent  implements OnInit {

  @Output('spawnCategoriesEvt') spawnCategoriesEvt = new EventEmitter<{category: number}>();
  @Output('goToLpEvt') goToLpEvt = new EventEmitter();
  @Output('goToQrCodeEvt') goToQrCodeEvt = new EventEmitter();
  @Output('closeMapEvt') closeMapEvt = new EventEmitter();

  isMobile: boolean;
  isDesktop: boolean;
  isTablet: boolean;
  userType: number;
  userLoyaltyPoints$ = this.loyaltyPointsService.userLoyaltyPoints$;
  userName: string = null;
  business = false;

  constructor(
    private userAuthService: UserauthService,
    private loyaltyPointsService: LoyaltyPointsService,
    private router: Router,
    private menuCtrl: MenuController
  ) {
    this.isMobile = Capacitor.isNativePlatform();
    this.isDesktop = !Capacitor.isNativePlatform();
    this.isTablet = Capacitor.isNativePlatform();

    this.init();
  }

  ngOnInit() {}

  async init() {
    const retAccType = await Preferences.get({key: 'rpx_userType'});

    this.userType = parseInt(retAccType.value);

    if (this.userType === AllowedAccountTypes.Personal) {
      this.business = false;
    } else {
      this.business = true;
    }

    const retAccLogin = await Preferences.get({key: 'rpx_userLogin'});
    this.userName = retAccLogin.value;

    this.getLoyaltyPointBalance();
  }

  spawnCategories(category: number): void {
    this.menuCtrl.close('logged-in-menu');
    this.spawnCategoriesEvt.emit({category});
  }

  meetUp() {
    this.router.navigate(['/meet-ups']);
  }

  openMyFriends() {
    this.router.navigate(['/my-friends']);
  }

  toggleLoyaltyPoints() {
    this.goToLpEvt.emit();
  }

  toggleQRScanner() {
    this.goToQrCodeEvt.emit();
  }

  closeMap() {
    this.closeMapEvt.emit();
  }

  home() {
    window.location.assign('/user-home');
  }

  async getLoyaltyPointBalance() {
    await this.loyaltyPointsService.getLoyaltyPointBalance();
  }

  openSettings() {
    this.menuCtrl.close('logged-in-menu');
    this.router.navigate(['/settings']);
  }

  logOut(): void {
    this.userAuthService.logOut().subscribe(resp => {
      logOutCallback(resp);
    });
  }
}
