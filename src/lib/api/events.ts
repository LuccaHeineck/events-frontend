import { apiRequest } from './config';

// ====================================
// EVENTOS ENDPOINTS
// ====================================

export interface Event {
  id: number;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  vagas_totais?: number;
  vagas_disponiveis?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventRequest {
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  local: string;
  vagas_totais?: number;
}

export interface UpdateEventRequest {
  titulo?: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  local?: string;
  vagas_totais?: number;
}

// GET /eventos
export async function getEvents(): Promise<Event[]> {
  return apiRequest<Event[]>('/eventos', {
    method: 'GET',
  });
}

// GET /eventos/:id
export async function getEventById(id: number): Promise<Event> {
  return apiRequest<Event>(`/eventos/${id}`, {
    method: 'GET',
  });
}

// POST /eventos
export async function createEvent(data: CreateEventRequest): Promise<Event> {
  return apiRequest<Event>('/eventos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PUT /eventos/:id
export async function updateEvent(id: number, data: UpdateEventRequest): Promise<Event> {
  return apiRequest<Event>(`/eventos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE /eventos/:id
export async function deleteEvent(id: number): Promise<void> {
  return apiRequest<void>(`/eventos/${id}`, {
    method: 'DELETE',
  });
}

// GET /eventos/:id/estatisticas (inventado - para dashboard)
export async function getEventStats(id: number): Promise<{
  total_inscritos: number;
  total_checkins: number;
  total_certificados: number;
}> {
  return apiRequest(`/eventos/${id}/estatisticas`, {
    method: 'GET',
  });
}
