import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, signal,} from '@angular/core';
import {InfoObjectServiceService} from './info-object-service.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DateFormatPipe, TimeFormatPipe} from '../../../pipes/date-format.pipe';
import {RpxMetaService} from '../../../services/meta/rpx-meta.service';
import {setYelpRatingImage} from '../../../helpers/info-object-helper';
import {rpxMetaDescription, rpxMetaImage, rpxMetaTitle,} from '../../../constants/rpx';
import {InfoObject} from '../../../models/info-object';
import {environment} from '../../../../environments/environment';
import {Ad} from '../../../models/ad';
import {InfoObjectType} from '../../../helpers/enum/info-object-type.enum';
import {BehaviorSubject} from 'rxjs';
import {AppLauncher} from '@capacitor/app-launcher';
import {Share} from '@capacitor/share';
import {LoyaltyTier} from '../../../models/loyalty-point-tier.balance';
import {Capacitor} from "@capacitor/core";
import {ModalController, ToastController} from "@ionic/angular";
import {MeetUpWizardComponent} from "../../rpx-logged-in/my-meet-ups/meet-up-wizard/meet-up-wizard.component";
import {UserauthService} from "../../../services/userauth.service";

const YELP_BUSINESS_DETAILS_API = 'https://api.yelp.com/v3/businesses/';

const RPX_META_DESCRIPTION = rpxMetaDescription;
const RPX_META_TITLE = rpxMetaTitle;
const RPX_META_IMAGE = rpxMetaImage;

@Component({
  selector: 'app-info-object',
  templateUrl: './info-object.component.html',
  styleUrls: ['./info-object.component.css'],
})
export class InfoObjectComponent implements OnInit, AfterViewInit {
  @Input() set info_object(infoObject: InfoObject) {
    this.accountType = infoObject.user_type;
    if (infoObject?.business?.photo) {
      infoObject.photo = infoObject.business.photo;
    }
    this.infoObject$.next(infoObject);
  }
  @Input() ad: Ad;
  @Input() fullScreenMode: boolean = false;
  @Input() lat: number = null;
  @Input() lng: number = null;
  @Input() accountType: string | number;
  @Input() eventsClassification: number = null;
  @Input() categories: number;
  @Input() loyaltyTiers: LoyaltyTier[];

  @Output() closeWindow = new EventEmitter();
  @Output() removeFavoriteEvent = new EventEmitter();

  loading$ = new BehaviorSubject(false);
  rewardMenuUp$ = new BehaviorSubject(false);
  urlApi: string;
  infoObject$: BehaviorSubject<InfoObject> | null =
    new BehaviorSubject<InfoObject>(null);
  infoObjectImageUrl: string;
  private infoObjectCategory: number;
  infoObjectLink: string;
  infoObjectDescription: string;
  infoObjectTitle: string;
  objectCategories: string = '';
  objectDisplayAddress: string;
  eInfoObjectType: any = InfoObjectType;

  isLoggedIn$ = signal(false);

  constructor(
    private infoObjectService: InfoObjectServiceService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private rpxMetaService: RpxMetaService,
    private toastSvc: ToastController,
    private modalCtrl: ModalController,
    private userAuthService: UserauthService,
  ) {}

  getFullScreenModeClass() {
    return this.fullScreenMode ? 'fullScreenMode' : '';
  }

  closeWindowX(): void {
    if (
      this.router.url.indexOf('event') > -1 ||
      this.router.url.indexOf('place-to-eat') > -1 ||
      this.router.url.indexOf('shopping') > -1 ||
      this.router.url.indexOf('community') > -1
    ) {
      this.router.navigate(['/home']);
    } else {
      this.closeWindow.emit(null);
      this.rpxMetaService.setTitle(RPX_META_TITLE);
      this.rpxMetaService.setDescription(RPX_META_DESCRIPTION);
      this.rpxMetaService.setImage(RPX_META_IMAGE);
    }
  }

