import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of, take} from "rxjs";
import {MeetupService} from "../../rpx/rpx-logged-in/my-meet-ups/services/meetup.service";
import {filter, tap} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {
  MeetUp,
  MeetUpInvitation,
  normalizeMeetUpList,
  rpxToLocalTime
} from "../../rpx/rpx-logged-in/my-meet-ups/models";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {FriendContact} from "../../rpx/rpx-logged-in/my-meet-ups/meet-up-wizard/meet-up-wizard.component";
import {ActionSheetController, ToastController} from "@ionic/angular";
import {UserauthService} from "../../services/userauth.service";
import {RpxUser} from "../../models/rpxuser";
import {InfoObject} from "../../models/info-object";
import {Business} from "../../models/business";
import {environment} from "../../../environments/environment";
import {User} from "../../models/user";
import {normalizeProfile} from "../../rpx/rpx-logged-in/my-friends/helpers";

@Component({
  selector: 'app-accept-mui-invites',
  templateUrl: './accept-mui-invites.component.html',
  styleUrls: ['./accept-mui-invites.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcceptMuiInvitesComponent  implements OnInit {

  ownerProfile$ = new BehaviorSubject<User>(null);
  userProfileList$ = new Observable<User[]>(null);
  $uuid = new Observable<string>();
  importContactList$ = new BehaviorSubject<FriendContact[]>([]);
  businessName$ =  new BehaviorSubject<string>(undefined);
  meetUpTime$ =  new BehaviorSubject<string>(undefined);
  meetUpGoingList$ =  new BehaviorSubject<MeetUpInvitation[]>(undefined);
  meetUpLocation$ =  new BehaviorSubject<Business | InfoObject>(undefined)
  userFullName$ = new BehaviorSubject<string>(null);
  meetUpLink$ = new BehaviorSubject<string>(null);
  meetUpPhotoLink$ = new BehaviorSubject<string>(null);

  uuid: string;
  myUserId: string;

  constructor(
    private meetUpService: MeetupService,
    private route: ActivatedRoute,
    private actionSheetCtrl: ActionSheetController,
    private changeDetectorRef: ChangeDetectorRef,
    private userAuthService: UserauthService,
    private toastService: ToastController,
  ) {
    this.$uuid = of(this.route.snapshot.params['uuid']);

    this.$uuid.pipe(
      filter(a => !!a),
      takeUntilDestroyed(),
    ).subscribe((uuid: string) => {
      this.uuid = uuid;
      this.showMeetUp(uuid);
      this.changeDetectorRef.markForCheck();
    });

    this.userAuthService.myId$
      .pipe(
        takeUntilDestroyed(),
        filter(f => !!f),
        tap((id: any) => {
          this.myUserId = id;
        })
      ).subscribe();
  }

  ngOnInit() {
  }

  identify(index, item: any) {
    return item.id;
  }

  auraColorSb(user: RpxUser) {
    let f = this.meetUpGoingList$.getValue().find(a => parseInt((a.friend_id as string)) === user.id);
    if (f?.going) {
      return 'sbAura-green';
    } else {
      return 'sbAura-pending';
    }
  }

  auraColorContact(friendContact: FriendContact) {
    let f = this.meetUpGoingList$.getValue().find(
      a => a.friend_id === stripPh(friendContact.number)
    );
    if (f?.going) {
      return 'sbAura-green';
    } else {
      return 'sbAura-pending';
    }
  }

  private showMeetUp(uuid: string) {
    this.meetUpService.showMeetUpInvitation(uuid, this.myUserId).subscribe(
      (resp: {meetUpLocation: Business | InfoObject, meetUp: MeetUp, invitationList: MeetUpInvitation[], contactListProfiles: FriendContact[], userProfileList: any[], ownerProfile: RpxUser}) => {

      const theMeetUp = rpxToLocalTime(resp.meetUp.time);

      this.userProfileList$ = of(resp.userProfileList);
      this.importContactList$.next(resp.contactListProfiles);

      this.ownerProfile$.next(
        normalizeProfile([resp.ownerProfile], this.myUserId)[0]
      );
      this.meetUpTime$.next(theMeetUp.localTime);
      this.meetUpLocation$.next(resp.meetUpLocation);
      this.meetUpGoingList$.next([...resp.invitationList]);

      if ((resp.meetUpLocation as Business)?.slug) {
        let b = resp.meetUpLocation as Business;
        this.meetUpLink$.next(`${environment.baseUrl}/community/${b.qr_code_link}`);
        this.meetUpPhotoLink$.next(b.photo);
      } else {
        let b = resp.meetUpLocation as InfoObject;
        this.meetUpLink$.next(`${b.url}`);
        this.meetUpPhotoLink$.next(b.image_url);
      }
    });
  }

  yes(){
    this.meetUpService.acceptInvitation(this.uuid).subscribe(async (resp) => {
      const t = await this.toastService.create({
        message: `Meet Up Invite accepted. Ty! <3`,
        duration: 2500,
        position: 'bottom'
      });

      await t.present();

      setTimeout(() => {
        window.location.reload();
      }, 2500);
    });
  }

  protected readonly InfoObject = InfoObject;
}

function stripPh(ph: string) {
  return ph.replace(/[^\d+]/g, "");
}
