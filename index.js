import './utils/webcrypto';
import './i18n';
import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync().catch(() => {});
import { registerRootComponent } from 'expo';
import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';

// Native olmayan ortamlarda kalan gürültülü uyarılar sarı kutuya düşmesin.
LogBox.ignoreLogs([
  'WebCrypto API is not supported',
  'Profil senkronizasyonu başarısız',
  'ExpoPushTokenManager',
  'Cannot find native module',
]);

// SafeAreaView ve useSafeAreaInsets'in doğru inset değerlerini okuyabilmesi için
// tüm ağaç SafeAreaProvider ile sarmalanır.
function Root() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => Root);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);
