import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoyaltyPointsModule} from '../loyalty-points/loyalty-points.module';
import {RewardMenuModule} from '../reward-menu/reward-menu.module';
import {RouterModule} from '@angular/router';
import {QrModule} from '../qr/qr.module';
import {UserDashboardComponent} from './user-dashboard.component';
import {MeetUpsModule} from "../my-meet-ups/meet-ups.module";

@NgModule({
  declarations: [UserDashboardComponent],
    imports: [
        CommonModule,
        LoyaltyPointsModule,
        RewardMenuModule,
        RouterModule,
        QrModule,
        MeetUpsModule,
    ],
  exports: [UserDashboardComponent],
})
export class UserDashboardModule {}
