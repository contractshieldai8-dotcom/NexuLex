/**
 * WAVE MX.1 — Honest yearly highlight from store prices only.
 * No default percentage. No savings copy when monthly or yearly is missing.
 */

export function isAnnualPackage(pkg) {
  return /ANNUAL|YEARLY/i.test(String(pkg?.packageType || ''));
}

export function isMonthlyPackage(pkg) {
  const type = String(pkg?.packageType || '');
  if (isAnnualPackage(pkg)) return false;
  return /MONTHLY/i.test(type) && !/TWO_MONTH|THREE_MONTH|SIX_MONTH/i.test(type);
}

export function annualSavings(monthly, annual) {
  const monthPrice = Number(monthly?.price);
  const yearPrice = Number(annual?.price);
  if (!Number.isFinite(monthPrice) || !Number.isFinite(yearPrice) || monthPrice <= 0 || yearPrice <= 0) return null;
  const monthCurrency = String(monthly?.currencyCode || '').trim();
  const yearCurrency = String(annual?.currencyCode || '').trim();
  if (monthCurrency && yearCurrency && monthCurrency !== yearCurrency) return null;
  const twelve = monthPrice * 12;
  const saved = twelve - yearPrice;
  if (!(saved > 0)) return null;
  const percent = Math.floor((saved / twelve) * 100);
  if (percent < 1 || percent > 80) return null;
  return { saved, percent, twelve, yearPrice, currency: yearCurrency || monthCurrency || '' };
}

export function pickAnnualCompare(packages) {
  const list = Array.isArray(packages) ? packages : [];
  return annualSavings(list.find(isMonthlyPackage), list.find(isAnnualPackage));
}

export function assertAnnualHighlightFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`annualHighlight: ${msg}`);
  };
  check(isAnnualPackage({ packageType: 'ANNUAL' }) && isMonthlyPackage({ packageType: 'MONTHLY' }), 'annual and monthly types');
  check(!isMonthlyPackage({ packageType: 'ANNUAL' }) && !isMonthlyPackage({ packageType: 'SIX_MONTH' }), 'yearly and six-month are not monthly');
  check(annualSavings({ price: 10, currencyCode: 'USD' }, { price: 84, currencyCode: 'USD' })?.percent === 30, '10 x 12 vs 84 is 30');
  check(annualSavings({ price: 10, currencyCode: 'USD' }, { price: 120, currencyCode: 'USD' }) === null, 'no savings when yearly equals twelve months');
  check(annualSavings({ price: 10, currencyCode: 'USD' }, { price: 84, currencyCode: 'EUR' }) === null, 'mixed currency is not compared');
  check(annualSavings({ price: 10 }, { price: 0 }) === null && annualSavings(null, { price: 84 }) === null, 'missing or zero prices stay silent');
  check(pickAnnualCompare([
    { packageType: 'MONTHLY', price: 8, currencyCode: 'TRY' },
    { packageType: 'ANNUAL', price: 72, currencyCode: 'TRY' },
  ])?.percent === 25, 'package list uses store numbers only');
  check(pickAnnualCompare([{ packageType: 'ANNUAL', price: 72, currencyCode: 'TRY' }]) === null, 'yearly alone has no invented percent');
  return { cases };
}
