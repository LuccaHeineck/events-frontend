import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiLogin, apiRegister } from '../lib/api/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('eventManagerUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const response = await apiLogin(email, senha);
      
      // Salvar token
      localStorage.setItem('auth_token', response.token);
      
      // Mapear resposta da API para formato do User
      const userMapped: User = {
        id: Date.now().toString(),
        name: response.nome,
        email: response.email,
        isAdmin: response.isAdmin,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.nome}`
      };
      
      setUser(userMapped);
      localStorage.setItem('eventManagerUser', JSON.stringify(userMapped));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro ao fazer login');
    }
  };

  const signup = async (name: string, email: string, senha: string) => {
    try {
      const response = await apiRegister(name, email, senha);
      
      // Após registro, fazer login automaticamente
      await login(email, senha);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro ao criar conta');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eventManagerUser');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, isLoading }}>
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