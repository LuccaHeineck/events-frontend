// ====================================
// CONFIGURAÇÃO DO GATEWAY
// Altere o GATEWAY_URL aqui para apontar para seu backend
// ====================================

export const GATEWAY_URL = 'http://localhost:8080';

// Helper para fazer requisições
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${GATEWAY_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Adiciona token se existir
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    credentials: 'include',
    mode: 'cors',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  console.log(`[API Request] ${options.method || 'GET'} ${url}`, config);

  try {
    const response = await fetch(url, config);
    
    console.log(`[API Response] Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      let errorMessage = `Erro ${response.status}`;
      
      try {
        const errorData = await response.json();
        console.error('[API Error Response Body]', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        const text = await response.text();
        console.error('[API Error Response Text]', text);
      }
      
      throw new Error(errorMessage);
    }

    // Se for 204 No Content, retorna null
    if (response.status === 204) {
      return null as T;
    }

    const data = await response.json();
    console.log('[API Response Data]', data);
    return data;
  } catch (error) {
    console.error('[API Error]', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao comunicar com o servidor');
  }
}
