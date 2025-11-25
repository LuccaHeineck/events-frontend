import React, { useState, useMemo, useEffect } from "react";
import { Event, Subscription } from "../../types";
import { EventCard } from "../events/EventCard";
import { EventDetailsModal } from "../events/EventDetailsModal";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { getEvents } from "../../lib/api";
import { Alert, AlertDescription } from "../ui/alert";

interface EventsPageProps {
  registrations: Subscription[];
}

export function EventsPage({ registrations }: EventsPageProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>("all");
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
          id_evento: event.id_evento,
          titulo: event.titulo,
          data_inicio: event.data_inicio,
          data_fim: event.data_fim,
          local: event.local,
          banner: `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop`,
        }));

        setEvents(mappedEvents);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar eventos"
        );
        console.error("Erro ao buscar eventos:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.titulo.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        event.local.toLowerCase().includes(searchQuery?.toLowerCase());

      const eventIsOpen = new Date() < new Date(event.data_inicio);

      let matchesStatus = true;

      if (statusFilter === "true") {
        matchesStatus = eventIsOpen === true;
      } else if (statusFilter === "false") {
        matchesStatus = eventIsOpen === false;
      }

      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

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
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar eventos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="true">Aberto</SelectItem>
            <SelectItem value="false">Encerrado</SelectItem>
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
              key={event.id_evento}
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

      <EventDetailsModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
