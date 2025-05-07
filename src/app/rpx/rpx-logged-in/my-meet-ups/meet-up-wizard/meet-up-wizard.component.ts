import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {ActionSheetController, AlertController, IonDatetime, ModalController, ToastController} from "@ionic/angular";
import {MyFriendsService} from "../../my-friends/my-friends.service";
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {BehaviorSubject, take} from "rxjs";
import {normalizeProfile, normalizeProfileFromFriendSearch} from "../../my-friends/helpers";
import {MeetupService} from "../services/meetup.service";
import {filter, map, tap} from "rxjs/operators";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {UserauthService} from "../../../../services/userauth.service";
import {Business} from "../../../../models/business";
import {Capacitor} from "@capacitor/core";
import {AndroidSettings, NativeSettings} from "capacitor-native-settings";
import {IOSSettings} from "capacitor-native-settings/dist/esm/definitions";
import {ContactPayload, Contacts, PickContactResult} from "@capacitor-community/contacts";
import {User} from "../../../../models/user";
import {MeetUp, MeetUpInvitation} from "../models";
import {formatInTimeZone} from 'date-fns-tz'
import {UTCDate} from "@date-fns/utc";
import {InfoObject} from "../../../../models/info-object";

@Component({
  selector: 'app-meet-up-wizard',
  templateUrl: './meet-up-wizard.component.html',
  styleUrls: ['./meet-up-wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetUpWizardComponent  implements OnInit {

  @ViewChild('meetUpDateTime') meetUpDateTime: ElementRef<IonDatetime>;

  @Input() set meetUp(meetUp: MeetUp) {
    if (meetUp) {
      this.meetUp$.next(meetUp);
      this.business = meetUp.business;
    }
  }

  meetUp$ = new BehaviorSubject<MeetUp>(undefined);
  meetUpForm: UntypedFormGroup;
  submitted$ = new BehaviorSubject<boolean>(false);
  loading$ = new BehaviorSubject<boolean>(undefined);
  // The visible list of ALL your Rpx friends.
  myFriendListing$ = new BehaviorSubject<any>(undefined);
  // the listing that comes up when you <i>search</i> with the search bar.
  searchFriendListing$ = new BehaviorSubject<any>(undefined);
  // the meetup owner
  ownerProfile$ = new BehaviorSubject<User>(undefined);
  // Used to tell which users are going to the meet up. Friends that are invited.
  meetUpFriendList$ = new BehaviorSubject<any>(undefined);
  private searchTimeout;

  meetUpDateTime$: WritableSignal<any> = signal(new Date());
  // The minimum date value for the calendar
  minDateValue$ = signal(
    formatInTimeZone(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX")
  );

  myUserId: User['id'];
  business: Business | InfoObject;
  importContactList$ = new BehaviorSubject<FriendContact[]>([]);
  showEnablePermissions$ = signal(false);

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: UntypedFormBuilder,
    private meetUpService: MeetupService,
    private myFriendsService: MyFriendsService,
    private toastService: ToastController,
    private userAuthService: UserauthService,
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController,
  ) {
    this.userAuthService.myId$
      .pipe(
        takeUntilDestroyed(),
        filter(f => !!f),
        tap((id: number) => {
          this.myUserId = id;
          // this.getMyFriends();
        })
      )
      .subscribe();
  }

  ngOnInit() {
    this.initMeetUpForm();
  }


  hydrateMeetUpForm(meetUp: MeetUp) {
    this.meetUpForm.get('meetUpName').setValue(meetUp.name);
    this.meetUpForm.get('meetUpDescription').setValue(meetUp.description);
    this.meetUpDateTime$.set(meetUp.time);

    if (meetUp?.contact_list && meetUp?.contact_list?.length > 0) {
      const cList = JSON.parse((meetUp.contact_list as any));
      cList.forEach(async c => {
        await this.hydrateContacts(JSON.parse(c));
      });
    }

    this.hydrateFriends(meetUp.invitation_list);
    this.hydrateOwner(meetUp.owner);
  }

  hydrateOwner(owner: MeetUp['owner']) {
    this.ownerProfile$.next(owner);
  }

  hydrateFriends(invitationList: MeetUpInvitation[]) {
    const friendList = invitationList.map(meetUpInvitation => ({
      ...meetUpInvitation,
      user_profile: { ...meetUpInvitation.user_profile, rpx_user: meetUpInvitation.friend_profile },
      id: meetUpInvitation.friend_id
    }));

    this.meetUpFriendList$.next(friendList.filter(a => {
      let c = a.id.toString();
      return c.indexOf('+') === -1;
    }));
  }

  async addToMeetUp(f, firstName: string) {
    const friendProfile = {...f, user_profile: {...f.user_profile, rpx_user: f.rpx_profile}};

    const alreadyAdded = this.meetUpFriendList$.getValue()
      ?.filter(f => f.id === friendProfile.id);
    
    if (alreadyAdded?.length > 0) {
      const a = await this.alertController.create({
        header: 'Already Added',
        message: `You have already added ${firstName}.`,
        buttons: [{
          text: 'Ok',
          role: 'confirm',
        }],
      });

      await a.present();
    } else {
      const alert = await this.alertController.create({
        header: `Invite ${firstName}`,
        message: `Do you really want to add ${firstName} to this meet up?`,
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Yes',
            role: 'confirm',
            handler: async (ev) => {
              if (this.meetUpFriendList$.getValue()?.length) {
                this.meetUpFriendList$.next([
                    ...this.meetUpFriendList$.getValue(),
                    friendProfile
                ]);
              } else {
                this.meetUpFriendList$.next([friendProfile]);
              }

              return;
            },
          },
        ],
      });

      await alert.present();
    }

    return;
  }

  identify(index, item: any) {
    return item.id;
  }

  getMyFriends() {
    this.myFriendsService.getMyFriends()
      .subscribe(resp => {
        this.loading$.next(false);
        this.searchFriendListing$.next(null);
      });
  }

  async enablePermissions() {
    if (Capacitor.getPlatform() === 'ios') {
      await NativeSettings.openIOS({
        option: IOSSettings.App,
      });
    } else if (Capacitor.getPlatform() === 'android') {
      await NativeSettings.openAndroid({
        option: AndroidSettings.Application,
      });
    }
  }

  showEnablePermissions() {
    this.showEnablePermissions$.set(true);
  }

  requestPermissions() {
    Contacts.requestPermissions().then((p) => {
      this.importContacts();
    });
  }

  async importContacts(skipCheck = false) {
    this.loading$.next(true);

    if (
      Capacitor.isNativePlatform()
    ) {
      Contacts.checkPermissions().then((p) => {
        switch (p.contacts) {
          case "prompt-with-rationale":
          case "prompt":
            this.requestPermissions();
            break;
          case "denied":
            this.showEnablePermissions();
            break;
          case "granted":
            this.finishContactImport();
            break;
        }
      });
    }
  }

  async finishContactImport() {
    const projection = {
      // Specify which fields should be retrieved.
      name: true,
      phones: true,
      postalAddresses: true,
      image: true
    };

    const result: PickContactResult = await Contacts.pickContact({
      projection,
    });

    if (!result.contact.phones?.length) {
      this.mustHavePh();
      return;
    }

    let ph;
    if (result.contact.phones[0].number.indexOf('+') < 0) {
      ph = '+1' + result.contact.phones[0].number;
    } else {
      ph = result.contact.phones[0].number;
    }

    this.hydrateContacts({ name: result.contact.name.display, number: ph, image: null});
    this.loading$.next(false);
  }

  alreadyInImport(displayName: string) {
    this.toastService.create({
      message: `${displayName} was already imported.`,
      duration: 2500,
      position: 'bottom'
    }).then(c => c.present());
  }

  hydrateContacts(contact: FriendContact) {
    const alreadyInList = this.importContactList$.getValue()?.find(a => (
      // We'll want to put this into a comparator function that can compare against every locale instead of hardcoding the +1
      (a.number === contact.number || a.number === '+1'+contact.number))
    );

    if (alreadyInList) {
      this.alreadyInImport(contact.name);
      return;
    }

    this.importContactList$.next([
      ...this.importContactList$.getValue(),
      contact
    ]);
  }

  get meetUpName() {
    return this.meetUpForm.get('meetUpName').value;
  }
  get meetUpDescription() {
    return this.meetUpForm.get('meetUpDescription').value;
  }

  get f() {
    return this.meetUpForm.controls;
  }

  setDate(evt) {
    this.meetUpDateTime$.set(evt.detail.value);
  }

  async actionSheet(friendProfile, friendContact: FriendContact = null) {
    console.log("FRIEND PROFILE", friendProfile);
    const actionSheet = await this.actionSheetCtrl.create({
      cssClass: 'rpx-ac',
      buttons: [
        {
          text: 'Remove',
          role: 'destructive',
          data: {
            action: 'delete',
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });

    await actionSheet.present();

    await actionSheet.onDidDismiss().then((evt) => {
      if (evt.data?.action === 'delete') {
        if ((
          this.meetUpFriendList$.getValue()?.length +
          this.importContactList$.getValue()?.length
        ) === 1) {
          this.cannotRemoveFriend();
          return;
        }

        if (friendContact && this.importContactList$.getValue()?.length) {
          this.importContactList$.next(
            this.importContactList$.getValue().filter((f) => (f.name !== friendContact.name) && (f.number !== friendContact.number))
          );
        } else if (friendProfile) {
          this.meetUpFriendList$.next(
            this.meetUpFriendList$.getValue().filter((f) => f.id !== friendProfile.id)
          );
        }
      }

      return;
    });
  }

  async mustHavePh() {
    const a = await this.toastService.create({
      message: 'This contact does not have a phone number.',
      duration: 5000,
      position: 'bottom'
    });

    await a.present();
    return;
  }

  async cannotRemoveFriend() {
    const a = await this.toastService.create({
      message: 'You need at least one invite.',
      duration: 5000,
      position: 'bottom'
    });

    await a.present();
    return;
  }

  initMeetUpForm() {
    const meetUpNameValidators = [Validators.required, Validators.max(35), Validators.min(1)];
    const meetUpDescriptionValidators = [Validators.required, Validators.max(350), Validators.min(1)];

    this.meetUpForm = this.formBuilder.group(
      {
        meetUpName: ['', meetUpNameValidators],
        meetUpDescription: ['', meetUpDescriptionValidators],
      },
    );

    this.meetUp$.pipe(
      take(1),
      filter(f => !!f),
      tap((meetUp: MeetUp) => {
        this.hydrateMeetUpForm(meetUp);
      })
    ).subscribe();
  }

  async submitMeetUp() {
    this.loading$.next(true);
    this.submitted$.next(true);

    if (this.meetUpForm.invalid) {
      return false;
    }

    let contact_list = [];
    if (this.importContactList$.getValue()?.length > 0) {
      contact_list = this.importContactList$.getValue().map(c => (
        JSON.stringify(c)
      ));
    }

    const friend_list = this.meetUpFriendList$.getValue()?.map(f => parseInt(f.user_profile?.rpx_user?.id ?? f.friend_id));

    if ((!friend_list && !contact_list) || (friend_list?.length + contact_list?.length === 0))  {
      const a = await this.toastService.create({
        message: 'You need to pick some friends for your meet up.',
        duration: 3000,
        position: 'bottom'
      });

      await a.present();
      return;
    }

    const meet_up_name = this.meetUpName;
    const meet_up_description = this.meetUpDescription;

    let business_id;
    if (!this.business?.id) {
      business_id = (this.business as InfoObject).business.id.toString();
    } else {
      business_id = this.business.id.toString();
    }

    const sbcm = this.business.is_community_member ?? false;

    let time = this.meetUpDateTime$();

    if (!time) {
      const a = await this.toastService.create({
        message: 'You need to pick a time for your meet up.',
        duration: 5000,
        position: 'bottom'
      });

      await a.present();
      return;
    }

    time = new Date(time);
    const utcTime = new UTCDate(time);

    const req = {
      meet_up_name,
      meet_up_description,
      friend_list,
      business_id,
      sbcm,
      time: utcTime,
      contact_list
    };

    if (!this.meetUp$.getValue()) {
      this.meetUpService.createMeetUp(req).subscribe(async resp => {
        const c = await this.toastService.create({
          message: 'You have created a meet up.',
          duration: 5000,
          position: 'bottom'
        });

        await c.present();

        setTimeout(() => {
          this.addedMeetUp();
        }, 1500);
      });
    } else {
      const editReq = {
        ...req,
        business_id: null,
        sbcm: null,
        id: this.meetUp$.getValue().id
      }
      this.editMeetUp(editReq, editReq.id);
    }
  }

  editMeetUp(req, id: MeetUp['id']) {
    this.meetUpService.editMeetUp(req, id ).subscribe(async resp => {
      const c = await this.toastService.create({
        message: 'You have edited your meet up.',
        duration: 5000,
        position: 'bottom'
      });

      await c.present();

      setTimeout(() => {
        this.addedMeetUp();
      }, 1500);
    });
  }

  searchFriends(evt) {
    if (evt.target.value === '') {
      return;
    }

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }

    this.searchTimeout = setTimeout(() => {
      this.myFriendsService.searchForFriends(evt.target.value).pipe(
        tap((_) => this.loading$.next(true)),
      ).subscribe((resp) => {
        this.loading$.next(false);
        this.searchFriendListing$.next(normalizeProfileFromFriendSearch(resp.matchingUserList, this.myUserId));
        clearTimeout(this.searchTimeout);
        this.searchTimeout = null;
      });
    }, 2500);
  }

  closeModal() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  addedMeetUp() {
    this.modalCtrl.dismiss({action: 'added-meetup'});
  }
}

export interface FriendContact {
  name: string,
  number: string,
  image: string,
  going?: boolean
}
