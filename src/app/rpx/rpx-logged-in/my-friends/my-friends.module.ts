import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MyFriendsComponent} from "./my-friends.component";
import {RouterModule, Routes} from "@angular/router";
import {IonicModule} from "@ionic/angular";
import {HelperModule} from "../../../helpers/helper.module";


const routes: Routes = [
  {path: '', component: MyFriendsComponent}
];

@NgModule({
  declarations: [MyFriendsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    IonicModule,
    HelperModule
  ],
  exports: [MyFriendsComponent],
})
export class MyFriendsModule { }
