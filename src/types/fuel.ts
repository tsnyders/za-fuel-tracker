// ─── Fuel type identifiers ────────────────────────────────────────────────────

export type FuelType = '95_ULP' | '93_ULP' | 'DIESEL_INLAND' | 'DIESEL_COASTAL';

export const FUEL_TYPES: FuelType[] = [
  '95_ULP',
  '93_ULP',
  'DIESEL_INLAND',
  'DIESEL_COASTAL',
];

export const FUEL_LABELS: Record<FuelType, string> = {
  '95_ULP':        '95 ULP',
  '93_ULP':        '93 ULP',
  'DIESEL_INLAND': 'Diesel Inland',
  'DIESEL_COASTAL':'Diesel Coastal',
};

export const FUEL_DESCRIPTIONS: Record<FuelType, string> = {
  '95_ULP':        'Unleaded 95 — inland zones',
  '93_ULP':        'Unleaded 93 — inland zones',
  'DIESEL_INLAND': 'Diesel 0.05% — inland (Gauteng & inland provinces)',
  'DIESEL_COASTAL':'Diesel 0.05% — coastal (Cape Town, Durban, Port Elizabeth)',
};

// ─── Price data shapes ────────────────────────────────────────────────────────

/** A single monthly price record for one fuel type. Prices in cents per litre. */
export interface FuelPrice {
  fuelType: FuelType;
  /** Price in cents per litre (e.g. 2345 = R23.45/L) */
  priceInCents: number;
  /** ISO date string for the first day of the effective month, e.g. "2024-01-03" */
  effectiveDate: string;
  /** Derived "YYYY-MM" key for grouping */
  month: string;
}

/** All four fuel prices for a single calendar month. */
export interface MonthlySnapshot {
  /** "YYYY-MM" */
  month: string;
  /** ISO date of the DoE announcement for this month */
  effectiveDate: string;
  prices: Record<FuelType, number>;
  /** True when data came from OpenVan.camp fallback — grades/zones are undifferentiated */
  isFallback?: boolean;
}

// ─── API response shapes ──────────────────────────────────────────────────────
// Adjust if actual API returns a different envelope.

export interface ApiCurrentResponse {
  effectiveDate: string;
  prices: Record<string, number>;  // key = FuelType, value = cents per litre
}

export interface ApiHistoryResponse {
  data: Array<{
    month: string;
    effectiveDate: string;
    prices: Record<string, number>;
  }>;
}

// ─── Navigation param lists ───────────────────────────────────────────────────

export type RootStackParamList = {
  Tabs: undefined;
  Detail: { fuelType: FuelType };
};

export type TabParamList = {
  Home: undefined;
  History: undefined;
};