  private pullInfoObject(): void {
    if (this.router.url.indexOf('event') > -1) {
      const infoObjectId = this.activatedRoute.snapshot.paramMap.get('id');
      this.urlApi = `id=${infoObjectId}`;
    }

    const infoObjToPull = {
      config_url: this.urlApi,
    };

    if (this.router.url.indexOf('event') > -1) {
      this.infoObjectService.pullEventObject(infoObjToPull).subscribe(resp => {
        this.getEventCallback(resp);
      });
    } else {
      this.infoObjectService.pullInfoObject(infoObjToPull).subscribe(resp => {
        this.pullInfoObjectCallback(resp);
      });
    }
  }

  private pullInfoObjectCallback(httpResponse: any): void {
    if (httpResponse.success) {
      const infoObject = httpResponse.data as InfoObject;
      infoObject.type_of_info_object_category = this.infoObjectCategory;

      if (infoObject.is_community_member) {
        this.infoObjectImageUrl =
          'assets/images/home_imgs/rpx-green-icon.png';
      } else {
        this.infoObjectImageUrl =
          'assets/images/home_imgs/rpx-white-icon.png';
      }

      if (
        this.router.url.indexOf('place-to-eat') > -1 ||
        infoObject.type_of_info_object_category === 1
      ) {
        infoObject.type_of_info_object = InfoObjectType.Yelp;
        infoObject.type_of_info_object_category = 1;
        this.infoObjectLink = `${environment.baseUrl}place-to-eat/${infoObject.alias}/${infoObject.id}`;
      }

      if (
        this.router.url.indexOf('shopping') > -1 ||
        infoObject.type_of_info_object_category === 2
      ) {
        infoObject.type_of_info_object = InfoObjectType.Yelp;
        infoObject.type_of_info_object_category = 2;
        this.infoObjectLink = `${environment.baseUrl}shopping/${infoObject.alias}/${infoObject.id}`;
      }

      if (
        this.router.url.indexOf('events') > -1 ||
        infoObject.type_of_info_object_category === 3
      ) {
        infoObject.type_of_info_object = InfoObjectType.TicketMaster;
        infoObject.type_of_info_object_category = 3;
        this.infoObjectLink = `${environment.baseUrl}event/${infoObject.alias}/${infoObject.id}`;
      }

      if (infoObject.is_community_member) {
        infoObject.type_of_info_object = InfoObjectType.RpxCommunity;
        infoObject.image_url = infoObject.photo;
        this.infoObjectLink = `${environment.baseUrl}${infoObject.name}/${infoObject.id}`;
      }

      if (infoObject.hours) {
        infoObject.hours.forEach(hours => {
          if (hours.hours_type === 'REGULAR') {
            infoObject.isOpenNow = hours.is_open_now;
          }
        });
      }

      if (!infoObject.is_community_member) {
        this.objectDisplayAddress = `${infoObject.location.display_address[0]}, ${infoObject.location.display_address[1]}`;
      } else {
        this.objectDisplayAddress = infoObject.address;
      }

      infoObject.categories.forEach(category => {
        this.objectCategories = `${this.objectCategories}, ${category.title}`;
      });

      this.objectCategories = this.objectCategories.substring(
        2,
        this.objectCategories.length
      );

      switch (infoObject.type_of_info_object_category) {
        case 1:
          this.infoObjectTitle = `${infoObject.name} - ${this.objectCategories} - ${this.objectDisplayAddress}`;
          this.infoObjectDescription = `Let's go eat at ${infoObject.name}. I know you'll enjoy some of these categories ${this.objectCategories}. They are located at ${this.objectDisplayAddress}.`;
          break;
        case 2:
          this.infoObjectTitle = `${infoObject.name} - ${this.objectCategories} - ${this.objectDisplayAddress}`;
          this.infoObjectDescription = `I really recommend you go shopping at ${infoObject.name}!`;
          break;
      }

      infoObject.rating_image = setYelpRatingImage(infoObject.rating);

      this.rpxMetaService.setTitle(this.infoObjectTitle);
      this.rpxMetaService.setDescription(this.infoObjectDescription);
      this.rpxMetaService.setImage(this.infoObjectImageUrl);

      this.infoObject$.next(infoObject);
      this.loading$.next(false);
    } else {
      console.log('pullInfoObjectCallback', httpResponse);
    }
  }

