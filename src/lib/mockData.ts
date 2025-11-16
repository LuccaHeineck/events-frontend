import { Event, Registration, Certificate, Log } from '../types';

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Summit 2025',
    description: 'Conferência anual sobre tecnologia e inovação com palestrantes renomados do mercado.',
    date: '2025-12-15',
    location: 'São Paulo Convention Center',
    category: 'Tecnologia',
    maxAttendees: 500,
    currentAttendees: 342,
    status: 'open',
    banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
  },
  {
    id: '2',
    title: 'Workshop de Design Thinking',
    description: 'Aprenda metodologias ágeis e design thinking aplicado a produtos digitais.',
    date: '2025-11-20',
    location: 'Hub de Inovação - Rio de Janeiro',
    category: 'Design',
    maxAttendees: 50,
    currentAttendees: 48,
    status: 'open',
    banner: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop'
  },
  {
    id: '3',
    title: 'Hackathon Global 2025',
    description: 'Competição de 48 horas para desenvolver soluções inovadoras em equipe.',
    date: '2025-11-25',
    location: 'Campus Tech - Belo Horizonte',
    category: 'Desenvolvimento',
    maxAttendees: 200,
    currentAttendees: 200,
    status: 'closed',
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop'
  },
  {
    id: '4',
    title: 'Congresso de IA e Machine Learning',
    description: 'Evento encerrado sobre os avanços em inteligência artificial.',
    date: '2025-10-10',
    location: 'Centro de Convenções - Curitiba',
    category: 'Tecnologia',
    maxAttendees: 300,
    currentAttendees: 285,
    status: 'ended',
    banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop'
  },
  {
    id: '5',
    title: 'Meetup UX/UI',
    description: 'Encontro mensal da comunidade de designers para networking e troca de experiências.',
    date: '2025-12-01',
    location: 'Coworking Central - Porto Alegre',
    category: 'Design',
    maxAttendees: 80,
    currentAttendees: 45,
    status: 'open',
    banner: 'https://images.unsplash.com/photo-1558403194-611308249627?w=800&h=400&fit=crop'
  }
];

export const mockRegistrations: Registration[] = [
  {
    id: 'r1',
    userId: '2',
    eventId: '1',
    status: 'active',
    checkedIn: false,
    registeredAt: '2025-11-01T10:00:00Z'
  },
  {
    id: 'r2',
    userId: '2',
    eventId: '4',
    status: 'completed',
    checkedIn: true,
    registeredAt: '2025-09-15T14:30:00Z'
  }
];

export const mockCertificates: Certificate[] = [
  {
    id: 'c1',
    eventId: '4',
    userId: '2',
    code: 'CERT-2025-IA-001234',
    issuedAt: '2025-10-11T09:00:00Z',
    validationUrl: 'https://eventmanager.com/validate/CERT-2025-IA-001234'
  }
];

export const mockLogs: Log[] = [
  {
    id: 'l1',
    timestamp: '2025-11-12T10:23:45Z',
    endpoint: '/api/events',
    user: 'admin@eventmanager.com',
    status: 'success',
    method: 'POST'
  },
  {
    id: 'l2',
    timestamp: '2025-11-12T10:15:12Z',
    endpoint: '/api/registrations',
    user: 'joao@example.com',
    status: 'success',
    method: 'POST'
  },
  {
    id: 'l3',
    timestamp: '2025-11-12T09:45:33Z',
    endpoint: '/api/checkin',
    user: 'admin@eventmanager.com',
    status: 'success',
    method: 'PUT'
  },
  {
    id: 'l4',
    timestamp: '2025-11-12T09:30:21Z',
    endpoint: '/api/events/4',
    user: 'admin@eventmanager.com',
    status: 'error',
    method: 'DELETE'
  }
];
