import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {MapComponent} from '../map/map.component';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'app-menu-logged-in',
  templateUrl: './menu-logged-in.component.html',
  styleUrls: ['../menu.component.css', './menu-logged-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuLoggedInComponent implements AfterViewInit {
  @ViewChild('rpxMainMenu') rpxMainMenu: ElementRef;
  @ViewChild('rpxMap') rpxMap: MapComponent;

  mapApp$ = new BehaviorSubject<boolean>(false);
  business = false;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    this.mapApp$.next(true);
    this.changeDetectorRef.detectChanges();
  }

  toggleLoyaltyPoints() {
    this.rpxMap.goToLp();
  }

  toggleQRScanner() {
    this.rpxMap.goToQrCode();
  }

  spawnCategories(evt: {category: number}): void {
    this.rpxMap.spawnCategories(evt.category);
  }

  closeMapApp() {
    this.mapApp$.next(false);
  }
}
