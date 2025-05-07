import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AdsService} from '../ads.service';
import {Business} from '../../../models/business';
import {getDistanceFromLatLngInMiles} from '../../../helpers/measure-units.helper';
import {Ad} from '../../../models/ad';
import {
  FOOD_CATEGORIES,
  SHOPPING_CATEGORIES,
  EVENT_CATEGORIES,
} from '../../map/map_extras/map_extras';
import {AllowedAccountTypes} from '../../../helpers/enum/account-type.enum';
import {InfoObjectType} from '../../../helpers/enum/info-object-type.enum';
import {LoyaltyPointBalance} from '../../../models/loyalty-point-balance';
import {AppLauncher} from '@capacitor/app-launcher';
import {BehaviorSubject} from 'rxjs';
import {Preferences} from '@capacitor/preferences';
import {Capacitor} from "@capacitor/core";

const PLACE_TO_EAT_AD_IMAGE =
  'assets/images/def/places-to-eat/header_banner_in_house.jpg';
const PLACE_TO_EAT_AD_IMAGE_MOBILE =
  'assets/images/def/places-to-eat/featured_banner_in_house.jpg';
const SHOPPING_AD_IMAGE =
  'assets/images/def/shopping/header_banner_in_house.jpg';
const SHOPPING_AD_IMAGE_MOBILE =
  'assets/images/def/shopping/featured_banner_in_house.jpg';
const EVENTS_AD_IMAGE = 'assets/images/def/events/header_banner_in_house.jpg';
const EVENTS_AD_IMAGE_MOBILE =
  'assets/images/def/events/featured_banner_in_house.jpg';
const HEADER_TIMER_INTERVAL = 16000;

@Component({
  selector: 'app-header-ad-banner',
  templateUrl: './header-ad-banner.component.html',
  styleUrls: ['./header-ad-banner.component.css'],
})
export class HeaderAdBannerComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() lat: number;
  @Input() lng: number;
  @Input() business: Business = new Business();
  @Input() ad: Ad = null;
  @Input() accountType: number = null;
  @Input() categories: number;
  @Input() editMode = false;
  @Input() eventsClassification: number = null;
  @Input() isMobile = false;

  isDesktop = false;
  link: string;
  displayAd$ = new BehaviorSubject(false);
  distance = 0;
  totalRewards = 0;
  categoriesListFriendly: string[] = [];
  communityMemberOpen = false;
  currentCategoryList: Array<string> = [];
  categoryListForUi: string = null;
  loyaltyPointBalance: LoyaltyPointBalance;
  genericAdImage: string = PLACE_TO_EAT_AD_IMAGE;
  genericAdImageMobile: string = PLACE_TO_EAT_AD_IMAGE_MOBILE;
  switchAdInterval: any = false;

  constructor(
    private adsService: AdsService,
  ) {}

  async getHeaderBanner() {
    let adId = null;
    let accountType;

    // Stop the service if there's a window on top of the ad component.
    const needleElement = document.getElementsByClassName('sb-closeButton');

    if (needleElement.length > 0) {
      // There's a componenet on top of the bottom header.
      return; // debounce this request
    }

    switch (this.accountType) {
      case 1:
        accountType = 1;
        this.genericAdImage = PLACE_TO_EAT_AD_IMAGE;
        this.genericAdImageMobile = PLACE_TO_EAT_AD_IMAGE_MOBILE;
        break;
      case 2:
        accountType = 2;
        this.genericAdImage = SHOPPING_AD_IMAGE;
        this.genericAdImageMobile = SHOPPING_AD_IMAGE_MOBILE;
        break;
      case 3:
        accountType = 3;
        this.genericAdImage = EVENTS_AD_IMAGE;
        this.genericAdImageMobile = EVENTS_AD_IMAGE_MOBILE;
        this.categories = this.eventsClassification;
        break;
    }

    const headerBannerReqObj = {
      loc_x: this.lat,
      loc_y: this.lng,
      categories: this.categories,
      id: adId,
      account_type: accountType,
    };

    // Retrieve the Rpx Ads
    this.adsService.getHeaderBanner(headerBannerReqObj).subscribe(resp => {
      this.getHeaderBannerAdCallback(resp);
    });
  }

  async getHeaderBannerAdCallback(resp: any) {
    if (resp.success) {
      this.ad = resp.ad;
      this.business = resp.business;

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
          if (resp.business.categories.indexOf(currentIndex) > -1) {
            this.categoriesListFriendly.push(
              this.currentCategoryList[currentIndex]
            );
          }

          return currentValue;
        }
      );

      this.business.is_community_member = true;
      this.business.type_of_info_object = InfoObjectType.RpxCommunity;

      this.distance = getDistanceFromLatLngInMiles(
        this.business.loc_x,
        this.business.loc_y,
        this.lat,
        this.lng
      );

      this.displayAd$.next(true);
      this.totalRewards = resp.totalRewards;
    } else {
      console.log('getHeaderBannerAdCallback', resp);
    }

    if (!this.switchAdInterval) {
      this.switchAdInterval = setInterval(() => {
        if (!this.editMode) {
          this.getHeaderBanner();
        }
      }, HEADER_TIMER_INTERVAL);
    }
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

  closeRewardMenu() {
    this.communityMemberOpen = false;
  }

  async openAd() {
    if (this.business) {
      this.communityMemberOpen = true;
    } else {
      await AppLauncher.openUrl({url: 'https://rpx.com/business'});
    }
    return;
  }

  getAdWrapperClass() {
    if (!this.isMobile) {
      return 'rpx-ad-wrapper-header';
    }
    if (this.isMobile) {
      return 'rpx-ad-wrapper-header sb-mobileAdWrapper';
    }
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.isMobile = Capacitor.isNativePlatform();
    this.getHeaderBanner();
  }

  ngOnDestroy(): void {
    clearInterval(this.switchAdInterval);
    this.switchAdInterval = false;
  }
}
