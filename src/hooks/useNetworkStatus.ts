import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Network from 'expo-network';

export interface NetworkStatus {
  /**
   * null  → initial state, not yet determined
   * true  → connected
   * false → no network
   */
  isConnected: boolean | null;
  /** Shorthand: true only when connectivity is definitively false */
  isOffline: boolean;
}

/**
 * Polls device network state via expo-network.
 *
 * expo-network does not expose a subscription/listener API, so we check:
 *   1. On mount (immediate first read)
 *   2. On a 5-second interval (sufficient for monthly-refresh fuel data)
 *   3. On every app foreground event (covers airplane-mode toggle while backgrounded)
 *
 * ACCESS_NETWORK_STATE permission is already declared in app.json
 * under android.permissions — no additional config needed.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const check = useCallback(async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected ?? true);
    } catch {
      // On any error (e.g. permission denied) assume connected to
      // avoid false-positive offline banners disrupting the UI.
      setIsConnected(true);
    }
  }, []);

  useEffect(() => {
    // Immediate check on mount
    check();

    // Periodic polling — expo-network has no event emitter
    const timer = setInterval(check, 5_000);

    // Re-check the moment the app returns from background
    const subscription = AppState.addEventListener(
      'change',
      (next: AppStateStatus) => { if (next === 'active') check(); },
    );

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [check]);

  return {
    isConnected,
    isOffline: isConnected === false,
  };
}
