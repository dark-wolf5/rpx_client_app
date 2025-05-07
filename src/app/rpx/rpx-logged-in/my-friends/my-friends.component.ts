import {Component, ElementRef, NgZone, signal, ViewChild, WritableSignal} from '@angular/core';
import {BehaviorSubject, EMPTY, Observable, of} from "rxjs";
import {AlertController, ToastController} from "@ionic/angular";
import {Capacitor} from "@capacitor/core";
import {Position} from "@capacitor/geolocation";
import {FRIENDSHIP_STATUS_E, MyFriendsService} from "./my-friends.service";
import {getRandomInt} from "../../../helpers/numbers.helper";
import {UserauthService} from "../../../services/userauth.service";
import {catchError, filter, tap} from "rxjs/operators";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {normalizeProfile} from "./helpers";
import {ContactPayload, Contacts, PickContactResult} from "@capacitor-community/contacts";
import {AndroidSettings, NativeSettings} from "capacitor-native-settings";
import {IOSSettings} from "capacitor-native-settings/dist/esm/definitions";

@Component({
  selector: 'app-my-friends',
  templateUrl: './my-friends.component.html',
  styleUrls: ['./my-friends.component.scss'],
})
export class MyFriendsComponent {

  @ViewChild('segment-people') segmentPeople: ElementRef;
  @ViewChild('segment-friends') segmentFriends: ElementRef;

  myFriendListing$ = new Observable<any>(null);
  importContactList$: WritableSignal<ContactPayload[]> = signal([]);
  mySearchResultList$ = new Observable<any>(null);
  position$ = new BehaviorSubject<Position>(null);
  loading$ = new BehaviorSubject<boolean>(false);
  FRIENDSHIP_STATUS_E = FRIENDSHIP_STATUS_E;
  myUserId;
  searchTimeout;

  showEnablePermissions$ = signal(false);
  quote$ = signal(null);

  constructor(
    private toastService: ToastController,
    private friendshipService: MyFriendsService,
    private userAuthService: UserauthService,
    private alertController: AlertController,
    private ngZone: NgZone,
  ) {
    this.userAuthService.myId$
      .pipe(
        takeUntilDestroyed(),
        filter(f => !!f),
        tap((id) => {
          this.myUserId = id;
          this.getMyFriends();
        })
      ).subscribe();
  }

  switchSection(section: 'friends' | 'people') {
    const element = document.getElementById('segment-button-' + section);
    element.click();
  }

  sharedExperiencesExternal() {

  }

  meetUpExternal() {

  }

  identify(index, item: any) {
    return item.id;
  }

