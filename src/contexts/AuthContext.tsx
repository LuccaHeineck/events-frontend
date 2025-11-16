import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiLogin, apiRegister } from '../lib/api/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string, cpf?: string, telefone?: string) => Promise<void>;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('eventManagerUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const response = await apiLogin(email, senha);

      localStorage.setItem('auth_token', response.token);

      const userMapped: User = {
        id: response.id?.toString() ?? Date.now().toString(),
        name: response.nome,
        email: response.email,
        cpf: response.cpf ?? '',
        telefone: response.telefone ?? '',
        isAdmin: response.isAdmin,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.nome}`
      };

      setUser(userMapped);
      localStorage.setItem('eventManagerUser', JSON.stringify(userMapped));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      throw new Error(message);
    }
  };

  const signup = async (name: string, email: string, senha: string, cpf?: string, telefone?: string) => {
    try {
      await apiRegister({ name, email, senha, cpf, telefone });
      await login(email, senha);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar conta';
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eventManagerUser');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
