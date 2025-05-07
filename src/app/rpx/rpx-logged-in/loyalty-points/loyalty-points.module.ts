import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoyaltyPointsComponent} from './loyalty-points.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IConfig, NgxMaskDirective, NgxMaskPipe, provideNgxMask} from 'ngx-mask';
import {HelperModule} from '../../../helpers/helper.module';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [LoyaltyPointsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    HelperModule,
  ],
  exports: [LoyaltyPointsComponent],
  providers: [provideNgxMask()],
})
export class LoyaltyPointsModule {}
