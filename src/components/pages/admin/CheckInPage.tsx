import React, { useState, useMemo } from 'react';
import { Event, Registration } from '../../../types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Search, UserCheck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';

interface CheckInPageProps {
  events: Event[];
  registrations: Registration[];
  onCheckIn: (registrationId: string) => void;
  onQuickRegister: (name: string, email: string, eventId: string) => void;
}

export function CheckInPage({ 
  events, 
  registrations, 
  onCheckIn,
  onQuickRegister 
}: CheckInPageProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickRegisterData, setQuickRegisterData] = useState({
    name: '',
    email: '',
  });

  const activeEvents = useMemo(() => {
    return events.filter((e) => e.status !== 'ended');
  }, [events]);

  const filteredRegistrations = useMemo(() => {
    if (!selectedEventId) return [];

    return registrations
      .filter((r) => r.eventId === selectedEventId && r.status === 'active')
      .filter((r) => {
        if (!searchQuery) return true;
        // In a real app, we'd fetch user data here
        return true;
      });
  }, [registrations, selectedEventId, searchQuery]);

  const handleCheckIn = (registrationId: string) => {
    onCheckIn(registrationId);
    toast.success('Check-in realizado com sucesso!');
  };

  const handleQuickRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      toast.error('Selecione um evento');
      return;
    }

    onQuickRegister(
      quickRegisterData.name,
      quickRegisterData.email,
      selectedEventId
    );
    toast.success('Participante cadastrado e check-in realizado!');
    setQuickRegisterData({ name: '', email: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-foreground">Presenças / Check-in</h1>
        <p className="text-muted-foreground">
          Gerencie presenças e realize check-ins
        </p>
      </div>

      {/* Event Selection */}
      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Selecione o Evento</Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um evento" />
              </SelectTrigger>
              <SelectContent>
                {activeEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} - {new Date(event.date).toLocaleDateString('pt-BR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEventId && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEventId && (
        <>
          {/* Quick Register */}
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="mb-4 text-foreground">Cadastro Rápido</h3>
              <form onSubmit={handleQuickRegister} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={quickRegisterData.name}
                      onChange={(e) =>
                        setQuickRegisterData({
                          ...quickRegisterData,
                          name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={quickRegisterData.email}
                      onChange={(e) =>
                        setQuickRegisterData({
                          ...quickRegisterData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  Cadastrar e Fazer Check-in
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Registrations List */}
          <div className="space-y-3">
            <h3 className="text-foreground">Participantes Inscritos</h3>
            
            {filteredRegistrations.length === 0 ? (
              <Card className="border-border">
                <CardContent className="flex min-h-[200px] items-center justify-center p-6">
                  <p className="text-muted-foreground">
                    Nenhum participante encontrado
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredRegistrations.map((registration, index) => (
                  <motion.div
                    key={registration.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <UserCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-foreground">
                                Participante ID: {registration.userId}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Inscrito em:{' '}
                                {new Date(
                                  registration.registeredAt
                                ).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          {registration.checkedIn ? (
                            <div className="flex items-center gap-2 text-green-500">
                              <CheckCircle className="h-5 w-5" />
                              <span>Check-in realizado</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleCheckIn(registration.id)}
                              className="gap-2"
                            >
                              <UserCheck className="h-4 w-4" />
                              Fazer Check-in
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
