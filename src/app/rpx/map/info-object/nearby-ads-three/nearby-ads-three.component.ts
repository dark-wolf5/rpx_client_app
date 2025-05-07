import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Ad} from "../../../../models/ad";
import {Capacitor} from "@capacitor/core";

@Component({
  selector: 'app-nearby-ads-three',
  templateUrl: './nearby-ads-three.component.html',
  styleUrls: ['./nearby-ads-three.component.css'],
})
export class NearbyAdsThreeComponent implements OnInit {
  @Input() lat: number = null;
  @Input() lng: number = null;
  @Input() set accountType(accountType: number | string) {
    console.log("Account Type", accountType);
    this.accountType$.next(accountType);
  }
  @Input() eventsClassification: number = null;
  @Input() categories: any;

  accountType$: BehaviorSubject<number | string | null> = new BehaviorSubject(
    null
  );
  public adList: Ad[];

  constructor() {}

  ngOnInit(): void {
    if (Capacitor.isNativePlatform()) {
      this.adList = [new Ad()];
    } else {
      this.adList = [new Ad(), new Ad(), new Ad()];
    }
  }
}