  searchFriends(evt) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }

    if (evt.target.value === '') {
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.loading$.next(true);
      this.friendshipService.searchForUser(evt.target.value)
        .subscribe((resp) => {
          this.loading$.next(false);
          this.mySearchResultList$ = of(resp.matchingUserList);
          clearTimeout(this.searchTimeout);
          this.searchTimeout = null;
        });
    }, 1500);
  }

  async getNearBy() {

  }

  showEnablePermissions() {
    this.showEnablePermissions$.set(true);
  }

  requestPermissions() {
   Contacts.requestPermissions().then((p) => {
     this.importContacts();
   });
  }

  async inviteContact(contact: ContactPayload) {
    const a = await this.alertController.create({
      header: `Invite to Rpx`,
      message: `Do you want to invite ${contact.name.display} to use Rpx?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Ok',
          role: 'confirm',
          handler: async (ev) => {
            this.ngZone.run(() => {
              this.loading$.next(true);
            });
            this.friendshipService.inviteContact(contact.name.display, contact.phones[0].number)
              .subscribe(async r => {
                this.loading$.next(true);
                const t = await this.toastService.create({
                  message: `You have invited ${contact.name.display}. Ty! <3`,
                  duration: 2500,
                  position: 'bottom'
                });

                await t.present();
                this.ngZone.run(() => {
                  this.loading$.next(false);
                });
              });
            return;
          },
        },
      ]
    });

    await a.present();
    return;
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

  async importContacts(skipCheck = false) {
    this.loading$.next(true);

    if (Capacitor.isNativePlatform()) {
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

    this.hyrdrateContacts(result);
    this.loading$.next(false);
  }

  hyrdrateContacts(result: PickContactResult) {
    this.importContactList$.set([
      ...this.importContactList$(),
      result.contact
    ]);
  }

  async unblockFriend(id, firstName) {
    const a = await this.alertController.create({
      header: `Unblock ${firstName}`,
      message: `Do you want to unblock ${firstName}?`,
      buttons: [
          {
            text: 'Ok',
            role: 'confirm',
            handler: async (ev) => {
              this.ngZone.run(() => {
                this.loading$.next(true);
              });
              this.friendshipService.removeFriend(id).subscribe( r => {
                this.toastService.create({
                  message: `${firstName} has been unblocked.`,
                  duration: 2500,
                  position: 'bottom'
                }).then(c => c.present());

                this.ngZone.run(() => {
                  this.getMyFriends();
                });
              });
              return;
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          }
      ]
    });

    await a.present();
    return;
  }

  async cancelRequest(id, firstName){
    const a = await this.alertController.create({
      header: `Cancel Request`,
      message: `Do you want to cancel ${firstName}'s request?`,
      buttons: [
        {
          text: 'Ok',
          role: 'confirm',
          handler: async (ev) => {
            this.ngZone.run(() => {
              this.loading$.next(true);
            });
            this.friendshipService.removeFriend(id)
              .subscribe(async r => {
                this.loading$.next(true);
                const t = await this.toastService.create({
                  message: `You have cancelled ${firstName}'s friend request.`,
                  duration: 2500,
                  position: 'bottom'
                });

                await t.present();
                this.ngZone.run(() => {
                  this.getMyFriends();
                });
              });
            return;
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });

    await a.present();
    return;
  }

  async denyFriendship(id, firstName) {
    const a = await this.alertController.create({
      header: `Deny Request`,
      message: `Do you want to deny ${firstName}'s request?`,
      buttons: [
        {
          text: 'Ok',
          role: 'confirm',
          handler: async (ev) => {
            this.ngZone.run(() => {
              this.loading$.next(true);
            });
            this.friendshipService.removeFriend(id)
              .subscribe(async r => {
                this.loading$.next(true);
                const t = await this.toastService.create({
                  message: `You have denied ${firstName}'s friend request.`,
                  duration: 2500,
                  position: 'bottom'
                });

                await t.present();
                this.ngZone.run(() => {
                  this.getMyFriends();
                });
              });
            return;
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });

    await a.present();
    return;
  }

  async removeFriend(id, firstName) {
    const a = await this.alertController.create({
      header: `Unfriend ${firstName}`,
      message: `Do you want to remove ${firstName}?`,
      buttons: [
        {
          text: 'Ok',
          role: 'confirm',
          handler: async (ev) => {
            this.ngZone.run(() => {
              this.loading$.next(true);
            });
            this.friendshipService.removeFriend(id)
              .subscribe(async r => {
                this.loading$.next(true);
                const t = await this.toastService.create({
                  message: `You have removed ${firstName} from your friend's list.`,
                  duration: 2500,
                  position: 'bottom'
                });

                await t.present();
                this.ngZone.run(() => {
                  this.getMyFriends();
                });
              });
            return;
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });

    await a.present();
    return;
  }

  async blockFriend(id, firstName) {
    const a = await this.alertController.create({
      header: `Block ${firstName}`,
      message: `Do you want to block ${firstName}?`,
      buttons: [
        {
          text: 'Ok',
          role: 'confirm',
          handler: async (ev) => {
            this.ngZone.run(() => {
              this.loading$.next(true);
            });
            this.friendshipService.blockFriend(id).subscribe(async r => {
                const t = await this.toastService.create({
                    message: `${firstName} has been blocked.`,
                    duration: 2500,
                    position: 'bottom'
                  });
                await t.present();
                this.ngZone.run(() => {
                  this.getMyFriends();
                });
              });

            return;
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await a.present();

    return;
  }

  async acceptFriendRequest(friendId, firstName) {
    const a = await this.alertController.create({
      header: `Accept Friend Request`,
      message: `Do you want to be friends with ${firstName}?`,
      buttons: [
        {
          text: 'Ok',
          role: 'confirm',
          handler: async (ev) => {
            this.ngZone.run(() => {
              this.loading$.next(true);
            });
            this.friendshipService.acceptFriend(friendId)
              .subscribe(async (resp) => {
                const t = await this.toastService.create({
                  message: 'Friend request accepted.',
                  duration: 2500,
                  position: 'bottom'
                });
                await t.present();

                this.ngZone.run(() => {
                  this.getMyFriends();
                });
              });
            return;
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });

    await a.present();
    return;
  }

  getMyFriends() {
    this.loading$.next(true);

    this.friendshipService.getMyFriends()
      .subscribe(resp => {
        const dataWithCorrectProfiles= normalizeProfile(resp.friendList.data, this.myUserId);
        this.loading$.next(false);
        this.myFriendListing$ = of(dataWithCorrectProfiles);
      });
  }

  getNearby() {
    this.loading$.next(true);
    const coords = this.position$.getValue();

    this.friendshipService.randomNearby(coords.coords.latitude, coords.coords.longitude)
      .subscribe(resp => {
        this.loading$.next(false);
        this.mySearchResultList$ = of(resp.matchingUserList);
      });
  }

  async addFriend(friendId, firstName) {
    const a = await this.alertController.create({
      header: 'Confirm Request',
      message: `Do you want to add ${firstName} as a friend?`,
      htmlAttributes: {
        color: 'dark'
      },
      buttons:
      [
        {
          text: 'Ok',
          role: 'confirm',
          handler: async (ev) => {
            this.ngZone.run(() => {
              this.loading$.next(true);
            });
            this.friendshipService.addFriend(friendId)
              .pipe(
                catchError((resp) => {
                  this.ngZone.run(() => {
                    this.loading$.next(false);
                  });

                  this.toastService.create({
                    message: `${resp.error.message}`,
                    duration: 2500,
                    position: 'bottom'
                  }).then(t => t.present());

                  return EMPTY;
                }),
                tap(r => {
                  this.toastService.create({
                    message: `Your friend request to ${firstName} has been sent.`,
                    duration: 2500,
                    position: 'bottom'
                  }).then(t => t.present());

                  this.ngZone.run(() => {
                    this.getMyFriends();
                  });
                }),
              ).subscribe();
              return;
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });

    await a.present();

    return;
  }

  setQuote() {
    this.quote$.set(
      RETRY_QUOTES[getRandomInt(0, RETRY_QUOTES.length - 1)]
    );
  }
}

const RETRY_QUOTES = [
  'TRY AGAIN',
];

function normalizeContactImportList(cList) {
  return cList.map(c => ({

  }));
}
