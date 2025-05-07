import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input, NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {Reward} from '../../../models/reward';
import {LoyaltyPointsService} from '../../../services/loyalty-points/loyalty-points.service';
import {
  RewardCreatorService
} from '../../../services/rpx-logged-in/business-menu/reward-creator/reward-creator.service';
import {BehaviorSubject, distinctUntilKeyChanged, ReplaySubject} from 'rxjs';

import {AndroidSettings, IOSSettings, NativeSettings} from 'capacitor-native-settings';
import {Barcode, BarcodeScanner} from "@capacitor-mlkit/barcode-scanning";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {tap} from "rxjs/operators";
import {setValue} from "../loyalty-points/loyalty-points.actions";
import {Store} from "@ngrx/store";
import {Capacitor} from "@capacitor/core";

@Component({
  selector: 'app-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.css', '../reward-menu/reward-menu.component.css'],
})
export class QrComponent implements OnInit {
  @Input() fullScreenWindow = false;

  @Output() closeThisEvt = new EventEmitter();
  @Output() openUserLPBalanceEvt = new EventEmitter();
  @Output() closeQrUserEvt = new EventEmitter();
  @Output() notEnoughLpEvt = new EventEmitter();

  @ViewChild('sbEarnedPoints') sbEarnedPoints: ElementRef;
  @ViewChild('sbSpentPoints') sbSpentPoints: ElementRef;

  userLoyaltyPoints$ = new BehaviorSubject<number>(0);
  dollarValue$ = new BehaviorSubject<number>(0);
  rewardPrompted$ = new BehaviorSubject<boolean>(false);
  qrWidth$ = new BehaviorSubject<number>(0);
  scanSuccess$ = new BehaviorSubject<boolean>(false);
  awarded$ = new BehaviorSubject(false);
  rewarded$ = new BehaviorSubject(false);
  awarded: boolean;
  rewarded: boolean
  reward$ = new BehaviorSubject<Reward>(null);
  pointsCharged$ = new BehaviorSubject<number>(0);
  showEnablePermission$ = new BehaviorSubject<boolean>(false);
  scannedBarcode$ = new ReplaySubject<Barcode>();

  businessLoyaltyPointsForm: UntypedFormGroup;

