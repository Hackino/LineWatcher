import { create } from 'zustand';
import type { UserData } from '@core/model';

interface MeterState {
  userData: UserData | null;
  loading: boolean;
  /** Currently focused location + source. Persist across store updates. */
  selectedLocationId: string | null;
  selectedSourceId: string | null;
  /** Called by the watchUserData subscription; null clears on sign-out. */
  setUserData: (data: UserData | null) => void;
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
  selectedLocationId: null,
  selectedSourceId: null,
  setUserData: (data) =>
    set((state) => {
      if (!data) {
        return {
          userData: null,
          loading: false,
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

      return { userData: data, loading: false, selectedLocationId, selectedSourceId };
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
