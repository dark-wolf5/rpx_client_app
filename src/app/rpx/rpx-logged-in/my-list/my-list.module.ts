import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {RpxPipesModule} from '../../../rpx-pipes/rpx-pipes.module';
import {HelperModule} from '../../../helpers/helper.module';
import {BalancesModule} from './balances/balances.module';
import {RedeemedModule} from './redeemed/redeemed.module';
import {RedeemableModule} from './redeemable/redeemable.module';
import {LedgerModule} from './ledger/ledger.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RpxPipesModule,
    HelperModule,
    BalancesModule,
    RedeemedModule,
    RedeemableModule,
    LedgerModule,
    IonicModule,
  ],
  exports: [],
})
export class MyListModule {}
