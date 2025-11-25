import React from "react";
import { Event } from "../../types";
import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  const now = new Date();
  const start = new Date(event.data_inicio);
  const end = new Date(event.data_fim);

  const getStatusBadge = () => {
    // 1. ENCERRADO
    if (end < now) {
      return (
        <Badge className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20">
          Encerrado
        </Badge>
      );
    }

    // 2. ABERTO (ainda não começou)
    if (now < start) {
      return (
        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
          Aberto
        </Badge>
      );
    }

    // 3. EM ANDAMENTO (começou, mas não terminou)
    return (
      <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
        Em andamento
      </Badge>
    );
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden border-border bg-card hover:border-primary/50 transition-colors">
        <div className="relative h-48 overflow-hidden bg-muted">
          {event.banner && (
            <ImageWithFallback
              src={event.banner}
              alt={event.titulo}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute right-3 top-3">{getStatusBadge()}</div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="text-foreground mb-1">{event.titulo}</h3>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(event.data_inicio).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.local}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            onClick={() => onViewDetails(event)}
            variant="outline"
            className="w-full"
          >
            Ver detalhes
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
