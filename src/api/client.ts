/**
 * SA Fuel Price API client
 *
 * PRIMARY  → https://fuelpriceapi.co.za/api
 *   Public REST, no key required. SA-specific: 95 ULP, 93 ULP, Diesel Inland/Coastal.
 *   Updated first Wednesday of each month (DoE cycle). Jan 2024 → present.
 *   GET /current               → ApiCurrentResponse
 *   GET /history?from=YYYY-MM  → ApiHistoryResponse
 *
 * FALLBACK → https://openvan.camp/api/fuel/prices
 *   Free public REST, no key, CC BY 4.0. 120+ countries incl. SA.
 *   Weekly updates from official government sources. TTL 6h — poll ≥10 min apart.
 *   ⚠ Limitation: OpenVan does not split 95/93 ULP or inland/coastal diesel.
 *     Fallback maps gasoline → both ULP grades, diesel → both zones (same price).
 */

export const API_CONFIG = {
  BASE_URL:   'https://fuelpriceapi.co.za/api',
  TIMEOUT_MS: 10_000,
} as const;

export const OPENVAN_CONFIG = {
  BASE_URL:      'https://openvan.camp',
  PRICES_PATH:   '/api/fuel/prices',
  TIMEOUT_MS:    10_000,
  SA_COUNTRY:    'ZA',
} as const;

export const ENDPOINTS = {
  current: '/current',
  history: '/history',
} as const;

// ─── Shared fetch helper ──────────────────────────────────────────────────────

interface FetchOptions {
  params?: Record<string, string>;
  signal?: AbortSignal;
}

async function doFetch<T>(baseUrl: string, path: string, options: FetchOptions, timeoutMs: number): Promise<T> {
  const url = new URL(baseUrl + path);

  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const signal = options.signal ?? controller.signal;

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out');
    }
    throw new ApiError(0, 'Network error — check your connection');
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Primary API fetch ────────────────────────────────────────────────────────

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  return doFetch<T>(API_CONFIG.BASE_URL, endpoint, options, API_CONFIG.TIMEOUT_MS);
}

// ─── Fallback API fetch (OpenVan.camp) ────────────────────────────────────────

export interface OpenVanCountryPrice {
  country_code: string;
  country_name: string;
  currency:     string;
  unit:         string;
  prices: {
    gasoline: number | null;
    diesel:   number | null;
    lpg:      number | null;
    e85:      number | null;
    premium:  number | null;
  };
  updated_at: string;
}

export interface OpenVanResponse {
  success: boolean;
  data:    OpenVanCountryPrice[];
}

export async function openvanFetch(signal?: AbortSignal): Promise<OpenVanCountryPrice | null> {
  const result = await doFetch<OpenVanResponse>(
    OPENVAN_CONFIG.BASE_URL,
    OPENVAN_CONFIG.PRICES_PATH,
    { signal },
    OPENVAN_CONFIG.TIMEOUT_MS,
  );

  if (!result.success || !Array.isArray(result.data)) return null;
  return result.data.find(c => c.country_code === OPENVAN_CONFIG.SA_COUNTRY) ?? null;
}

// ─── Typed error ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError(): boolean { return this.statusCode === 0; }
  get isTimeout(): boolean      { return this.statusCode === 408; }
  get isServerError(): boolean  { return this.statusCode >= 500; }
}
