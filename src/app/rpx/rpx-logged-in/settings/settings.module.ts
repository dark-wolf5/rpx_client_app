import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {IConfig, NgxMaskDirective, NgxMaskPipe, provideNgxMask} from 'ngx-mask';
import {SettingsComponent} from './settings.component';
import {HelperModule} from '../../../helpers/helper.module';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {IonicModule} from "@ionic/angular";

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

const routes: Routes = [
  {path: '', component: SettingsComponent}
];

@NgModule({
  declarations: [SettingsComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        HelperModule,
        RouterModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatDialogModule,
        NgxMaskDirective,
        NgxMaskPipe,
        MatSlideToggleModule,
        RouterModule.forChild(routes),
        IonicModule,
    ],
  exports: [SettingsComponent],
  providers: [provideNgxMask()],
})
export class SettingsModule {}
