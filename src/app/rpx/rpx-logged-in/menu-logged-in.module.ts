import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {RpxPipesModule} from '../../rpx-pipes/rpx-pipes.module';
import {RouterModule, Routes} from '@angular/router';
import {HelperModule} from '../../helpers/helper.module';
import {MapModule} from '../map/map.module';
import {IonicModule} from '@ionic/angular';
import {MenuLoggedInComponent} from "./menu-logged-in.component";
import {MenuLoggedInBarComponent} from "./menu-logged-in-bar/menu-logged-in-bar.component";

const routes: Routes = [
  {path: '', component: MenuLoggedInComponent}
];

@NgModule({
  declarations: [
    MenuLoggedInComponent,
    MenuLoggedInBarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RpxPipesModule,
    HelperModule,
    MapModule,
    RouterModule.forChild(routes),
    IonicModule.forRoot(),
    //EventMenuModule
  ],
  exports: [],
})
export class MenuLoggedInModule {}
