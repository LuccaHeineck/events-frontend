import React, { useState, useEffect } from "react";
import { Certificate, Event, Subscription } from "../../types";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Award,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";
import {
  getUserRegistrations,
  cancelRegistration,
  generateCertificate,
} from "../../lib/api";
import { Alert, AlertDescription } from "../ui/alert";

interface RegistrationsPageProps {
  onNavigate: (page: string) => void;
}

export function RegistrationsPage({ onNavigate }: RegistrationsPageProps) {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar inscrições da API
  useEffect(() => {
    async function fetchRegistrations() {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await getUserRegistrations(Number(user.id));
        setSubscriptions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar inscrições"
        );
        console.error("Erro ao buscar inscrições:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRegistrations();
  }, [user?.id]);

  // Se o certificado já existe apenas consultar na tela
  async function handleIssueCertificate(subscriptionId: number) {
    try {
      const blob = await generateCertificate(subscriptionId);
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (err) {
      onNavigate("certificates");
    }
  }

  const handleCancel = async (subscriptionId: number) => {
    try {
      await cancelRegistration(subscriptionId);

      // Atualizar lista local
      setSubscriptions((prev) =>
        prev.map((reg) =>
          reg.id_inscricao === subscriptionId
            ? {
                ...reg,
                status: false,
                data_cancelamento: new Date().toISOString(),
              }
            : reg
        )
      );

      toast.success("Inscrição cancelada com sucesso");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao cancelar inscrição"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Carregando inscrições...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-foreground">Minhas Inscrições</h1>
        <p className="text-muted-foreground">
          Gerencie suas inscrições e acompanhe seus eventos
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {subscriptions.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border">
          <div className="text-center">
            <p className="text-muted-foreground">
              Você ainda não possui inscrições
            </p>
            <p className="text-sm text-muted-foreground">
              Explore os eventos disponíveis e inscreva-se
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((registration) => {
            const event = registration.event;
            if (!event) return null;

            const canGenerateCertificate = registration.checkin;

            return (
              <motion.div
                key={registration.id_inscricao}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-foreground">
                                {event.titulo}
                              </h3>
                              {registration.status && (
                                <Badge className="bg-green-500/10 text-green-500">
                                  Ativo
                                </Badge>
                              )}
                              {!registration.status && (
                                <Badge className="bg-red-500/10 text-red-500">
                                  Cancelado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {event.titulo || "Sem descrição"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(event.data_inicio).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.local}</span>
                          </div>
                          {registration.checkin ? (
                            <div className="flex items-center gap-2 text-green-500">
                              <CheckCircle className="h-4 w-4" />
                              <span>Check-in realizado</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4" />
                              <span>Aguardando check-in</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:w-auto">
                        {registration.status &&
                          new Date() <= new Date(event.data_fim) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCancel(registration.id_inscricao)
                              }
                              className="w-full md:w-auto"
                            >
                              Cancelar
                            </Button>
                          )}

                        {canGenerateCertificate &&
                          registration.status &&
                          new Date() > new Date(event.data_fim) && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleIssueCertificate(
                                  registration.id_inscricao
                                )
                              }
                              className="w-full gap-2 md:w-auto"
                            >
                              <Award className="h-4 w-4" />
                              Emitir certificado
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
