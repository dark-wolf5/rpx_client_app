import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  signal,
  WritableSignal
} from '@angular/core';
import {ModalController} from "@ionic/angular";
import {MeetupService} from "./services/meetup.service";
import {MyMeetUpListingComponent} from "./my-meet-up-listing/my-meet-up-listing.component";
import {MeetUp, normalizeMeetUpList} from "./models";
import {InfoObjectServiceService} from "../../map/info-object/info-object-service.service";

const YELP_BUSINESS_DETAILS_API = 'https://api.yelp.com/v3/businesses/';

@Component({
  selector: 'app-my-meet-ups',
  templateUrl: './my-meet-ups.component.html',
  styleUrls: ['./my-meet-ups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyMeetUpsComponent  implements OnInit {

  @Output() findPeopleEvt = new EventEmitter(null);
  @Output() spawnCategoriesEvt = new EventEmitter(null);

  latestMeetUp$: WritableSignal<MeetUp> = signal(null);
  meetUpList$: WritableSignal<MeetUp[]> = signal(null);

  constructor(
    private modalCtrl: ModalController,
    private meetUpService: MeetupService,
    private infoObjectService: InfoObjectServiceService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  async findPeople() {
    this.findPeopleEvt.emit();
  }

  async myMeetUpsModal() {
    const modal = await this.modalCtrl.create({
      component: MyMeetUpListingComponent,
      componentProps: {
        meetUpListing: this.meetUpList$(),
        latestMeetUp: this.latestMeetUp$()
      },
    });

    await modal.present();

    modal.addEventListener('didDismiss', (evt) => {
      if (evt.detail.role == 'get-started') {
        this.startWizard();
      } else if (evt.detail.role == 'find-friends') {
        this.findPeople();
      } else if (evt.detail.role == 'cancel') {
        this.myMeetUps();
      }
    });
  }

  async startWizard() {
    this.spawnCategoriesEvt.emit(1);
  }

  myMeetUps() {
    this.meetUpService.myMeetUps().subscribe(async (resp: any) => {
      if (resp.data?.length === 0) {
        return;
      }

      const theMeetUps: MeetUp[] = normalizeMeetUpList(resp.meetUpListing.data);
      this.latestMeetUp$.set(theMeetUps[0]);
      this.meetUpList$.set(theMeetUps);

      this.upsertInfoObjects();
    });
  }

  upsertInfoObjects() {
    this.meetUpList$().map((meetUp: MeetUp) => {
      let isNotSbcm = meetUp.business_id;
      if (isNotSbcm) {
        const infoObjToPull = {config_url: YELP_BUSINESS_DETAILS_API + meetUp.business_id};

        this.infoObjectService.pullInfoObject(infoObjToPull).subscribe(resp => {
          meetUp.business = resp.data;

          let toReplace = this.meetUpList$().findIndex(a => meetUp.meet_up_id === a.meet_up_id);
          let o = this.meetUpList$();
          o[toReplace - 1] = meetUp;

          this.meetUpList$.set(o);
          this.changeDetectorRef.detectChanges();
        });
      }
    });
  }

  ngOnInit() {
      this.myMeetUps();
  }
}
