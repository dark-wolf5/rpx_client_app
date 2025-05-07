import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MapComponent} from '../rpx/map/map.component';
import {Preferences} from '@capacitor/preferences';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild('appMap') appMap: MapComponent;

  arrowOn = false;
  getStartedPrompt = true;

  constructor(private router: Router) {}

  getStarted() {
    this.getStartedPrompt = false;
  }

  async checkIfLoggedIn() {
    const ret = await Preferences.get({key: 'rpx_loggedIn'});
    const isLoggedIn = ret.value;

    if (isLoggedIn === '1') {
      window.location.href = '/user-home';
    }
  }

  ngOnInit() {
    this.checkIfLoggedIn();
  }
}
