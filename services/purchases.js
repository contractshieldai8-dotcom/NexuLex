// RevenueCat (react-native-purchases) entegrasyonu.
//
// Native modül gerektirir: Expo Go'da çalışmaz, EAS development/production build
// gerekir. Bu yüzden modül yüklenemediğinde veya API anahtarı tanımlı olmadığında
// servis "kullanılamıyor" durumuna düşer ve uygulama çökmeden çalışmaya devam eder.

import { Platform } from 'react-native';
import { supabase } from './supabase';
import { PROFESSIONAL_OFFERING_ID, planFromEntitlementIds } from '../utils/plan';

// RevenueCat panelinde "pro" ve "professional" entitlement'ları tanımlanmalıdır; Professional ürünleri
// "professional" offering'inde satılır. Plan sunucuda yalnızca sync-entitlement ile yazılır.
const SYNC_FUNCTION = 'sync-entitlement';

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

// Hesap silme sonrası: sonraki hesap önceki RevenueCat müşteri kimliğini / yetkisini devralmasın.
// Anonim kullanıcı, yapılandırılmamış SDK veya çevrimdışı durumda hata yutulur.
export async function logOutPurchases() {
  const sdk = loadModule();
  if (!sdk) return false;

  try {
    const ready = configured || (await sdk.isConfigured?.().catch(() => false));
    if (!ready) return false;
    await sdk.logOut();
    return true;
  } catch (error) {
    console.log('RevenueCat oturumu kapatılamadı:', error?.message);
    return false;
  }
}

// Mağazadan paketleri (fiyat, dönem) çeker: Pro güncel offering'den, Professional kendi offering'inden.
export async function fetchOfferings(tier = 'pro') {
  const sdk = loadModule();
  if (!sdk) return [];

  const offerings = await sdk.getOfferings();
  const offering = tier === 'professional' ? offerings?.all?.[PROFESSIONAL_OFFERING_ID] : offerings?.current;
  const packages = offering?.availablePackages || [];

  return packages.map((pkg) => ({
    identifier: pkg.identifier,
    packageType: pkg.packageType,
    title: pkg.product.title,
    description: pkg.product.description,
    // Mağazadan gelen yerelleştirilmiş fiyat; elle biçimlendirilmez.
    priceString: pkg.product.priceString,
    price: pkg.product.price,
    currencyCode: pkg.product.currencyCode,
    period: pkg.product.subscriptionPeriod,
    raw: pkg,
  }));
}

const planFromCustomerInfo = (customerInfo) =>
  planFromEntitlementIds(Object.keys(customerInfo?.entitlements?.active || {}));

// Sunucu RevenueCat'e sorup profiles.plan / is_pro alanlarını yazar. Başarısızsa null döner (çökme yok).
export async function syncEntitlement() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) return null;
    const response = await fetch(`${String(url).replace(/\/+$/, '')}/functions/v1/${SYNC_FUNCTION}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', apikey: anonKey, Authorization: `Bearer ${token}` },
      body: '{}',
    });
    if (!response.ok) return null;
    const payload = await response.json().catch(() => null);
    return payload?.plan ? { plan: payload.plan, expiresAt: payload.expiresAt || null } : null;
  } catch (error) {
    console.log('Plan eşitlenemedi:', error?.message);
    return null;
  }
}

// Dönen değer: { plan: 'free' | 'pro' | 'professional', synced }.
// synced=false ise mağaza satın almayı onayladı ama sunucu henüz eşitlenemedi.
async function settle(customerInfo) {
  const plan = planFromCustomerInfo(customerInfo);
  if (plan === 'free') return { plan, synced: true };
  const synced = await syncEntitlement();
  return { plan, synced: synced?.plan === plan };
}

// Google Play otherwise starts a second subscription: Pro → Professional must replace the Pro product.
// iOS upgrades inside one subscription group on its own, so both tiers must share that group.
async function upgradeChangeInfo(sdk, tier) {
  if (Platform.OS !== 'android' || tier !== 'professional') return null;
  try {
    const info = await sdk.getCustomerInfo();
    const active = info?.entitlements?.active || {};
    const oldProductIdentifier = active.pro?.productIdentifier;
    if (!oldProductIdentifier || active.professional) return null;
    const modes = require('react-native-purchases').STORE_REPLACEMENT_MODE;
    return { oldProductIdentifier, replacementMode: modes?.WITH_TIME_PRORATION || 'WITH_TIME_PRORATION' };
  } catch {
    return null;
  }
}

export async function purchasePackage(selectedPackage, { tier = 'pro' } = {}) {
  const sdk = loadModule();
  if (!sdk) throw new Error(unavailableReason || 'Satın alma kullanılamıyor.');

  const change = await upgradeChangeInfo(sdk, tier);
  const { customerInfo } = change
    ? await sdk.purchasePackage(selectedPackage.raw, null, change)
    : await sdk.purchasePackage(selectedPackage.raw);
  return settle(customerInfo);
}

export async function restorePurchases() {
  const sdk = loadModule();
  if (!sdk) throw new Error(unavailableReason || 'Satın alma kullanılamıyor.');

  const customerInfo = await sdk.restorePurchases();
  return settle(customerInfo);
}

// Kullanıcı iptal ettiğinde hata gösterilmemelidir.
export const isUserCancelled = (error) =>
  Boolean(error?.userCancelled || error?.code === '1' || error?.userInfo?.readableErrorCode === 'PurchaseCancelledError');
