import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MyMeetUpsComponent} from "./my-meet-ups.component";
import {IonicModule} from "@ionic/angular";
import {MyMeetUpListingComponent} from "./my-meet-up-listing/my-meet-up-listing.component";
import {MeetUpWizardComponent} from "./meet-up-wizard/meet-up-wizard.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HelperModule} from "../../../helpers/helper.module";
import {RpxPipesModule} from "../../../rpx-pipes/rpx-pipes.module";

@NgModule({
  declarations: [MyMeetUpsComponent, MyMeetUpListingComponent, MeetUpWizardComponent],
  imports: [
    IonicModule,
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    HelperModule,
    ReactiveFormsModule,
    RpxPipesModule,
  ],
  exports: [
    MyMeetUpsComponent
  ],
})
export class MeetUpsModule { }
