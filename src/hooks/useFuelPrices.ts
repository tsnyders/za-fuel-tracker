import { useQuery } from '@tanstack/react-query';
import { fetchCurrentPrices, fetchPriceHistory } from '../api/fuelApi';
import { queryKeys } from '../api/queryKeys';
import type { FuelType, MonthlySnapshot } from '../types/fuel';

const STALE_MS  = 60 * 60 * 1000;   // 1 hour — prices update monthly, no need to re-fetch often
const RETRY_COUNT = 2;

// ─── Current month prices ─────────────────────────────────────────────────────

export function useCurrentPrices() {
  return useQuery({
    queryKey: queryKeys.current(),
    queryFn: ({ signal }) => fetchCurrentPrices(signal),
    staleTime: STALE_MS,
    retry: RETRY_COUNT,
  });
}

// ─── Full history (Jan 2024 → present) ───────────────────────────────────────

export function usePriceHistory(from: string = '2024-01') {
  return useQuery({
    queryKey: queryKeys.history.from(from),
    queryFn: ({ signal }) => fetchPriceHistory(from, signal),
    staleTime: STALE_MS,
    retry: RETRY_COUNT,
  });
}

// ─── Single fuel type detail ──────────────────────────────────────────────────

export function useFuelTypeHistory(fuelType: FuelType) {
  const query = usePriceHistory();

  const seriesData: Array<{ month: string; price: number }> =
    (query.data ?? []).map((snapshot: MonthlySnapshot) => ({
      month: snapshot.month,
      price: snapshot.prices[fuelType] ?? 0,
    }));

  return {
    ...query,
    data: seriesData,
  };
}
