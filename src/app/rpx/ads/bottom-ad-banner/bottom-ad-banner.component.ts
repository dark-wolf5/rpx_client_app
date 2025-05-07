import {Component, Input, OnDestroy, OnInit, signal} from '@angular/core';
import {AllowedAccountTypes} from '../../../helpers/enum/account-type.enum';
import {InfoObjectType} from '../../../helpers/enum/info-object-type.enum';
import {getDistanceFromLatLngInMiles} from '../../../helpers/measure-units.helper';
import {Ad} from '../../../models/ad';
import {Business} from '../../../models/business';
import {LoyaltyPointsService} from '../../../services/loyalty-points/loyalty-points.service';
import {EVENT_CATEGORIES, FOOD_CATEGORIES, SHOPPING_CATEGORIES,} from '../../map/map_extras/map_extras';
import {AdsService} from '../ads.service';
import {getRandomInt} from '../../../helpers/numbers.helper';
import {BehaviorSubject} from 'rxjs';
import {Preferences} from '@capacitor/preferences';
import {AppLauncher} from '@capacitor/app-launcher';
import {Capacitor} from "@capacitor/core";

const PLACE_TO_EAT_AD_IMAGE =
  'assets/images/def/places-to-eat/footer_banner_in_house.jpg';
const PLACE_TO_EAT_AD_IMAGE_MOBILE =
  'assets/images/def/places-to-eat/featured_banner_in_house.jpg';

const SHOPPING_AD_IMAGE =
  'assets/images/def/shopping/footer_banner_in_house.jpg';
const SHOPPING_AD_IMAGE_MOBILE =
  'assets/images/def/shopping/featured_banner_in_house.jpg';

const EVENTS_AD_IMAGE = 'assets/images/def/events/footer_banner_in_house.jpg';
const EVENTS_AD_IMAGE_MOBILE =
  'assets/images/def/events/featured_banner_in_house.jpg';

const BOTTOM_BANNER_TIMER_INTERVAL = 16000;

@Component({
  selector: 'app-bottom-ad-banner',
  templateUrl: './bottom-ad-banner.component.html',
  styleUrls: ['./bottom-ad-banner.component.css'],
})
export class BottomAdBannerComponent implements OnInit, OnDestroy {
  @Input() lat: number;
  @Input() lng: number;
  @Input() business: Business = new Business();
  @Input() ad: Ad = null;
  @Input() accountType: number = null;
  @Input() categories: number;
  @Input() editMode: boolean = false;
  @Input() eventsClassification: number = null;
  @Input() isMobile: boolean = false;
  @Input() set pauseAdPolling(val : boolean) {
    this.pauseAdPolling$.set(val);
  }
  pauseAdPolling$ = signal(false);

  isDesktop: boolean = false;
  link: string;
  displayAd$ = new BehaviorSubject(false);
  distance: number = 0;
  totalRewards: number = 0;
  categoriesListFriendly: string[] = [];
  communityMemberOpen: boolean = false;
  currentCategoryList: Array<string> = [];
  categoryListForUi: string = null;
  loyaltyPointBalance: any;
  genericAdImage: string = PLACE_TO_EAT_AD_IMAGE;
  genericAdImageMobile: string = PLACE_TO_EAT_AD_IMAGE_MOBILE;
  switchAdInterval: any = false;

  constructor(
    private adsService: AdsService,
    private loyaltyPointsService: LoyaltyPointsService
  ) {
    this.loyaltyPointsService.userLoyaltyPoints$.subscribe(
      loyaltyPointBalance => {
        this.loyaltyPointBalance = loyaltyPointBalance;
      }
    );
  }

