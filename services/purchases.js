// RevenueCat (react-native-purchases) entegrasyonu.
//
// Native modül gerektirir: Expo Go'da çalışmaz, EAS development/production build
// gerekir. Bu yüzden modül yüklenemediğinde veya API anahtarı tanımlı olmadığında
// servis "kullanılamıyor" durumuna düşer ve uygulama çökmeden çalışmaya devam eder.

import { Platform } from 'react-native';
import { supabase } from './supabase';

// Pro erişimi RevenueCat panelinde bu entitlement adıyla tanımlanmalıdır.
const ENTITLEMENT_ID = 'pro';

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  default: null,
});

let Purchases = null;
let configured = false;
let unavailableReason = null;

function loadModule() {
  if (Purchases || unavailableReason) return Purchases;

  if (!API_KEY) {
    unavailableReason = 'RevenueCat API anahtarı tanımlı değil.';
    return null;
  }

  try {
    // Expo Go'da native modül bulunmadığı için bu çağrı hata verir.
    Purchases = require('react-native-purchases').default;
  } catch (error) {
    unavailableReason = `react-native-purchases yüklenemedi: ${error.message}`;
  }

  return Purchases;
}

export const isPurchasesAvailable = () => Boolean(loadModule());

export const getUnavailableReason = () => unavailableReason;

// Kullanıcı kimliğiyle SDK'yı başlatır; aynı hesap farklı cihazlarda tanınır.
export async function configurePurchases(userId) {
  const sdk = loadModule();
  if (!sdk) return false;

  try {
    if (!configured) {
      await sdk.configure({ apiKey: API_KEY, appUserID: userId || null });
      configured = true;
    } else if (userId) {
      await sdk.logIn(userId);
    }
    return true;
  } catch (error) {
    unavailableReason = error.message;
    console.warn('RevenueCat yapılandırılamadı:', error.message);
    return false;
  }
}

// Mağazadan güncel paketleri (fiyat, dönem) çeker.
export async function fetchOfferings() {
  const sdk = loadModule();
  if (!sdk) return [];

  const offerings = await sdk.getOfferings();
  const packages = offerings?.current?.availablePackages || [];

  return packages.map((pkg) => ({
    identifier: pkg.identifier,
    packageType: pkg.packageType,
    title: pkg.product.title,
    description: pkg.product.description,
    // Mağazadan gelen yerelleştirilmiş fiyat; elle biçimlendirilmez.
    priceString: pkg.product.priceString,
    period: pkg.product.subscriptionPeriod,
    raw: pkg,
  }));
}

const hasProEntitlement = (customerInfo) =>
  Boolean(customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]);

// Satın alma sonrası Supabase profilini Pro'ya çeker.
async function markProfilePro(isPro) {
  const { data } = await supabase.auth.getUser();
  if (!data?.user?.id) return;

  const { error } = await supabase
    .from('profiles')
    .update({ is_pro: isPro })
    .eq('id', data.user.id);

  if (error) console.warn('Pro durumu kaydedilemedi:', error.message);
}

export async function purchasePackage(selectedPackage) {
  const sdk = loadModule();
  if (!sdk) throw new Error(unavailableReason || 'Satın alma kullanılamıyor.');

  const { customerInfo } = await sdk.purchasePackage(selectedPackage.raw);
  const isPro = hasProEntitlement(customerInfo);

  if (isPro) await markProfilePro(true);
  return isPro;
}

export async function restorePurchases() {
  const sdk = loadModule();
  if (!sdk) throw new Error(unavailableReason || 'Satın alma kullanılamıyor.');

  const customerInfo = await sdk.restorePurchases();
  const isPro = hasProEntitlement(customerInfo);

  if (isPro) await markProfilePro(true);
  return isPro;
}

// Kullanıcı iptal ettiğinde hata gösterilmemelidir.
export const isUserCancelled = (error) =>
  Boolean(error?.userCancelled || error?.code === '1' || error?.userInfo?.readableErrorCode === 'PurchaseCancelledError');
