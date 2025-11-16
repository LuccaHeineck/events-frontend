import React, { useState } from 'react';
import { Event, Registration } from '../../types';
import { Calendar, MapPin, Users, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../contexts/OfflineContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  registrations: Registration[];
  onRegister: (eventId: string) => void;
  onCancelRegistration: (eventId: string) => void;
  onCheckIn: (eventId: string) => void;
}

export function EventDetailsModal({
  event,
  isOpen,
  onClose,
  registrations,
  onRegister,
  onCancelRegistration,
  onCheckIn,
}: EventDetailsModalProps) {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const [isLoading, setIsLoading] = useState(false);

  if (!event) return null;

  const registration = registrations.find(
    (r) => r.eventId === event.id && r.userId === user?.id && r.status === 'active'
  );

  const handleAction = async (action: () => void, message: string) => {
    setIsLoading(true);
    try {
      action();
      toast.success(message);
      if (!isOnline) {
        toast.info('Ação salva localmente. Será sincronizada quando voltar online.');
      }
    } catch (error) {
      toast.error('Erro ao processar ação');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{event.title}</DialogTitle>
        </DialogHeader>

        {event.banner && (
          <div className="relative -mx-6 -mt-6 mb-6 h-64 overflow-hidden">
            <ImageWithFallback
              src={event.banner}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="mb-2 text-foreground">{event.title}</h2>
            <Badge className="mb-4">
              {event.category}
            </Badge>
            <p className="text-muted-foreground">{event.description}</p>
          </div>

          <div className="grid gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Data e Hora</p>
                <p className="text-foreground">
                  {new Date(event.date).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Local</p>
                <p className="text-foreground">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Vagas</p>
                <p className="text-foreground">
                  {event.currentAttendees} / {event.maxAttendees} participantes inscritos
                </p>
                {event.status === 'open' && (
                  <p className="text-sm text-muted-foreground">
                    {event.maxAttendees - event.currentAttendees} vagas disponíveis
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!registration && event.status === 'open' && (
              <Button
                onClick={() =>
                  handleAction(
                    () => onRegister(event.id),
                    'Inscrição realizada com sucesso!'
                  )
                }
                disabled={isLoading || event.currentAttendees >= event.maxAttendees}
                className="w-full"
              >
                {event.currentAttendees >= event.maxAttendees
                  ? 'Vagas esgotadas'
                  : 'Inscrever-se'}
              </Button>
            )}

            {registration && !registration.checkedIn && (
              <>
                <Button
                  onClick={() =>
                    handleAction(
                      () => onCheckIn(event.id),
                      'Check-in realizado com sucesso!'
                    )
                  }
                  disabled={isLoading}
                  className="flex-1"
                >
                  Fazer check-in
                </Button>
                <Button
                  onClick={() =>
                    handleAction(
                      () => onCancelRegistration(event.id),
                      'Inscrição cancelada'
                    )
                  }
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar inscrição
                </Button>
              </>
            )}

            {registration?.checkedIn && (
              <div className="w-full rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center">
                <p className="text-green-500">
                  ✓ Check-in realizado
                </p>
              </div>
            )}
          </div>

          {!isOnline && (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
              <p className="text-sm text-yellow-500">
                Você está offline. As alterações serão sincronizadas quando voltar online.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
