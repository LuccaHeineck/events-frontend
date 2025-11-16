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
export async function apiRegister(nome: string, email: string, senha: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha }),
  });
}

// Função helper para logout
export function logout(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}
