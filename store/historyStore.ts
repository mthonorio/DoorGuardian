import { create } from 'zustand';
import { ImageCapture, HistoryFilters } from '../types/history';

interface HistoryStore {
  captures: ImageCapture[];
  filteredCaptures: ImageCapture[];
  filters: HistoryFilters;
  isLoading: boolean;

  // Actions
  addCapture: (capture: Omit<ImageCapture, 'id'>) => void;
  removeCapture: (id: string) => void;
  loadHistory: () => Promise<void>;
  saveHistory: () => Promise<void>;
  applyFilters: (filters: HistoryFilters) => void;
  clearHistory: () => void;
  getCaptureById: (id: string) => ImageCapture | undefined;
}

const STORAGE_KEY = '@DoorGuardian:history';

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  captures: [],
  filteredCaptures: [],
  filters: { period: 'all' },
  isLoading: false,

  addCapture: (captureData) => {
    const newCapture: ImageCapture = {
      ...captureData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    set((state) => {
      const newCaptures = [newCapture, ...state.captures];
      return {
        captures: newCaptures,
        filteredCaptures: filterCaptures(newCaptures, state.filters),
      };
    });

    get().saveHistory();
  },

  removeCapture: (id) => {
    set((state) => {
      const newCaptures = state.captures.filter((capture) => capture.id !== id);
      return {
        captures: newCaptures,
        filteredCaptures: filterCaptures(newCaptures, state.filters),
      };
    });

    get().saveHistory();
  },

  loadHistory: async () => {
    set({ isLoading: true });
    // Simulando dados mock para desenvolvimento
    const mockCaptures: ImageCapture[] = [
      {
        id: '1',
        imageUri: 'https://picsum.photos/400/300?random=1',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        thumbnailUri: 'https://picsum.photos/150/100?random=1',
      },
      {
        id: '2',
        imageUri: 'https://picsum.photos/400/300?random=2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        thumbnailUri: 'https://picsum.photos/150/100?random=2',
      },
      {
        id: '3',
        imageUri: 'https://picsum.photos/400/300?random=3',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        thumbnailUri: 'https://picsum.photos/150/100?random=3',
      },
    ];

    set((state) => ({
      captures: mockCaptures,
      filteredCaptures: filterCaptures(mockCaptures, state.filters),
      isLoading: false,
    }));
  },

  saveHistory: async () => {
    try {
      // TODO: Implement persistent storage when AsyncStorage is available
      console.log('History would be saved to storage');
    } catch (error) {
      console.error('Error saving history:', error);
    }
  },

  applyFilters: (filters) => {
    set((state) => ({
      filters,
      filteredCaptures: filterCaptures(state.captures, filters),
    }));
  },

  clearHistory: () => {
    set({ captures: [], filteredCaptures: [] });
    // TODO: Remove from AsyncStorage when available
    console.log('History would be removed from storage');
  },

  getCaptureById: (id) => {
    return get().captures.find((capture) => capture.id === id);
  },
}));

// Helper function to filter captures based on filters
const filterCaptures = (captures: ImageCapture[], filters: HistoryFilters): ImageCapture[] => {
  let filtered = [...captures];

  switch (filters.period) {
    case 'today':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((capture) => capture.timestamp >= today);
      break;

    case 'week':
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((capture) => capture.timestamp >= weekAgo);
      break;

    case 'month':
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter((capture) => capture.timestamp >= monthAgo);
      break;

    case 'custom':
      if (filters.customStartDate) {
        filtered = filtered.filter((capture) => capture.timestamp >= filters.customStartDate!);
      }
      if (filters.customEndDate) {
        const endDate = new Date(filters.customEndDate);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((capture) => capture.timestamp <= endDate);
      }
      break;

    case 'all':
    default:
      break;
  }

  // Sort by timestamp (newest first)
  return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
