import React from 'react';
import { Event } from '../../types';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface EventCardProps {
  event: Event;
  onViewDetails: (event: Event) => void;
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  const getStatusBadge = () => {
    switch (event.status) {
      case 'open':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Aberto</Badge>;
      case 'closed':
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Esgotado</Badge>;
      case 'ended':
        return <Badge className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20">Encerrado</Badge>;
      default:
        return null;
    }
  };

  const availableSpots = event.maxAttendees - event.currentAttendees;
  const percentFull = (event.currentAttendees / event.maxAttendees) * 100;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-border bg-card hover:border-primary/50 transition-colors">
        <div className="relative h-48 overflow-hidden bg-muted">
          {event.banner && (
            <ImageWithFallback
              src={event.banner}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute right-3 top-3">
            {getStatusBadge()}
          </div>
        </div>
        
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="text-foreground mb-1">{event.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {event.currentAttendees} / {event.maxAttendees} participantes
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={`h-full ${
                  percentFull >= 100 ? 'bg-yellow-500' : 'bg-primary'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentFull, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            {event.status === 'open' && availableSpots > 0 && (
              <p className="text-xs text-muted-foreground">
                {availableSpots} vaga{availableSpots > 1 ? 's' : ''} disponível{availableSpots > 1 ? 'is' : ''}
              </p>
            )}
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
