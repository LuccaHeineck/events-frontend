import React, { useState, useEffect } from 'react';
import { Event } from '../../../types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Plus, Edit, Calendar, MapPin, Users, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../../lib/api';
import { Alert, AlertDescription } from '../../ui/alert';

export function ManageEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    local: '',
    vagas_totais: '',
  });

  // Buscar eventos da API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      console.error('Erro ao buscar eventos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (event?: any) => {
    if (event) {
      setEditingEvent(event);
      // Formatar datas para input datetime-local
      const dataInicio = event.data_inicio ? event.data_inicio.slice(0, 16) : '';
      const dataFim = event.data_fim ? event.data_fim.slice(0, 16) : '';
      
      setFormData({
        titulo: event.titulo,
        descricao: event.descricao || '',
        data_inicio: dataInicio,
        data_fim: dataFim,
        local: event.local,
        vagas_totais: event.vagas_totais?.toString() || '100',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        titulo: '',
        descricao: '',
        data_inicio: '',
        data_fim: '',
        local: '',
        vagas_totais: '100',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Formatar datas para o formato esperado pela API
      const dataInicioFormatted = formData.data_inicio.replace('T', ' ') + ':00';
      const dataFimFormatted = formData.data_fim.replace('T', ' ') + ':00';
      
      const eventData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        data_inicio: dataInicioFormatted,
        data_fim: dataFimFormatted,
        local: formData.local,
        vagas_totais: parseInt(formData.vagas_totais) || 100,
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        toast.success('Evento atualizado com sucesso');
      } else {
        await createEvent(eventData);
        toast.success('Evento criado com sucesso');
      }

      setIsModalOpen(false);
      fetchEvents(); // Recarregar lista
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar evento');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Tem certeza que deseja deletar este evento?')) {
      return;
    }

    try {
      await deleteEvent(eventId);
      toast.success('Evento deletado com sucesso');
      fetchEvents(); // Recarregar lista
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao deletar evento');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Carregando eventos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-foreground">Gerenciar Eventos</h1>
          <p className="text-muted-foreground">
            Crie e gerencie eventos da plataforma
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-foreground">{event.titulo}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {event.descricao || 'Sem descrição'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.data_inicio).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.local}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.vagas_disponiveis || 0} / {event.vagas_totais || 100}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(event)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Event Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Evento</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data e Hora de Início</Label>
                <Input
                  id="data_inicio"
                  type="datetime-local"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_fim">Data e Hora de Término</Label>
                <Input
                  id="data_fim"
                  type="datetime-local"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Input
                id="local"
                value={formData.local}
                onChange={(e) =>
                  setFormData({ ...formData, local: e.target.value })
                }
                required
                placeholder="Ex: Prédio 11 - Sala 3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vagas_totais">Número de Vagas</Label>
              <Input
                id="vagas_totais"
                type="number"
                value={formData.vagas_totais}
                onChange={(e) =>
                  setFormData({ ...formData, vagas_totais: e.target.value })
                }
                required
                min="1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingEvent ? 'Atualizar' : 'Criar'} Evento
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}