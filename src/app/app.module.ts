import {NgModule} from '@angular/core';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {AppComponent} from './app.component';
import {HomeModule} from './home/home.module';
import {UrlSanitizerPipe} from './pipes/url-sanitizer.pipe';
import {VersionCheckService} from './services/version-check.service';
import {HelperModule} from './helpers/helper.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TokenInterceptor} from './helpers/token-interceptor/token-interceptor.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UserauthService} from './services/userauth.service';
import {StoreModule} from '@ngrx/store';
import {loyaltyPointsReducer} from './rpx/rpx-logged-in/loyalty-points/loyalty-points.reducer';
import {RouteReuseStrategy} from '@angular/router';
import {MyList} from "./rpx/rpx-logged-in/my-list/my-list.component";
import {MenuLoggedInModule} from "./rpx/rpx-logged-in/menu-logged-in.module";
import {AcceptMuiInvitesModule} from "./pages/accept-mui-invites/accept-mui-invites.module";

@NgModule({
  declarations: [AppComponent, UrlSanitizerPipe, MyList],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    HomeModule,
    MenuLoggedInModule,
    HelperModule,
    AcceptMuiInvitesModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({
      loyaltyPoints: loyaltyPointsReducer,
    }),
    BrowserModule,
    IonicModule.forRoot(),
  ],
  providers: [
    VersionCheckService,
    UserauthService,
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true},
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
