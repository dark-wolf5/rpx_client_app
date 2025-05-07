import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {QrComponent} from './qr.component';
import {NgxMaskDirective, NgxMaskPipe, IConfig, provideNgxMask} from 'ngx-mask';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RewardMenuModule} from '../reward-menu/reward-menu.module';
import {IonicModule} from "@ionic/angular";

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [QrComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RewardMenuModule,
        FormsModule,
        NgxMaskDirective,
        NgxMaskPipe,
        IonicModule,
    ],
  exports: [QrComponent],
  providers: [provideNgxMask()],
})
export class QrModule {}
