import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AllowedAccountTypes} from '../../../helpers/enum/account-type.enum';
import {InfoObjectType} from '../../../helpers/enum/info-object-type.enum';
import {getDistanceFromLatLngInMiles} from '../../../helpers/measure-units.helper';
import {Ad} from '../../../models/ad';
import {Business} from '../../../models/business';
import {LoyaltyPointBalance} from '../../../models/loyalty-point-balance';
import {
  EVENT_CATEGORIES,
  FOOD_CATEGORIES,
  SHOPPING_CATEGORIES,
} from '../../map/map_extras/map_extras';
import {AdsService} from '../ads.service';
import {AppLauncher} from '@capacitor/app-launcher';
import {Preferences} from '@capacitor/preferences';
import {BehaviorSubject} from "rxjs";
import {Capacitor} from "@capacitor/core";

const PLACE_TO_EAT_AD_IMAGE =
  'assets/images/def/places-to-eat/featured_banner_in_house.jpg';
const SHOPPING_AD_IMAGE =
  'assets/images/def/shopping/featured_banner_in_house.jpg';
const EVENTS_AD_IMAGE = 'assets/images/def/events/featured_banner_in_house.jpg';

const FEATURED_BANNER_TIMER_INTERVAL = 16000;

@Component({
  selector: 'app-nearby-featured-ad',
  templateUrl: './nearby-featured-ad.component.html',
  styleUrls: ['./nearby-featured-ad.component.css'],
})
export class NearbyFeaturedAdComponent implements OnInit, OnDestroy {
  @Input() lat: number;
  @Input() lng: number;
  @Input() business: Business = new Business();
  @Input() ad: Ad = null;
  @Input() accountType: number = null;
  @Input() editMode = false;
  @Input() categories: number;
  @Input() eventsClassification: number = null;

  link: string;
  displayAd$ = new BehaviorSubject( false);
  distance = 0;
  totalRewards = 0;
  categoriesListFriendly: string[] = [];
  communityMemberOpen = false;
  isMobile = false;
  currentCategoryList: Array<string> = [];
  rewardMenuOpen$ = new BehaviorSubject(false);
  loyaltyPointBalance: LoyaltyPointBalance;
  adTypeWithId = false;
  genericAdImage: string = PLACE_TO_EAT_AD_IMAGE;
  businessReady = false;
  switchAdInterval: any = false;

  constructor(
    private adsService: AdsService,
  ) {}

  ngOnInit(): void {
    this.isMobile = Capacitor.isNativePlatform();
    this.getNearByFeatured();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    clearInterval(this.switchAdInterval);
    this.switchAdInterval = false;
  }

  async getNearByFeatured() {
    let adId = null;
    let accountType;

    //Stop the service if there's a window on top of the ad component.
    const needleElement = document.getElementsByClassName('sb-closeButton');

    if (needleElement.length > 1) {
      //There's a component aside from the infoObjectWindow
      return; //bounce this request
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
      accountType = retAccType.value;

      switch (accountType) {
        case '1':
          this.genericAdImage = PLACE_TO_EAT_AD_IMAGE;
          break;
        case '2':
          this.genericAdImage = SHOPPING_AD_IMAGE;
          break;
        case '3':
          this.genericAdImage = EVENTS_AD_IMAGE;
          this.categories = this.eventsClassification;
          break;
      }
    } else {
      accountType = this.accountType;

      switch (this.accountType) {
        case 1:
          this.genericAdImage = PLACE_TO_EAT_AD_IMAGE;
          break;
        case 2:
          this.genericAdImage = SHOPPING_AD_IMAGE;
          break;
        case 3:
          this.genericAdImage = EVENTS_AD_IMAGE;
          this.categories = this.eventsClassification;
          break;
      }
    }

    const nearByFeaturedObj = {
      loc_x: this.lat,
      loc_y: this.lng,
      categories: this.categories,
      id: adId,
      account_type: accountType,
    };

    this.adsService.getNearByFeatured(nearByFeaturedObj).subscribe(resp => {
      this.getNearByFeaturedCallback(resp);
    });
  }

  async getNearByFeaturedCallback(resp: any) {
    if (resp.success) {
      this.ad = resp.ad;
      this.business = resp.business;

      this.businessReady = true;

      if (!this.editMode && this.business) {
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

        this.business.is_community_member = true;
        this.business.type_of_info_object = InfoObjectType.RpxCommunity;

        this.totalRewards = resp.totalRewards;

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

        this.distance = getDistanceFromLatLngInMiles(
          this.business.loc_x,
          this.business.loc_y,
          this.lat,
          this.lng
        );
      } else {
        this.distance = 5;
      }

      this.displayAd$.next(true);

      if (!this.switchAdInterval) {
        this.switchAdInterval = setInterval(() => {
          if (!this.editMode) {
            this.getNearByFeatured();
          }
        }, FEATURED_BANNER_TIMER_INTERVAL);
      }
    } else {
      console.log('getNearByFeaturedCallback', resp);
    }
  }

  getAdStyle() {
    if (this.adTypeWithId) {
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

  clickGoToSponsored() {
    AppLauncher.openUrl({url: 'https://rpx.com/business'});
  }

  updateAdImage(image = '') {
    if (image !== '') {
      this.ad.images = image;
      this.genericAdImage = image;
    }
  }


  switchAd() {
    this.getNearByFeatured();
  }

  openAd(): void {
    this.rewardMenuOpen$.next(true);
    // this.router.navigate([`/business-menu/${this.business.qr_code_link}`])
  }
}