  async openWithGoogleMaps() {
    const confirmNav = confirm(
      "We will try to open and navigate on your device's default navigation app."
    );

    let displayAddress = '';

    if (this.infoObject$.getValue().location?.display_address) {
      this.infoObject$.getValue().location.display_address.forEach(element => {
        displayAddress = displayAddress + ' ' + element;
      });
    } else if(this.infoObject$.getValue()?.address) {
      displayAddress = this.infoObject$.getValue().address;
    } else {
      displayAddress = this.infoObject$.getValue().business.address;
    }

    if (confirmNav) {
      await AppLauncher.openUrl({
        url: `http://www.google.com/maps/place/${encodeURI(displayAddress)}`,
      });
    }

    return;
  }

  async share() {
    if (Capacitor.isNativePlatform()) {
      Share.share({
        title: this.infoObjectTitle,
        text: this.infoObjectDescription,
        url: this.infoObjectLink,
        dialogTitle: 'Share Spot...',
      });
    } else {
      await navigator.clipboard.writeText(this.infoObjectLink);
      const toast = await this.toastSvc.create({
        message: 'Rpx Community Member location copied.',
        duration: 1500,
        position: 'bottom',
      });

      await toast.present();
    }
  }

  getIconStyle() {
    if (
      this.infoObject$.getValue().type_of_info_object ===
      InfoObjectType.RpxCommunity
    ) {
      return {color: 'white'};
    } else {
      return {color: '#333'};
    }
  }

  async goToTicket() {
    await AppLauncher.openUrl({url: this.infoObject$.getValue().url});
    return;
  }

  getTitleStyling(): string {
    let className = 'sb-titleGrey text-uppercase';
    if (this.infoObject$.getValue().is_community_member) {
      className = 'rpx-text-gradient sb-titleGreen text-uppercase';
    }
    return className;
  }

  getCloseButtonStyling(): {color: string} {
    let style = {color: 'white'};
    if (!this.infoObject$.getValue().is_community_member) {
      style = {color: '#332f3e'};
    }
    return style;
  }

  async startWizard() {
    const wizardModal = await this.modalCtrl.create({
      component: MeetUpWizardComponent,
      componentProps: {
        business: this.infoObject$.getValue(),
      }
    });

    await wizardModal.present();
  }

  getOverlayWindowStyling(): string {
    let className = 'rpx-overlay-window infoObjectWindow has-header';
    if (this.infoObject$.getValue().is_community_member) {
      className = 'rpx-overlay-window communityMemberWindow has-header';
    }
    return className;
  }

  getFontClasses(): string {
    let className = 'text-uppercase';
    if (this.infoObject$.getValue().is_community_member) {
      className = 'rpx-text-gradient text-uppercase';
    }
    return className;
  }

  getEventCallback(httpResponse: any): void {
    const eventObject = httpResponse.data._embedded.events[0] ?? undefined;

    if (httpResponse.success && eventObject) {
      eventObject.coordinates = {
        latitude: '',
        longitude: '',
      };

      eventObject.coordinates.latitude = parseFloat(
        eventObject._embedded.venues[0].location.latitude
      );
      eventObject.coordinates.longitude = parseFloat(
        eventObject._embedded.venues[0].location.longitude
      );
      eventObject.icon = eventObject.images[0].url;
      eventObject.image_url = eventObject.images[8].url;
      eventObject.type_of_info_object = 'ticketmaster_event';

      const datetObj = new Date(eventObject.dates.start.localDate);
      const timeDate = new DateFormatPipe().transform(datetObj);
      const timeHr = new TimeFormatPipe().transform(
        eventObject.dates.start.localTime
      );

      eventObject.dates.start.rpxDate = timeDate;
      eventObject.dates.start.rpxHour = timeHr;

      this.infoObject$.next(eventObject);
      this.setEventMetaData();
    } else {
      console.log('getEventsSearchCallback Error: ', httpResponse);
    }

    this.loading$.next(false);
    return;
  }

  setEventMetaData(): void {
    const infoObject = this.infoObject$.getValue();
    const alias = infoObject.name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[-]+/g, '-')
      .replace(/[^\w-]+/g, '');
    const title = `${infoObject.name} at ${infoObject._embedded.venues[0].name}`;

