import { apiFetch, openvanFetch, ENDPOINTS, type OpenVanCountryPrice } from './client';
import type {
  ApiCurrentResponse,
  ApiHistoryResponse,
  FuelType,
  MonthlySnapshot,
} from '../types/fuel';
import { FUEL_TYPES } from '../types/fuel';
import { cacheSnapshots, loadCachedCurrent, loadCachedHistory } from '../db/fuelCache';

// ─── Response normalisation ───────────────────────────────────────────────────

function normalisePrices(raw: Record<string, number>): Record<FuelType, number> {
  const result = {} as Record<FuelType, number>;
  for (const ft of FUEL_TYPES) {
    result[ft] = raw[ft] ?? 0;
  }
  return result;
}

function toYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7); // "YYYY-MM-DD" → "YYYY-MM"
}

// ─── OpenVan.camp fallback normalisation ──────────────────────────────────────
// OpenVan provides a single gasoline and diesel price for SA — no 95/93 split
// or inland/coastal distinction. Both grades/zones receive the same value.
// This is noted in the UI via the `isFallback` flag on MonthlySnapshot.

function normaliseOpenVanPrices(country: OpenVanCountryPrice): Record<FuelType, number> {
  // OpenVan prices are in local currency per litre (ZAR/L for SA).
  // Primary API uses cents per litre — convert by multiplying by 100.
  const gasolineCents = country.prices.gasoline != null ? Math.round(country.prices.gasoline * 100) : 0;
  const dieselCents   = country.prices.diesel   != null ? Math.round(country.prices.diesel   * 100) : 0;

  return {
    '95_ULP':        gasolineCents,
    '93_ULP':        gasolineCents,
    'DIESEL_INLAND': dieselCents,
    'DIESEL_COASTAL':dieselCents,
  };
}

function openVanToSnapshot(country: OpenVanCountryPrice): MonthlySnapshot {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return {
    month,
    effectiveDate: country.updated_at?.slice(0, 10) ?? month + '-01',
    prices: normaliseOpenVanPrices(country),
    isFallback: true,
  };
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Fetch the most recent (current month) fuel prices.
 * Falls back to OpenVan.camp if the primary API fails.
 */
export async function fetchCurrentPrices(signal?: AbortSignal): Promise<MonthlySnapshot> {
  try {
    const data = await apiFetch<ApiCurrentResponse>(ENDPOINTS.current, { signal });
    const snapshot: MonthlySnapshot = {
      month: toYearMonth(data.effectiveDate),
      effectiveDate: data.effectiveDate,
      prices: normalisePrices(data.prices),
      isFallback: false,
    };
    cacheSnapshots([snapshot]).catch(() => {});
    return snapshot;
  } catch {
    const country = await openvanFetch(signal);
    if (country) {
      const snapshot = openVanToSnapshot(country);
      cacheSnapshots([snapshot]).catch(() => {});
      return snapshot;
    }
    const cached = await loadCachedCurrent();
    if (cached) return cached;
    throw new Error('Both APIs are unavailable and no cached data exists.');
  }
}

/**
 * Fetch monthly price history from January 2024 to present.
 * Falls back to OpenVan.camp (current prices only — no history available from fallback).
 */
export async function fetchPriceHistory(
  from: string = '2024-01',
  signal?: AbortSignal,
): Promise<MonthlySnapshot[]> {
  try {
    const data = await apiFetch<ApiHistoryResponse>(ENDPOINTS.history, {
      params: { from },
      signal,
    });
    const snapshots = data.data.map(item => ({
      month: item.month ?? toYearMonth(item.effectiveDate),
      effectiveDate: item.effectiveDate,
      prices: normalisePrices(item.prices),
      isFallback: false as const,
    }));
    cacheSnapshots(snapshots).catch(() => {});
    return snapshots;
  } catch {
    // OpenVan has no history endpoint — return current snapshot as single data point.
    const country = await openvanFetch(signal);
    if (country) {
      const snapshot = openVanToSnapshot(country);
      cacheSnapshots([snapshot]).catch(() => {});
      return [snapshot];
    }
    const cached = await loadCachedHistory(from);
    if (cached.length > 0) return cached;
    throw new Error('Both APIs are unavailable and no cached data exists.');
  }
}

// ─── Derived helpers used by UI ───────────────────────────────────────────────

/** Convert cents per litre to a formatted Rand string: 2345 → "R23.45" */
export function formatPrice(cents: number): string {
  if (!cents || cents <= 0) return 'N/A';
  return `R${(cents / 100).toFixed(2)}`;
}

/** Month-over-month delta in cents. Positive = more expensive. */
export function priceDelta(current: number, previous: number): number {
  return current - previous;
}

/** Format a price delta for display: +15c, -8c */
export function formatDelta(deltaCents: number): string {
  const sign = deltaCents >= 0 ? '+' : '';
  return `${sign}${deltaCents}c/L`;
}
