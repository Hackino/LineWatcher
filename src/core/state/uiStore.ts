import { create } from 'zustand';

export type RangeKey = '7d' | '30d' | 'all';

interface UiState {
  historyRange: RangeKey;
  analyticsRange: RangeKey;
  setHistoryRange: (r: RangeKey) => void;
  setAnalyticsRange: (r: RangeKey) => void;
}

/** Ephemeral UI-only state (filters, toggles). Never holds server data. */
export const useUiStore = create<UiState>()((set) => ({
  historyRange: '30d',
  analyticsRange: '30d',
  setHistoryRange: (historyRange) => set({ historyRange }),
  setAnalyticsRange: (analyticsRange) => set({ analyticsRange }),
}));