  constructor(
    private loyaltyPointsService: LoyaltyPointsService,
    private rewardService: RewardCreatorService,
    private store: Store,
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {

    this.awarded$.pipe(
      takeUntilDestroyed(),
      tap(v => {
        this.awarded = v;
        this.changeDetectorRef.markForCheck();
      }),
    ).subscribe();

    this.rewarded$.pipe(
      takeUntilDestroyed(),
      tap(v => {
        this.rewarded = v;
        this.changeDetectorRef.markForCheck();
      }),
    ).subscribe();

    this.scannedBarcode$
      .pipe(
        takeUntilDestroyed(),
        distinctUntilKeyChanged('rawValue'),
        tap((barcode) => {
          // Make all elements in the WebView visible again
          document.querySelector('body').classList.remove('barcode-scanner-active');
          document.querySelector('#scannerMiddle').classList.remove('hidden');

          if (barcode) {
            console.log("The Barcode", barcode);
            this.scanSuccessHandler(barcode.rawValue);
          } else {
            console.log("No Barcode");
            this.scanErrorHandler(barcode.rawValue);
          }
        }),
      )
      .subscribe();
  }

  get f() {
    return this.businessLoyaltyPointsForm.controls;
  }

  addLp(addLpObj) {
    this.loyaltyPointsService.addLoyaltyPoints(addLpObj)
      .subscribe(resp => {
        console.log("Add Loyalty Points Response", resp);
        this.scanSuccessHandlerCb(resp);
        if (resp.success) {
          const loyaltyPointBalance = resp.loyalty_points;
          this.store.dispatch(setValue({loyaltyPointBalance}));
        }
    });
  }

  claimReward(addLpObj) {
    this.rewardService.claimReward(addLpObj, resp => {
      this.claimRewardCb(resp);
    });
  }

  claimRewardCb(resp) {
    if (resp.success) {
      this.rewarded$.next( true);
      this.reward$.next(resp.reward);
      this.changeDetectorRef.markForCheck();
      this.pointsCharged$.next(this.reward$.getValue().point_cost);
      this.sbSpentPoints.nativeElement.style.display = 'block';
    } else {
      confirm(resp.message);
      this.closeQrUser();
    }

    this.scanSuccess$.next(false);
  }

  async checkPermission(): Promise<boolean> {
    // check if user already granted permission
    let status = await BarcodeScanner.checkPermissions();

    console.log('STATUS', status);

    if (status.camera === 'granted') {
      // user granted permission
      return true;
    }

    if (status.camera === 'denied') {
      // user denied permission
      return false;
    }

    if (
      status.camera === 'prompt' ||
      status.camera === 'prompt-with-rationale'
    ) {
      const c = confirm(
        'We need your permission to use your camera to be able to scan barcodes.'
      );

      if (!c) {
        return false;
      }

      // prompt
      status = await BarcodeScanner.requestPermissions();
      if (status.camera === 'granted') {
        return true;
      }
    }

    // user did not grant the permission, so he must have declined the request
    return false;
  }

  scanSuccessHandler(urlString: string) {
    if (this.scanSuccess$.getValue()) {
      return;
    }

    this.scanSuccess$.next(true);

    const url = new URL(urlString);
    const urlParams = new URLSearchParams(url.search);

    const redeemableType = urlParams.get('t');

    const addLpObj = {
      redeemableHash: urlParams.get('r'),
      redeemableType,
    };

    switch (redeemableType) {
      case 'lp':
        this.addLp(addLpObj);
        break;
      case 'claim_reward':
        this.claimReward(addLpObj);
        break;
    }
  }

  async scanSuccessHandlerCb(resp: any) {
    if (resp.success) {
      this.awarded$.next(true);
      this.changeDetectorRef.markForCheck();

      this.userLoyaltyPoints$.next(resp.redeemable.amount);
      this.dollarValue$.next(resp.redeemable.dollar_value);
      this.scanSuccess$.next(true);
    } else {
      // If for some reason the user is not able to redeem the points, you warn
      // them here.
      confirm(resp.message);
      this.scanSuccess$.next(false);
      this.closeQrUser();
    }
  }

  scanErrorHandler(event) {
    // Log the error somewhere.
    console.log('scan failure', event);
  }

  async startQrCodeScanner() {
    this.loyaltyPointsService.getLoyaltyPointBalance();

    this.checkPermission().then(async granted => {
      if (granted) {
        this.showEnablePermission$.next(false);
        document.querySelector('body')?.classList.add('barcode-scanner-active');
        document.querySelector('#scannerMiddle').classList.add('hidden');

        const listener = await BarcodeScanner.addListener(
          'barcodeScanned',
          async result => {
            this.ngZone.run(async () => {
              await listener.remove();
              this.scannedBarcode$.next(result.barcode);
            });
          },
        );

        await BarcodeScanner.startScan();
      } else {
        alert('Please enable camera access to scan rewards.');
        this.showEnablePermission$.next(true);
      }
    });
  }

  closeQr() {
    this.stopScan().then(() => {
      this.rewardPrompted$.next(false);
    });
  }

  closeQrUser() {
    this.stopScan().then(() => {
      this.closeQrUserEvt.emit(null);
    });
  }

  async stopScan(): Promise<void> {
    // Make all elements in the WebView visible again
    document.querySelector('body').classList.remove('barcode-scanner-active');
    document.querySelector('#scannerMiddle').classList.remove('hidden');


    // Remove all listeners
    await BarcodeScanner.removeAllListeners();

    // Stop the barcode scanner
    await BarcodeScanner.stopScan();
  };

  openAppSettings() {
    NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    });
  }

  ngOnInit(): void {
    if (Capacitor.isNativePlatform()) {
      this.qrWidth$.next(250);
    } else {
      this.qrWidth$.next(450);
    }

    this.startQrCodeScanner();
  }
}
