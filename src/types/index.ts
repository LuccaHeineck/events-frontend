export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  telefone: string;
  isAdmin: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  maxAttendees: number;
  currentAttendees: number;
  status: 'open' | 'closed' | 'ended';
  banner?: string;
  certificateTemplate?: string;
}

export interface Registration {
  id: string;
  userId: string;
  eventId: string;
  status: 'active' | 'cancelled' | 'completed';
  checkedIn: boolean;
  registeredAt: string;
  syncPending?: boolean;
}

export interface Certificate {
  id: string;
  eventId: string;
  userId: string;
  code: string;
  issuedAt: string;
  validationUrl: string;
}

export interface Log {
  id: string;
  timestamp: string;
  endpoint: string;
  user: string;
  status: 'success' | 'error';
  method: string;
}

export interface KPI {
  label: string;
  value: number;
  change?: number;
  icon: string;
}
