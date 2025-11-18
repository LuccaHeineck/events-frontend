import { apiRequest } from './config';

// ====================================
// CHECKINS ENDPOINTS
// ====================================

export interface CheckIn {
  id_checkin: number;
  id_inscricao: number;
  data_checkin: string;
}

// GET /checkins/:registrationId - obter check-ins de uma inscrição
export async function getCheckIns(registrationId: number): Promise<CheckIn[]> {
  return apiRequest<CheckIn[]>(`/checkins/${registrationId}`, {
    method: 'GET',
  });
}

// POST /checkins/:registrationId - criar check-in para uma inscrição
export async function createCheckIn(registrationId: number): Promise<CheckIn> {
  return apiRequest<CheckIn>(`/checkins/${registrationId}`, {
    method: 'POST',
  });
}
