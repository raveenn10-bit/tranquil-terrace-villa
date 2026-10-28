/**
 * Currency management for Tranquil Terrace Galle.
 * Base currency: LKR (Sri Lankan Rupee)
 * Secondary currency: USD (US Dollar)
 */

export const BASE_CURRENCY = "LKR" as const;
export const SECONDARY_CURRENCY = "USD" as const;

/**
 * Benchmark benchmark exchange rate: 1 USD ~ 308 LKR.
 * Caches exchange rate with fallback when offline.
 */
export const DEFAULT_USD_LKR_RATE = 308;

let cachedRate: number = DEFAULT_USD_LKR_RATE;
let lastCacheUpdate: string = new Date().toISOString();

export interface ExchangeRatesInfo {
  base: typeof BASE_CURRENCY;
  secondary: typeof SECONDARY_CURRENCY;
  USD: number; // 1 USD in LKR, e.g. 308
  usdToLkr: number;
  lkrToUsd: number;
  updated: string;
}

/**
 * Returns the current exchange rates object.
 */
export function getExchangeRates(): ExchangeRatesInfo {
  return {
    base: BASE_CURRENCY,
    secondary: SECONDARY_CURRENCY,
    USD: cachedRate,
    usdToLkr: cachedRate,
    lkrToUsd: 1 / cachedRate,
    updated: lastCacheUpdate,
  };
}

/**
 * Allows updating or mocking the cached USD-to-LKR rate.
 */
export function setCachedExchangeRate(rate: number): void {
  if (rate > 0) {
    cachedRate = rate;
    lastCacheUpdate = new Date().toISOString();
  }
}

/**
 * Converts LKR amount to USD.
 *
 * @param lkrAmount Amount in Sri Lankan Rupees.
 * @param rate Optional custom USD/LKR exchange rate (default: cached benchmark 308).
 * @returns USD amount in decimal.
 */
export function convertLkrToUsd(lkrAmount: number, rate = cachedRate): number {
  if (!rate || rate <= 0) return 0;
  return lkrAmount / rate;
}

/**
 * Converts USD amount to LKR.
 *
 * @param usdAmount Amount in US Dollars.
 * @param rate Optional custom USD/LKR exchange rate (default: cached benchmark 308).
 * @returns LKR amount rounded to nearest rupee.
 */
export function convertUsdToLkr(usdAmount: number, rate = cachedRate): number {
  return Math.round(usdAmount * rate);
}

/**
 * Formats an amount in Sri Lankan Rupees (e.g. "LKR 12,500").
 *
 * @param amount Amount in LKR.
 * @returns Formatted string with "LKR " prefix and comma-separated thousands.
 */
export function formatLKR(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat("en-LK").format(rounded);
  return `LKR ${formatted}`;
}

/**
 * Formats an LKR amount converted to USD (e.g. "$41").
 *
 * @param lkrAmount Amount in LKR.
 * @param rate Optional custom exchange rate.
 * @returns Formatted USD string prefixed with "$".
 */
export function formatUSD(lkrAmount: number, rate = cachedRate): string {
  const usd = convertLkrToUsd(lkrAmount, rate);
  const rounded = Math.round(usd);
  const formatted = new Intl.NumberFormat("en-US").format(rounded);
  return `$${formatted}`;
}

/**
 * Formats dual currency display for packages (e.g. "LKR 12,500 (~$41)").
 */
export function formatDualCurrency(lkrAmount: number, rate = cachedRate): string {
  return `${formatLKR(lkrAmount)} (~${formatUSD(lkrAmount, rate)})`;
}
