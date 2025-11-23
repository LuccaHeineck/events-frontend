import { Subscription } from "../../types";
import { apiRequest } from "./config";

// ====================================
// INSCRIÇÕES ENDPOINTS
// ====================================

export interface SubscriptionResponse {
  success: boolean;
  inscricoes: Subscription[];
}

export interface CreateRegistrationRequest {
  id_usuario: number;
  id_evento: number;
}

// Obter inscrições de um usuário
export async function getUserRegistrations(
  userId: number
): Promise<Subscription[]> {
  const response = await apiRequest<SubscriptionResponse>(
    `/inscricoes?id_usuario=${userId}`,
    {
      method: "GET",
    }
  );

  return response.inscricoes;
}

// GET /eventos/:eventId/inscricoes - obter todas as inscrições de um evento
export async function getEventRegistrations(
  eventId: number
): Promise<SubscriptionResponse[]> {
  return apiRequest<SubscriptionResponse[]>(`/eventos/${eventId}/inscricoes`, {
    method: "GET",
  });
}

// POST /inscricoes - inscrever um usuário em um evento
export async function createRegistration(
  data: CreateRegistrationRequest
): Promise<SubscriptionResponse> {
  return apiRequest<SubscriptionResponse>("/inscricoes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// PUT /inscricoes/:id - cancelar uma inscrição
export async function cancelRegistration(
  id: number
): Promise<SubscriptionResponse> {
  return apiRequest<SubscriptionResponse>(`/inscricoes/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status: 0 }),
  });
}

// POST /inscricoes/:id/checkin - fazer check-in
export async function checkInRegistration(
  id: number
): Promise<SubscriptionResponse> {
  return apiRequest<SubscriptionResponse>(`/inscricoes/${id}/checkin`, {
    method: "POST",
  });
}

// POST /inscricoes/checkin-rapido - check-in rápido sem cadastro prévio
export async function quickCheckIn(data: {
  nome: string;
  email: string;
  id_evento: number;
}): Promise<SubscriptionResponse> {
  return apiRequest<SubscriptionResponse>("/inscricoes/checkin-rapido", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
