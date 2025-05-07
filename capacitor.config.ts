import {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rpx.home',
  appName: 'Rpx',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    // url: 'http://10.0.0.250:4200',
    // cleartext: true,
  },
};

export default config;
