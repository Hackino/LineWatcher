import { create } from 'zustand';
import type { UserData } from '@core/model';

interface MeterState {
  userData: UserData | null;
  loading: boolean;
  /**
   * Set when the data subscription fails or times out before the first
   * snapshot arrives (network drop, permission denied, etc.). Tab screens
   * render an inline retry state instead of their skeleton when this is set
   * and `userData` is still null.
   */
  error: string | null;
  /**
   * Retry hook wired up by the app bootstrap in App.tsx. Calling it tears
   * down the current data subscription and starts a fresh one so screens can
   * recover from a transient failure without re-mounting the app.
   */
  retry: (() => void) | null;
  /** Currently focused location + source. Persist across store updates. */
  selectedLocationId: string | null;
  selectedSourceId: string | null;
  /** Called by the watchUserData subscription; null clears on sign-out. */
  setUserData: (data: UserData | null) => void;
  setError: (message: string | null) => void;
  setRetry: (fn: (() => void) | null) => void;
  selectLocation: (id: string) => void;
  selectSource: (id: string) => void;
}

/**
 * Holds the realtime meter data (the "realtime slice"). Fed by the
 * watchUserData use-case; read by feature viewmodels via selector hooks.
 *
 * Selection is intentionally sticky: on every setUserData we only reassign the
 * selection when the current one no longer resolves, so the UI does not jump
 * between sources whenever RTDB pushes an update.
 */
export const useMeterStore = create<MeterState>()((set) => ({
  userData: null,
  loading: true,
  error: null,
  retry: null,
  selectedLocationId: null,
  selectedSourceId: null,
  setError: (message) => set({ error: message }),
  setRetry: (fn) => set({ retry: fn }),
  setUserData: (data) =>
    set((state) => {
      if (!data) {
        return {
          userData: null,
          loading: false,
          error: null,
          selectedLocationId: null,
          selectedSourceId: null,
        };
      }

      const sources = Object.values(data.sources);
      const currentSource = state.selectedSourceId
        ? data.sources[state.selectedSourceId]
        : null;

      let selectedSourceId = currentSource?.id ?? null;
      let selectedLocationId =
        currentSource?.locationId ?? state.selectedLocationId ?? null;

      // Re-anchor selection to a still-existing location/source if the
      // previous one was archived, deleted, or never set.
      if (!selectedSourceId) {
        const locationId =
          selectedLocationId && data.locations[selectedLocationId]
            ? selectedLocationId
            : (Object.keys(data.locations)[0] ?? null);
        selectedLocationId = locationId;
        const fallback = sources
          .filter((s) => !s.archivedAt)
          .find((s) => s.locationId === locationId);
        selectedSourceId = fallback?.id ?? null;
      }

      // Successful emit clears any prior error so screens leave their retry
      // state as soon as fresh data lands.
      return {
        userData: data,
        loading: false,
        error: null,
        selectedLocationId,
        selectedSourceId,
      };
    }),
  selectLocation: (id) =>
    set((state) => {
      const data = state.userData;
      if (!data || !data.locations[id]) return {};
      const firstSource = Object.values(data.sources).find(
        (s) => s.locationId === id && !s.archivedAt,
      );
      return {
        selectedLocationId: id,
        selectedSourceId: firstSource?.id ?? null,
      };
    }),
  selectSource: (id) =>
    set((state) => {
      const data = state.userData;
      if (!data) return {};
      const source = data.sources[id];
      if (!source) return {};
      return {
        selectedSourceId: id,
        selectedLocationId: source.locationId,
      };
    }),
}));
