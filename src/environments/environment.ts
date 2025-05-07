// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// const ngrok = "https://10a8-2601-586-cd00-7900-e0d9-d96-1e22-b9a6.ngrok-free.app/";
const ngrok = "https://a7df-2601-586-cd00-7900-3810-1223-2002-cf2e.ngrok-free.app/";
// const ngrok = 'https://api.rpx.com/';
// const ngrok = 'http://localhost:8002/';
// const baseUrl = 'https://rpx.com/';
const baseUrl = 'http://10.0.0.250:4200/';

export const environment = {
  production: true,
  staging: false,
  baseUrl,
  googleMapsApiKey: '',
  googlePlacesApiAkey: '',
  mapId: '',
  qrCodeLoyaltyPointsScanBaseUrl: baseUrl + 'loyalty-points',
  qrCodeRewardScanBaseUrl: baseUrl + 'reward',
  publishableStripeKey: '',
  apiEndpoint: `${ngrok}api/`,
  fakeLocation: false,
  myLocX: 25.786286,
  myLocY: -80.186562,
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
