import React, { useEffect, useState } from "react";
import { Event, Subscription } from "../../types";
import { Calendar, MapPin, Users, X } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { toast } from "sonner@2.0.3";
import { useAuth } from "../../contexts/AuthContext";
import { useOffline } from "../../contexts/OfflineContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { createRegistration, getUserRegistrations } from "../../lib/api";

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsModal({
  event,
  isOpen,
  onClose,
}: EventDetailsModalProps) {
  if (!event) return null;

  const { user } = useAuth();
  const [registration, setRegistration] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] =
    useState<boolean>(false);

  if (!event) return null;

  useEffect(() => {
    async function fetchRegistration() {
      const userRegistrations = await getUserRegistrations(user.id);

      const registrationObj = userRegistrations.find(
        (reg) => reg.id_evento === event?.id_evento && reg.status === true
      );

      setRegistration(registrationObj || null);
    }

    if (user?.id && event?.id_evento) {
      fetchRegistration();
    }
    console.log(registration);
  }, [user?.id, event?.id_evento]);

  console.log(registration);

  async function handleRegistration(id_evento: number, user_id: number) {
    try {
      setLoadingSubscription(true);
      const response = await createRegistration({
        id_usuario: user_id,
        id_evento: id_evento,
      });
      console.log(response);
      toast.success("Inscrição realizada com sucesso!");

      setRegistration({
        id_evento,
        id_usuario: user_id,
        status: true,
        checkin: null,
      });
    } catch (err) {
      toast.error("Erro ao inscrever o usuário no evento");
      console.error("Erro ao inscrever o usuário no evento:", err);
    } finally {
      setLoadingSubscription(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{event.titulo}</DialogTitle>
        </DialogHeader>

        {event.banner && (
          <div className="relative -mx-6 -mt-6 mb-6 h-64 overflow-hidden">
            <ImageWithFallback
              src={event.banner}
              alt={event.titulo}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="mb-2 text-foreground">{event.titulo}</h2>
          </div>

          <div className="grid gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Data e Hora Início</p>
                <p className="text-foreground">
                  {new Date(event.data_inicio).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Data e Hora Fim</p>
                <p className="text-foreground">
                  {new Date(event.data_fim).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-muted-foreground">Local</p>
                <p className="text-foreground">{event.local}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!registration && new Date() < new Date(event.data_fim) && (
              <Button
                onClick={() => handleRegistration(event.id_evento, user?.id)}
                disabled={loadingSubscription}
                className="w-full"
              >
                {loadingSubscription
                  ? "Processando..."
                  : new Date() < new Date(event.data_inicio)
                  ? "Inscreva-se"
                  : "Inscreva-se (Evento em andamento)"}
              </Button>
            )}

            {registration?.checkin && (
              <div className="w-full rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center">
                <p className="text-green-500">✓ Check-in realizado</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
