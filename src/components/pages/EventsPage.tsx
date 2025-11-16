import React, { useState, useMemo, useEffect } from 'react';
import { Event, Registration } from '../../types';
import { EventCard } from '../events/EventCard';
import { EventDetailsModal } from '../events/EventDetailsModal';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { getEvents } from '../../lib/api';
import { Alert, AlertDescription } from '../ui/alert';

interface EventsPageProps {
  registrations: Registration[];
  onRegister: (eventId: string) => void;
  onCancelRegistration: (eventId: string) => void;
  onCheckIn: (eventId: string) => void;
}

export function EventsPage({ 
  registrations, 
  onRegister, 
  onCancelRegistration,
  onCheckIn 
}: EventsPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Buscar eventos da API
  useEffect(() => {
    async function fetchEvents() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getEvents();
        
        // Mapear dados da API para o formato do frontend
        const mappedEvents: Event[] = data.map((event) => ({
          id: event.id.toString(),
          title: event.titulo,
          description: event.descricao || '',
          startDate: event.data_inicio,
          endDate: event.data_fim,
          location: event.local,
          category: 'Geral', // API não retorna categoria, usar padrão
          status: 'open', // API não retorna status, usar padrão
          availableSlots: event.vagas_disponiveis || 0,
          totalSlots: event.vagas_totais || 100,
          image: `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop`,
        }));
        
        setEvents(mappedEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
        console.error('Erro ao buscar eventos:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(events.map((e) => e.category));
    return ['all', ...Array.from(cats)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || event.category === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' || event.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, searchQuery, categoryFilter, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Carregando eventos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-foreground">Eventos Disponíveis</h1>
        <p className="text-muted-foreground">
          Encontre e participe de eventos incríveis
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.slice(1).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="open">Aberto</SelectItem>
            <SelectItem value="closed">Esgotado</SelectItem>
            <SelectItem value="ended">Encerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border">
          <div className="text-center">
            <p className="text-muted-foreground">Nenhum evento encontrado</p>
            <p className="text-sm text-muted-foreground">
              Tente ajustar os filtros de busca
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <EventCard event={event} onViewDetails={setSelectedEvent} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        registrations={registrations}
        onRegister={onRegister}
        onCancelRegistration={onCancelRegistration}
        onCheckIn={onCheckIn}
      />
    </div>
  );
}