import { ApiError } from '~/types/history';

// API Configuration - ATUALIZADA para sua API real
export const API_CONFIG = {
  BASE_URL: 'https://door-guardian-backend-3lextkk65-mthonorios-projects.vercel.app/api/v1',
  ENDPOINTS: {
    HISTORY: '/history',
    CAPTURE: '/capture',
  },
  TIMEOUT: 15000,
};

// Generic API fetch function - CORRIGIDA para sua API
export const apiCall = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  console.log(`[API] Fazendo requisição para: ${url}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    // Headers específicos para sua API
    const headers: HeadersInit = {
      accept: 'application/json',
      'accept-language': 'pt-BR,pt;q=0.8',
      'content-type': 'application/json',
      origin: 'https://door-guardian-backend-3lextkk65-mthonorios-projects.vercel.app',
      priority: 'u=1, i',
      referer: 'https://door-guardian-backend-3lextkk65-mthonorios-projects.vercel.app/docs',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'sec-gpc': '1',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);

    console.log(`[API] Resposta recebida - Status: ${response.status}`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP Error: ${response.status}` };
      }

      const apiError: ApiError = {
        message: errorData.message || `HTTP Error: ${response.status}`,
        status: response.status,
        code: errorData.code || 'HTTP_ERROR',
      };

      console.log('[API] Erro na resposta:', apiError);
      throw apiError;
    }

    const data = await response.json();
    console.log('[API] Dados recebidos com sucesso:', data);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('[API] Erro na requisição:', error);

    // Se já é um ApiError, apenas propaga
    if (typeof error === 'object' && error !== null && 'code' in error) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw {
          message: 'Timeout - servidor não respondeu',
          code: 'TIMEOUT',
        } as ApiError;
      }

      if (error.message?.includes('Network request failed')) {
        throw {
          message: 'Erro de rede - verifique sua conexão com a internet',
          code: 'NETWORK_ERROR',
        } as ApiError;
      }
    }

    throw {
      message: 'Erro desconhecido na requisição',
      code: 'UNKNOWN_ERROR',
    } as ApiError;
  }
};

// Funções específicas para o histórico
export const historyApi = {
  getHistory: async () => {
    return apiCall<any>(API_CONFIG.ENDPOINTS.HISTORY, {
      method: 'GET',
    });
  },

  deleteCapture: async (id: string) => {
    return apiCall(`${API_CONFIG.ENDPOINTS.HISTORY}/${id}`, {
      method: 'DELETE',
    });
  },

  captureImage: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.CAPTURE, {
      method: 'POST',
    });
  },
};
