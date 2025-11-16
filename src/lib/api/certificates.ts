import { apiRequest } from './config';

// ====================================
// CERTIFICADOS ENDPOINTS
// ====================================

export interface Certificate {
  id: number;
  id_inscricao: number;
  id_usuario: number;
  id_evento: number;
  codigo_verificacao: string;
  emitido_em: string;
  // Dados populados (se retornado pelo backend)
  evento?: {
    id: number;
    titulo: string;
    data_inicio: string;
    data_fim: string;
  };
  usuario?: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface CreateCertificateRequest {
  id_inscricao: number;
}

// GET /certificados - obter todos os certificados do usuário logado (inventado)
export async function getUserCertificates(): Promise<Certificate[]> {
  return apiRequest<Certificate[]>('/certificados', {
    method: 'GET',
  });
}

// GET /certificados/usuario/:userId - obter certificados de um usuário específico (inventado)
export async function getCertificatesByUserId(userId: number): Promise<Certificate[]> {
  return apiRequest<Certificate[]>(`/certificados/usuario/${userId}`, {
    method: 'GET',
  });
}

// GET /certificados/:id - obter um certificado específico (inventado)
export async function getCertificateById(id: number): Promise<Certificate> {
  return apiRequest<Certificate>(`/certificados/${id}`, {
    method: 'GET',
  });
}

// POST /certificados - gerar certificado (inventado)
export async function generateCertificate(data: CreateCertificateRequest): Promise<Certificate> {
  return apiRequest<Certificate>('/certificados', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// GET /certificados/verificar/:codigo - verificar autenticidade de um certificado (inventado)
export async function verifyCertificate(codigo: string): Promise<{
  valido: boolean;
  certificado?: Certificate;
}> {
  return apiRequest(`/certificados/verificar/${codigo}`, {
    method: 'GET',
  });
}

// GET /certificados/:id/download - baixar PDF do certificado (inventado)
export function downloadCertificatePDF(id: number): string {
  // Retorna a URL para download
  const token = localStorage.getItem('auth_token');
  const params = token ? `?token=${token}` : '';
  return `/certificados/${id}/download${params}`;
}
