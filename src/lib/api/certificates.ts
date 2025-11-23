import { Certificate } from "../../types";
import { apiRequest } from "./config";

// ====================================
// CERTIFICADOS ENDPOINTS
// ====================================

export interface CertificateResponse {
  success: boolean;
  certificados: Certificate[];
}

export interface CreateCertificateRequest {
  id_inscricao: number;
}

// GET /certificados - obter todos os certificados do usuário logado (inventado)
export async function getUserCertificates(): Promise<CertificateResponse[]> {
  return apiRequest<CertificateResponse[]>("/certificados", {
    method: "GET",
  });
}

// GET /certificados?:userId - obter certificados de um usuário específico
export async function getCertificatesByUserId(
  userId: number
): Promise<Certificate[]> {
  const response = await apiRequest<CertificateResponse>(
    `/certificados?id_usuario=${userId}`,
    {
      method: "GET",
    }
  );

  return response.certificados;
}

// POST /certificados/emitir - gerar certificado (inventado)
export async function generateCertificate(
  subscriptionId: number
): Promise<Blob> {
  return apiRequest<Promise<Blob>>(
    `/certificados/emitir/${subscriptionId}`,
    {
      method: "POST",
    },
    true
  );
}

// GET /certificados/:id/download - baixar PDF do certificado (inventado)
export function downloadCertificatePDF(id: number): string {
  // Retorna a URL para download
  const token = localStorage.getItem("auth_token");
  const params = token ? `?token=${token}` : "";
  return `/certificados/${id}/download${params}`;
}

export async function getCertificateByHash(
  hash_confirmacao: string
): Promise<Blob> {
  const response = await apiRequest<Promise<Blob>>(
    `/certificados/validar/${hash_confirmacao}`,
    { method: "GET" },
    true
  );

  return response;
}