    if (infoObject.is_community_member) {
      this.infoObjectImageUrl = `${environment.baseUrl}${infoObject.type_of_info_object_category}/${infoObject.id}`;
    } else {
      this.infoObjectLink = `${environment.baseUrl}event/${alias}/${infoObject.id}`;
    }

    this.infoObjectDescription = `Hey! Let's go to ${infoObject.name} together. It's at ${infoObject._embedded.venues[0].name} located in ${infoObject._embedded.venues[0].address.line1}, ${infoObject._embedded.venues[0].city.name} ${infoObject._embedded.venues[0].postalCode}. Prices range from $${infoObject.priceRanges[0].min} to $${infoObject.priceRanges[0].min}`;
    this.infoObjectTitle = title;

    this.rpxMetaService.setTitle(title);
    this.rpxMetaService.setDescription(this.infoObjectDescription);
    this.rpxMetaService.setImage(infoObject.image_url);

    return;
  }

  async visitInfoObjectPage() {
    const infoObject = this.infoObject$.getValue();
    if (infoObject.type_of_info_object === InfoObjectType.Yelp) {
      await AppLauncher.openUrl({url: `${infoObject.url}`});
    } else if (infoObject.type_of_info_object === InfoObjectType.TicketMaster) {
      this.goToTicket();
    }
    return;
  }

  clickGoToSponsored(): void {
    AppLauncher.openUrl({url: 'https://rpx.com/business'});
  }

  async ngAfterViewInit() {
    // I'm sure there's a better way to do this but I don't have time right now.
    const closeButton = document.getElementById('sb-closeButtonInfoObject');

    this.userAuthService.myId$.subscribe(() => {
      this.isLoggedIn$.set(true);
      const p =
        !this.isLoggedIn$()
          ? 20
          : document.getElementById('ionToolbarLoggedIn').offsetHeight;
      closeButton.style.top = p + 'px';
    })
  }

  ngOnInit() {
    this.loading$.next(true);

    const infoObject = this.infoObject$.getValue();

    if (infoObject) {
      this.infoObjectCategory = infoObject.type_of_info_object_category;

      switch (infoObject.type_of_info_object) {
        case InfoObjectType.Yelp:
          this.urlApi = YELP_BUSINESS_DETAILS_API + infoObject.id;
          break;
        case InfoObjectType.TicketMaster:
          this.loading$.next(false);
          return;
        case InfoObjectType.RpxCommunity:
          this.rewardMenuUp$.next(true);

          if (
            infoObject.user_type === 1 ||
            infoObject.user_type === 2 ||
            infoObject.user_type === 3
          ) {
            this.infoObjectLink = `${environment.baseUrl}community/${infoObject.qr_code_link}`;
            switch (infoObject.user_type) {
              case 1:
                this.infoObjectTitle = `${infoObject.name} - ${infoObject.cleanCategories} - ${infoObject.address}`;
                this.infoObjectDescription = `Let's go eat at ${infoObject.name}. I know you'll enjoy some of these categories ${this.infoObjectCategory}. They are located at ${this.objectDisplayAddress}.`;
                break;
              case 2:
                this.infoObjectTitle = `${infoObject.name} - ${infoObject.cleanCategories} - ${infoObject.address}`;
                this.infoObjectDescription = `I really recommend you go shopping at ${infoObject.name}!`;
                break;
              case 3:
                this.infoObjectTitle = `${infoObject.name} - ${infoObject.cleanCategories} - ${infoObject.address}`;
                this.infoObjectDescription = `Let's go to ${infoObject.name}!`;
                break;
            }
          }

          this.loading$.next(false);
          return;
      }
    } else {
      if (
        this.router.url.indexOf('shopping') > -1 ||
        this.router.url.indexOf('place-to-eat') > -1 ||
        this.router.url.indexOf('events') > -1
      ) {
        const infoObjectId = this.activatedRoute.snapshot.paramMap.get('id');
        this.urlApi = YELP_BUSINESS_DETAILS_API + infoObjectId;
      }
    }
    this.pullInfoObject();
  }
}
