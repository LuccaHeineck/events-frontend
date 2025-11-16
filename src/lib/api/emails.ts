import { apiRequest } from './config';

// ====================================
// EMAIL ENDPOINTS
// ====================================

export interface SendEmailRequest {
  to: string | string[]; // pode ser um email ou array de emails
  subject: string;
  body: string;
}

export interface SendEmailResponse {
  success: boolean;
  message?: string;
  total_sent?: number;
  failed?: string[];
}

// POST /send-email
export async function sendEmail(data: SendEmailRequest): Promise<SendEmailResponse> {
  return apiRequest<SendEmailResponse>('/send-email', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// POST /send-email/evento/:eventId - enviar email para todos os inscritos de um evento (inventado)
export async function sendEmailToEventParticipants(
  eventId: number,
  data: {
    subject: string;
    body: string;
    apenas_confirmados?: boolean; // apenas quem fez check-in
  }
): Promise<SendEmailResponse> {
  return apiRequest<SendEmailResponse>(`/send-email/evento/${eventId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
