import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AcceptMuiInvitesComponent} from "./accept-mui-invites.component";
import {IonicModule} from "@ionic/angular";
import {RpxPipesModule} from "../../rpx-pipes/rpx-pipes.module";

@NgModule({
  declarations: [
    AcceptMuiInvitesComponent
  ],
  imports: [
    IonicModule,
    RpxPipesModule,
    CommonModule,
  ],
  exports: [
    AcceptMuiInvitesComponent
  ]
})
export class AcceptMuiInvitesModule { }
