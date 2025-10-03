import { create } from 'zustand';
import { ImageCapture, HistoryFilters, HistoryApiResponse, ApiError } from '../types/history';
import { apiCall, API_CONFIG } from '../lib/api';

interface HistoryStore {
  captures: ImageCapture[];
  filteredCaptures: ImageCapture[];
  filters: HistoryFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  addCapture: (capture: Omit<ImageCapture, 'id'>) => void;
  removeCapture: (id: string) => void;
  loadHistory: () => Promise<void>;
  saveHistory: () => Promise<void>;
  applyFilters: (filters: HistoryFilters) => void;
  clearHistory: () => void;
  getCaptureById: (id: string) => ImageCapture | undefined;
  clearError: () => void;
}

// Dados mock mais realistas para fallback
const MOCK_CAPTURES: ImageCapture[] = [
  {
    id: '1',
    imageUri: 'https://picsum.photos/400/300?random=1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    thumbnailUri: 'https://picsum.photos/150/100?random=1',
    description: 'Acesso detectado - Movimento na porta',
    location: 'Porta Principal',
  },
  {
    id: '2',
    imageUri: 'https://picsum.photos/400/300?random=2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    thumbnailUri: 'https://picsum.photos/150/100?random=2',
    description: 'Acesso permitido - Reconhecimento facial',
    location: 'Porta Principal',
  },
  {
    id: '3',
    imageUri: 'https://picsum.photos/400/300?random=3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    thumbnailUri: 'https://picsum.photos/150/100?random=3',
    description: 'Movimento noturno detectado',
    location: 'Porta Principal',
  },
  {
    id: '4',
    imageUri: 'https://picsum.photos/400/300?random=4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    thumbnailUri: 'https://picsum.photos/150/100?random=4',
    description: 'Acesso negado - Face não reconhecida',
    location: 'Porta Principal',
  },
];

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  captures: [],
  filteredCaptures: [],
  filters: { period: 'all' },
  isLoading: false,
  error: null,

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
    set({ isLoading: true, error: null });

    try {
      console.log('[HistoryStore] Carregando histórico da API...');

      const response = await apiCall<any>(API_CONFIG.ENDPOINTS.HISTORY);

      console.log('[HistoryStore] Resposta completa da API:', response);

      // Ajuste a conversão baseado na estrutura real da resposta
      // Supondo que a resposta seja um array direto ou tenha uma propriedade específica
      let accessRecords = response;

      // Se a resposta tiver uma estrutura diferente, ajuste aqui
      if (response.access_records) {
        accessRecords = response.access_records;
      } else if (response.data) {
        accessRecords = response.data;
      }

      console.log('[HistoryStore] Access records:', accessRecords);

      // Convert API data to ImageCapture format
      const captures: ImageCapture[] = accessRecords.map((record: any) => ({
        id: record.id || record._id || `record-${Date.now()}-${Math.random()}`,
        imageUri: record.image_url || record.imageUrl || record.url,
        thumbnailUri: record.thumbnail_url || record.image_url || record.imageUrl || record.url,
        timestamp: new Date(record.date || record.timestamp || record.createdAt),
        description: record.description || `Acesso ${record.access ? 'permitido' : 'negado'}`,
        location: record.location || 'Porta Principal',
        type: record.type || (record.access ? 'face' : 'motion'),
        confidence: record.confidence || (record.access ? 0.95 : 0.75),
      }));

      console.log('[HistoryStore] Histórico convertido:', captures);

      set((state) => ({
        captures,
        filteredCaptures: filterCaptures(captures, state.filters),
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('[HistoryStore] Erro ao carregar histórico:', error);

      let errorMessage = 'Erro ao carregar histórico';

      if (error && typeof error === 'object' && 'message' in error) {
        const apiError = error as ApiError;

        console.log('[HistoryStore] Detalhes do erro:', apiError);

        switch (apiError.code) {
          case 'NETWORK_ERROR':
            errorMessage = 'Erro de conexão. Verifique sua internet.';
            break;
          case 'TIMEOUT':
            errorMessage = 'Servidor não respondeu. Tente novamente.';
            break;
          case 'HTTP_ERROR':
            if (apiError.status === 401) {
              errorMessage = 'Token de autenticação expirado ou inválido.';
            } else if (apiError.status === 404) {
              errorMessage = 'Endpoint não encontrado na API.';
            } else {
              errorMessage = `Erro ${apiError.status}: ${apiError.message}`;
            }
            break;
          default:
            errorMessage = apiError.message || errorMessage;
        }
      }

      console.log('[HistoryStore] Usando dados mock como fallback');

      // Fallback para dados mock
      set((state) => ({
        captures: MOCK_CAPTURES,
        filteredCaptures: filterCaptures(MOCK_CAPTURES, state.filters),
        isLoading: false,
        error: errorMessage,
      }));
    }
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

  clearError: () => {
    set({ error: null });
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
