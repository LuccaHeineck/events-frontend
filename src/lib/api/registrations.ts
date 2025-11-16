import { apiRequest } from './config';

// ====================================
// INSCRIÇÕES ENDPOINTS
// ====================================

export interface Registration {
  id: number;
  id_usuario: number;
  id_evento: number;
  status: 'active' | 'cancelled';
  checked_in: boolean;
  checkin_at?: string;
  created_at: string;
  updated_at?: string;
  // Dados populados do evento (se retornado pelo backend)
  evento?: {
    id: number;
    titulo: string;
    data_inicio: string;
    data_fim: string;
    local: string;
  };
  // Dados populados do usuário (se retornado pelo backend)
  usuario?: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface CreateRegistrationRequest {
  id_usuario: number;
  id_evento: number;
}

// GET /eventos/inscricao/:userId - obter inscrições de um usuário
export async function getUserRegistrations(userId: number): Promise<Registration[]> {
  return apiRequest<Registration[]>(`/eventos/inscricao/${userId}`, {
    method: 'GET',
  });
}

// GET /eventos/:eventId/inscricoes - obter todas as inscrições de um evento (inventado para admin)
export async function getEventRegistrations(eventId: number): Promise<Registration[]> {
  return apiRequest<Registration[]>(`/eventos/${eventId}/inscricoes`, {
    method: 'GET',
  });
}

// POST /eventos/inscricao - inscrever um usuário em um evento
export async function createRegistration(data: CreateRegistrationRequest): Promise<Registration> {
  return apiRequest<Registration>('/eventos/inscricao', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PUT /eventos/inscricao/:id - cancelar uma inscrição
export async function cancelRegistration(id: number): Promise<Registration> {
  return apiRequest<Registration>(`/eventos/inscricao/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'cancelled' }),
  });
}

// POST /eventos/inscricao/:id/checkin - fazer check-in (inventado)
export async function checkInRegistration(id: number): Promise<Registration> {
  return apiRequest<Registration>(`/eventos/inscricao/${id}/checkin`, {
    method: 'POST',
  });
}

// POST /eventos/inscricao/checkin-rapido - check-in rápido sem cadastro prévio (inventado para admin)
export async function quickCheckIn(data: {
  nome: string;
  email: string;
  id_evento: number;
}): Promise<Registration> {
  return apiRequest<Registration>('/eventos/inscricao/checkin-rapido', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