  async getBottomHeader() {
    let adId = null;
    let accountType;

    // Stop the service if there's a window on top of the ad component.
    const needleElement = document.getElementsByClassName('sb-closeButton');

    if (needleElement.length > 1) {
      // There's a component on top of the bottom header.
      // I know this a rudimentary way for doing this but yeah.
      return;
    }

    if (this.editMode) {
      if (!this.ad) {
        this.ad = new Ad();
        this.ad.id = 2;
        adId = this.ad.id;
      } else {
        adId = this.ad.id;
      }

      const retAccType = await Preferences.get({key: 'rpx_userType'});
      const accType = retAccType.value;

      accountType = parseInt(accType, 10);

      switch (accountType) {
        case 1:
          this.genericAdImage = PLACE_TO_EAT_AD_IMAGE;
          this.genericAdImageMobile = PLACE_TO_EAT_AD_IMAGE_MOBILE;
          break;
        case 2:
          this.genericAdImage = SHOPPING_AD_IMAGE;
          this.genericAdImageMobile = SHOPPING_AD_IMAGE_MOBILE;
          break;
        case 3:
          this.genericAdImage = EVENTS_AD_IMAGE;
          this.genericAdImageMobile = EVENTS_AD_IMAGE_MOBILE;
          this.categories = this.eventsClassification;
          break;
      }
    } else {
      accountType = this.accountType ? this.accountType : getRandomInt(1, 3);

      switch (accountType) {
        case 'food':
          accountType = 1;
          this.genericAdImage = PLACE_TO_EAT_AD_IMAGE;
          this.genericAdImageMobile = PLACE_TO_EAT_AD_IMAGE_MOBILE;
          break;
        case 'shopping':
          accountType = 2;
          this.genericAdImage = SHOPPING_AD_IMAGE;
          this.genericAdImageMobile = SHOPPING_AD_IMAGE_MOBILE;
          break;
        case 'events':
          accountType = 3;
          this.genericAdImage = EVENTS_AD_IMAGE;
          this.genericAdImageMobile = EVENTS_AD_IMAGE_MOBILE;
          this.categories = this.eventsClassification;
          break;
      }
    }

    const searchObjSb = {
      loc_x: this.lat,
      loc_y: this.lng,
      categories: this.categories,
      id: adId,
      account_type: accountType,
    };

    // Retrieve the Rpx Ads
    this.adsService.getBottomHeader(searchObjSb).subscribe(resp => {
      this.getBottomHeaderCb(resp);
    });
  }

  getAdStyle() {
    if (this.editMode) {
      return {
        position: 'relative',
        margin: '0 auto',
        right: '0',
      };
    }
  }

  getAdWrapperClass() {
    if (!this.isMobile) return 'rpx-ad-wrapper-header';
    if (this.isMobile) return 'rpx-ad-wrapper-header sb-mobileAdWrapper';
  }

  async getBottomHeaderCb(resp: any) {
    if (resp.success) {
      this.ad = resp.ad;
      this.business = resp.business;

      if (!this.editMode && resp.business !== null) {
        switch (this.business.user_type) {
          case AllowedAccountTypes.PlaceToEat:
            this.currentCategoryList = FOOD_CATEGORIES;
            break;
          case AllowedAccountTypes.Events:
            this.currentCategoryList = EVENT_CATEGORIES;
            break;
          case AllowedAccountTypes.Shopping:
            this.currentCategoryList = SHOPPING_CATEGORIES;
            break;
        }

        this.categoriesListFriendly = [];
        this.currentCategoryList.reduce(
          (
            previousValue: string,
            currentValue: string,
            currentIndex: number,
            array: string[]
          ) => {
            if (resp.business.categories.indexOf(currentIndex) > -1)
              this.categoriesListFriendly.push(
                this.currentCategoryList[currentIndex]
              );
            return currentValue;
          }
        );

        this.business.is_community_member = true;
        this.business.type_of_info_object = InfoObjectType.RpxCommunity;

        if (!this.editMode)
          this.distance = getDistanceFromLatLngInMiles(
            this.business.loc_x,
            this.business.loc_y,
            this.lat,
            this.lng
          );
        else this.distance = 5;
      }

      this.totalRewards = resp.totalRewards;
      this.displayAd$.next(true);
    } else {
      console.log('getBottomBannerAdCallback', resp);
    }

    if (!this.switchAdInterval) {
      this.switchAdInterval = setInterval(() => {
        if (!this.editMode) this.getBottomHeader();
      }, BOTTOM_BANNER_TIMER_INTERVAL);
    }
  }

  rpxAdWrapperStyles() {
    if (this.editMode) return {'margin-top': '45px'};
  }

  openAd(): void {
    if (this.business) {
      this.communityMemberOpen = true;
    } else {
      AppLauncher.openUrl({url: 'https://rpx.com/business'});
    }
    // this.router.navigate([`/business-menu/${this.business.qr_code_link}`])
  }

  closeRewardMenu() {
    this.communityMemberOpen = false;
  }

  switchAd() {
    this.categoriesListFriendly = [];
    this.categoryListForUi = null;
    this.getBottomHeader();
  }

  clickGoToSponsored() {
    AppLauncher.openUrl({url: 'https://rpx.com/business'});
  }

  updateAdImage(image = '') {
    if (image) {
      this.ad.images = image;
      this.genericAdImage = image;
    }
  }

  updateAdImageMobile(image: string) {
    if (image) {
      this.ad.images_mobile = image;
      this.genericAdImageMobile = image;
    }
  }

  ngOnInit(): void {
    this.isDesktop = !Capacitor.isNativePlatform();
    this.isMobile = Capacitor.isNativePlatform();
    // *TODO**
    // Add this.isTablet -- to display more ads in tablets that have the real estate;

    this.getBottomHeader();
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    clearInterval(this.switchAdInterval);
    this.switchAdInterval = false;
  }
}
