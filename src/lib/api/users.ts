import { apiRequest } from './config';

// ====================================
// USUÁRIOS ENDPOINTS
// ====================================

export interface User {
  id: number;
  nome: string;
  email: string;
  isAdmin: boolean;
  created_at?: string;
  updated_at?: string;
}

// GET /usuarios
export async function getUsers(): Promise<User[]> {
  return apiRequest<User[]>('/usuarios', {
    method: 'GET',
  });
}

// GET /usuarios/:id (inventado)
export async function getUserById(id: number): Promise<User> {
  return apiRequest<User>(`/usuarios/${id}`, {
    method: 'GET',
  });
}

// GET /usuarios/me - obter dados do usuário logado (inventado)
export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/usuarios/me', {
    method: 'GET',
  });
}

// PUT /usuarios/:id - atualizar usuário (inventado)
export async function updateUser(
  id: number,
  data: {
    nome?: string;
    email?: string;
    senha?: string;
  }
): Promise<User> {
  return apiRequest<User>(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE /usuarios/:id - deletar usuário (inventado)
export async function deleteUser(id: number): Promise<void> {
  return apiRequest<void>(`/usuarios/${id}`, {
    method: 'DELETE',
  });
}
