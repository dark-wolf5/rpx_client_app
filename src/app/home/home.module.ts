import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home.component';
import {RouterModule, Routes} from '@angular/router';
import {RpxPipesModule} from '../rpx-pipes/rpx-pipes.module';
import {MapModule} from '../rpx/map/map.module';
import {HelperModule} from '../helpers/helper.module';
import {MenuLoggedOutModule} from '../rpx/rpx-logged-out/menu-logged-out.module';
import {WelcomeModule} from '../rpx/welcome/welcome.module';
import {IonicModule} from '@ionic/angular';

const routes: Routes = [{path: '', component: HomeComponent}];

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    MenuLoggedOutModule,
    RpxPipesModule,
    MapModule,
    HelperModule,
    WelcomeModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  exports: [HomeComponent, MenuLoggedOutModule],
})
export class HomeModule {}
