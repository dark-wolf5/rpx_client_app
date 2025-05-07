import {Component, HostListener, ChangeDetectionStrategy} from '@angular/core';
import {VersionCheckService} from './services/version-check.service';
import {environment} from '../environments/environment.prod';
import {RpxMetaService} from './services/meta/rpx-meta.service';
import {
  rpxMetaDescription,
  rpxMetaTitle,
  rpxMetaImage,
} from './constants/rpx';

const RPX_META_DESCRIPTION = rpxMetaDescription;
const RPX_META_TITLE = rpxMetaTitle;
const RPX_META_IMAGE = rpxMetaImage;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'rpx';

  constructor(
    private versionCheckService: VersionCheckService,
    private rpxMetaService: RpxMetaService
  ) {}

  @HostListener('window:load', [])
  onWindowLoaded() {
    this.versionCheckService.initVersionCheck(environment.versionCheckURL);
  }

  ngOnInit() {
    this.rpxMetaService.setTitle(RPX_META_TITLE);
    this.rpxMetaService.setDescription(RPX_META_DESCRIPTION);
    this.rpxMetaService.setImage(RPX_META_IMAGE);
  }
}
