import type { FuelType } from '../types/fuel';

/**
 * Centralised React Query key factory.
 * Using this factory ensures no key collisions and makes cache invalidation explicit.
 */
export const queryKeys = {
  all: ['fuel'] as const,

  current: () => [...queryKeys.all, 'current'] as const,

  history: {
    all: () => [...queryKeys.all, 'history'] as const,
    from: (from: string) => [...queryKeys.history.all(), from] as const,
  },

  detail: (fuelType: FuelType) => [...queryKeys.all, 'detail', fuelType] as const,
} as const;
