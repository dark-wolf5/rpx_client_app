import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ForgotPasswordComponent} from './forgot-password.component';
import {RouterModule, Routes} from '@angular/router';
import {HelperModule} from '../../../helpers/helper.module';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IonicModule} from '@ionic/angular';
import {NgxMaskDirective} from "ngx-mask";

const routes: Routes = [{path: '', component: ForgotPasswordComponent}];

@NgModule({
  declarations: [ForgotPasswordComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HelperModule,
        RouterModule.forChild(routes),
        IonicModule,
        NgxMaskDirective,
    ],
  exports: [ForgotPasswordComponent],
  providers: [],
})
export class ForgotPasswordModule {}
