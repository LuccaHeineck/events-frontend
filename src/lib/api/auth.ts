import { apiRequest } from './config';

// ====================================
// AUTH ENDPOINTS
// ====================================

export interface LoginRequest {
  email: string;
  senha: string;
}

export type LoginResponse = {
  token: string;
  isAdmin: boolean;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
};

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface RegisterResponse {
  id: number;
  isAdmin: boolean;
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone: string;
}

// POST /auth/login
export async function apiLogin(email: string, senha: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}

// POST /auth/register
// Novo tipo esperado
interface RegisterPayload {
  name: string;
  email: string;
  senha: string;
  cpf?: string;
  telefone?: string;
}

// POST /auth/register
export async function apiRegister(data: RegisterPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nome: data.name,
      email: data.email,
      senha: data.senha,
      cpf: data.cpf,
      telefone: data.telefone,
    }),
  });
}


// Função helper para logout
export function logout(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}
