import {Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {AlertController, ModalController, ToastController} from "@ionic/angular";
import {MyFriendsService} from "../../my-friends/my-friends.service";
import {normalizeProfile} from "../../my-friends/helpers";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {filter, tap} from "rxjs/operators";
import {UserauthService} from "../../../../services/userauth.service";
import {MeetUp, normalizeMeetUpList} from "../models";
import {MeetUpWizardComponent} from "../meet-up-wizard/meet-up-wizard.component";
import {MeetupService} from "../services/meetup.service";
import {InfoObjectServiceService} from "../../../map/info-object/info-object-service.service";

const YELP_BUSINESS_DETAILS_API = 'https://api.yelp.com/v3/businesses/';

@Component({
  selector: 'app-my-meet-up-listing',
  templateUrl: './my-meet-up-listing.component.html',
  styleUrls: ['./my-meet-up-listing.component.scss'],
})
export class MyMeetUpListingComponent implements OnInit {

  @Output() moreListingsEvt = new EventEmitter(null);

  meetUpListing$: BehaviorSubject<MeetUp[]> = new BehaviorSubject(null);
  @Input() set meetUpListing(meetUpListing: MeetUp[]) {
    if (meetUpListing) {
      this.meetUpListing$.next(meetUpListing);
    }
  }

  latestMeetUp$: Observable<any> = new Observable();
  @Input() set latestMeetUp(latestMeetUp: any) {
    if (latestMeetUp) {
      this.latestMeetUp$ = of(latestMeetUp);
    }
  }

  loading$= new BehaviorSubject(false);
  friendListing$: Observable<any> = new Observable(null);
  myUserId;

  constructor(
    private modalCtrl: ModalController,
    private myFriendsService: MyFriendsService,
    private userAuthService: UserauthService,
    private meetUpService: MeetupService,
    private toastService: ToastController,
    private alertController: AlertController,
    private ngZone: NgZone,
    private infoObjectService: InfoObjectServiceService,
  ) {
    this.userAuthService.myId$
      .pipe(
        takeUntilDestroyed(),
        filter(f => !!f),
        tap((id) => {
          this.myUserId = id;
          this.getMyFriends();
        })
      )
      .subscribe();
  }

  ngOnInit() {

  }

  findFriends() {
    this.modalCtrl.dismiss(null, 'find-friends');
  }

  getStarted() {
    this.modalCtrl.dismiss(null, 'get-started');
  }

  getMyFriends() {
    this.myFriendsService.getMyFriends().subscribe(resp => {
      let dataWithCorrectProfiles = normalizeProfile(resp.friendList.data, this.myUserId);
      this.loading$.next(false);
      this.friendListing$ = of(dataWithCorrectProfiles);
    });
  }

  closeModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async openMeetUp(meetUp: MeetUp) {
    const modal = await this.modalCtrl.create({
      component: MeetUpWizardComponent,
      componentProps: {
        meetUp: meetUp
      }
    });

    await modal.present();

    await modal.onDidDismiss().then((evt) => {
      if (evt.data?.action === 'added-meetup') {
        this.ngZone.run(() => {
          // There's no need to do this, you can just upsert the meet up you just made,
          // save yourself the API calls
          this.rehydrateMeetUps();
        });
      }

      return;
    });
  }

  rehydrateMeetUps() {
    this.meetUpService.myMeetUps().subscribe((resp: {meetUpListing: any}) => {
      this.ngZone.run(() => {
        const theMeetUps: MeetUp[] = normalizeMeetUpList(resp.meetUpListing.data);
        this.meetUpListing$.next(theMeetUps);
        this.updateInfoObjects();
      });
    });
  }

  updateInfoObjects() {
    this.meetUpListing$.getValue().map((meetUp: MeetUp) => {
      let isNotSbcm = meetUp.business_id;
      if (isNotSbcm) {
        const infoObjToPull = { config_url: YELP_BUSINESS_DETAILS_API + meetUp.business_id };

        this.infoObjectService.pullInfoObject(infoObjToPull).subscribe(resp => {
            meetUp.business = resp.data;

            let toReplace = this.meetUpListing$.getValue().findIndex(a => meetUp.meet_up_id === a.meet_up_id);
            let o = this.meetUpListing$.getValue();
            o[toReplace - 1] = meetUp;

            this.meetUpListing$.next(o);
          });
      }
    });
  }

  async deleteMeetUp(deleteMeetUp: MeetUp) {
    const a = await this.alertController.create({
      header: `Delete Meet Up`,
      message: `Are you sure you want to delete ${deleteMeetUp.name}?`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes',
          role: 'confirm',
          handler: async (ev) => {
            this.meetUpService.deleteMeetUp(deleteMeetUp).subscribe(async (p) => {
                const a = await this.toastService.create({
                  message: `You have deleted ${deleteMeetUp.name} meet up.`,
                  duration: 5000,
                  position: 'bottom'
                });

                await a.present();

                this.ngZone.run(() => {
                  // Instead of rehydrating the whole list just remove the one you deleted.
                  this.meetUpListing$.next(
                    this.meetUpListing$.getValue().filter(a => a.id !== deleteMeetUp.id)
                  );
                });
              });

            return;
          },
        },
      ],
    });

    await a.present();
  }
}
