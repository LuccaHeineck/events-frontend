import { apiRequest } from './config';

// ====================================
// DASHBOARD & LOGS ENDPOINTS (Inventados)
// ====================================

export interface DashboardStats {
  total_eventos: number;
  total_usuarios: number;
  total_inscricoes: number;
  total_certificados: number;
  eventos_proximos: number;
  taxa_presenca: number; // percentual de check-ins
}

export interface SyncLog {
  id: number;
  tipo: 'checkin' | 'registration' | 'certificate';
  descricao: string;
  status: 'pendente' | 'sincronizado' | 'erro';
  tentativas: number;
  data: string;
  sincronizado_em?: string;
  erro_mensagem?: string;
}

// GET /dashboard/estatisticas - estatísticas gerais para o dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>('/dashboard/estatisticas', {
    method: 'GET',
  });
}

// GET /logs/sincronizacao - logs de sincronização offline
export async function getSyncLogs(): Promise<SyncLog[]> {
  return apiRequest<SyncLog[]>('/logs/sincronizacao', {
    method: 'GET',
  });
}

// POST /logs/sincronizacao - criar log de sincronização
export async function createSyncLog(data: {
  tipo: 'checkin' | 'registration' | 'certificate';
  descricao: string;
  dados?: any;
}): Promise<SyncLog> {
  return apiRequest<SyncLog>('/logs/sincronizacao', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PUT /logs/sincronizacao/:id - atualizar status do log
export async function updateSyncLog(
  id: number,
  data: {
    status: 'sincronizado' | 'erro';
    erro_mensagem?: string;
  }
): Promise<SyncLog> {
  return apiRequest<SyncLog>(`/logs/sincronizacao/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// POST /logs/sincronizacao/processar - processar todos os logs pendentes
export async function processPendingSyncLogs(): Promise<{
  total_processados: number;
  sucesso: number;
  erro: number;
}> {
  return apiRequest('/logs/sincronizacao/processar', {
    method: 'POST',
  });
}
