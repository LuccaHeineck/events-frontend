// types.ts

// ------------------ USUÁRIOS ------------------
export interface User {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  isAdmin: boolean;
  syncPending?: boolean; // para ações offline
}

// ------------------ EVENTOS ------------------
export interface Event {
  id_evento: number;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  local: string;
}

// ------------------ INSCRIÇÕES ------------------
export interface Registration {
  id_inscricao: number;
  id_usuario: number;
  id_evento: number;
  data_inscricao: string;
  data_cancelamento?: string;
  status: 0 | 1; // 0 = cancelado, 1 = ativo
  syncPending?: boolean; // para ações offline
}

// ------------------ CHECK-INS ------------------
export interface CheckIn {
  id_checkin: number;
  id_inscricao: number;
  data_checkin: string;
}

// ------------------ CERTIFICADOS ------------------
export interface Certificate {
  id_certificado?: number;
  data_emissao: string;
  hash_confirmacao: string;
  evento?: {
    titulo: string;
    data_inicio: string;
    data_fim: string;
    local: string;
  };
}
