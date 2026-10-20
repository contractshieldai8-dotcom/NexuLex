/**
 * WAVE MX.2 — Honest Professional vs Pro store-price compare.
 * Reuses MX.1 period helpers. No invented percent. No default Professional price.
 */

import { isAnnualPackage, isMonthlyPackage, pickAnnualCompare } from './annualHighlight';

export function sameStoreCurrency(a, b) {
  const left = String(a?.currencyCode || '').trim();
  const right = String(b?.currencyCode || '').trim();
  return Boolean(left && right && left === right);
}

export function pickSamePeriodPair(proList, professionalList) {
  const pro = Array.isArray(proList) ? proList : [];
  const plus = Array.isArray(professionalList) ? professionalList : [];
  const yearly = { pro: pro.find(isAnnualPackage), professional: plus.find(isAnnualPackage), period: 'yearly' };
  if (yearly.pro && yearly.professional) return yearly;
  const monthly = { pro: pro.find(isMonthlyPackage), professional: plus.find(isMonthlyPackage), period: 'monthly' };
  if (monthly.pro && monthly.professional) return monthly;
  return null;
}

export function pickProfessionalCompare(proList, professionalList) {
  const pair = pickSamePeriodPair(proList, professionalList);
  if (!pair || !sameStoreCurrency(pair.pro, pair.professional)) return null;
  const proPrice = Number(pair.pro.price);
  const professionalPrice = Number(pair.professional.price);
  if (!Number.isFinite(proPrice) || !Number.isFinite(professionalPrice) || proPrice <= 0 || professionalPrice <= 0) return null;
  const extra = professionalPrice - proPrice;
  if (!(extra > 0)) return null;
  const percent = Math.floor((extra / proPrice) * 100);
  if (percent < 1 || percent > 400) return null;
  return {
    period: pair.period,
    extra,
    percent,
    proPrice,
    professionalPrice,
    proPriceString: String(pair.pro.priceString || '').trim(),
    professionalPriceString: String(pair.professional.priceString || '').trim(),
    currency: String(pair.pro.currencyCode || ''),
  };
}

export function assertProfessionalCompareFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`professionalCompare: ${msg}`);
  };
  check(pickProfessionalCompare(
    [{ packageType: 'ANNUAL', price: 84, currencyCode: 'USD', priceString: '$84' }],
    [{ packageType: 'ANNUAL', price: 126, currencyCode: 'USD', priceString: '$126' }],
  )?.percent === 50, '126 vs 84 is 50 more');
  check(pickProfessionalCompare(
    [{ packageType: 'ANNUAL', price: 84, currencyCode: 'USD' }],
    [{ packageType: 'ANNUAL', price: 126, currencyCode: 'EUR' }],
  ) === null, 'mixed currency is not compared');
  check(pickProfessionalCompare(
    [{ packageType: 'MONTHLY', price: 8, currencyCode: 'TRY' }],
    [{ packageType: 'ANNUAL', price: 120, currencyCode: 'TRY' }],
  ) === null, 'different periods are not compared');
  check(pickProfessionalCompare(
    [{ packageType: 'MONTHLY', price: 8, currencyCode: 'TRY', priceString: '8 TL' }],
    [{ packageType: 'MONTHLY', price: 12, currencyCode: 'TRY', priceString: '12 TL' }],
  )?.period === 'monthly', 'monthly pair is used when yearly is missing');
  check(pickProfessionalCompare(
    [
      { packageType: 'MONTHLY', price: 8, currencyCode: 'USD' },
      { packageType: 'ANNUAL', price: 84, currencyCode: 'USD' },
    ],
    [
      { packageType: 'MONTHLY', price: 12, currencyCode: 'USD' },
      { packageType: 'ANNUAL', price: 126, currencyCode: 'USD' },
    ],
  )?.period === 'yearly', 'yearly pair is preferred');
  check(pickProfessionalCompare(
    [{ packageType: 'ANNUAL', price: 84, currencyCode: 'USD' }],
    [{ packageType: 'ANNUAL', price: 80, currencyCode: 'USD' }],
  ) === null, 'professional cheaper than Pro stays silent');
  check(pickProfessionalCompare(
    [{ packageType: 'ANNUAL', price: 10, currencyCode: 'USD' }],
    [{ packageType: 'ANNUAL', price: 60, currencyCode: 'USD' }],
  ) === null, 'extra over 400 stays silent');
  check(pickProfessionalCompare([{ packageType: 'ANNUAL', price: 84, currencyCode: 'USD' }], []) === null, 'missing Professional stays silent');
  check(pickAnnualCompare([
    { packageType: 'MONTHLY', price: 10, currencyCode: 'USD' },
    { packageType: 'ANNUAL', price: 84, currencyCode: 'USD' },
  ])?.percent === 30, 'MX.1 yearly compare stays');
  return { cases };
}
