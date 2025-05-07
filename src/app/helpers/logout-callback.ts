import {Preferences} from '@capacitor/preferences';

export const logOutCallback = function (resp: any): void {
  if (resp.success) {
    Preferences.set({
      key: 'rpx_loggedIn',
      value: '0',
    });
    Preferences.set({
      key: 'rpx_userApiKey',
      value: null,
    });
    Preferences.set({
      key: 'rpx_rememberMe',
      value: '0',
    });
    Preferences.set({
      key: 'rpx_rememberMeToken',
      value: null,
    });
    Preferences.set({
      key: 'rpx_userType',
      value: null,
    });

    location.href = '/home';
  }
};
