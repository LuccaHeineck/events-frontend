import { apiRequest } from './config';

// ====================================
// INSCRIÇÕES ENDPOINTS
// ====================================

export interface Registration {
  id_inscricao: number;
  id_usuario: number;
  id_evento: number;
  status: 0 | 1; // 0 = cancelada, 1 = ativa
  data_inscricao: string;
  data_cancelamento?: string;
  // Dados populados do evento (opcional)
  evento?: {
    id_evento: number;
    titulo: string;
    data_inicio: string;
    data_fim: string;
    local: string;
  };
  // Dados populados do usuário (opcional)
  usuario?: {
    id_usuario: number;
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
  return apiRequest<Registration[]>(`/inscricoes/${userId}`, {
    method: 'GET',
  });
}

// GET /eventos/:eventId/inscricoes - obter todas as inscrições de um evento
export async function getEventRegistrations(eventId: number): Promise<Registration[]> {
  return apiRequest<Registration[]>(`/inscricoes/evento/${eventId}`, {
    method: 'GET',
  });
}

// POST /inscricoes - inscrever um usuário em um evento
export async function createRegistration(data: CreateRegistrationRequest): Promise<Registration> {
  return apiRequest<Registration>('/inscricoes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PUT /inscricoes/:id - cancelar uma inscrição
export async function cancelRegistration(id: number): Promise<Registration> {
  return apiRequest<Registration>(`/inscricoes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 0 }),
  });
}

// POST /inscricoes/:id/checkin - fazer check-in
export async function checkInRegistration(id: number): Promise<Registration> {
  return apiRequest<Registration>(`/inscricoes/${id}/checkin`, {
    method: 'POST',
  });
}

// POST /inscricoes/checkin-rapido - check-in rápido sem cadastro prévio
export async function quickCheckIn(data: {
  nome: string;
  email: string;
  id_evento: number;
}): Promise<Registration> {
  return apiRequest<Registration>('/inscricoes/checkin-rapido', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
