import React, { useState, useEffect } from 'react';
import { Event } from '../../../types';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Mail, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getEvents, sendEmail } from '../../../lib/api';
import { Alert, AlertDescription } from '../../ui/alert';

export function EmailsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [emailTo, setEmailTo] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Buscar eventos da API
  useEffect(() => {
    async function fetchEvents() {
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
    }

    fetchEvents();
  }, []);

  const emailTemplates = {
    registration: {
      subject: 'Confirmação de Inscrição',
      body: `Olá,

Sua inscrição para o evento foi confirmada com sucesso!

Aguardamos você!

Atenciosamente,
Equipe Event Manager`
    },
    checkin: {
      subject: 'Confirmação de Check-in',
      body: `Olá,

Confirmamos sua presença no evento!

Obrigado por participar.

Atenciosamente,
Equipe Event Manager`
    },
  };

  const handleTemplateChange = (template: keyof typeof emailTemplates) => {
    setEmailSubject(emailTemplates[template].subject);
    setEmailBody(emailTemplates[template].body);
  };

  const handleSendEmail = async () => {
    if (!emailTo || !emailSubject || !emailBody) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      setIsSending(true);
      
      await sendEmail({
        to: emailTo,
        subject: emailSubject,
        body: emailBody,
      });
      
      toast.success('E-mail enviado com sucesso!');
      
      // Reset form
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
      setSelectedEventId('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar e-mail');
    } finally {
      setIsSending(false);
    }
  };

  const selectedEvent = events.find((e) => e.id.toString() === selectedEventId);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-foreground">Enviar E-mails</h1>
        <p className="text-muted-foreground">
          Envie notificações para participantes dos eventos
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Configurar E-mail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Evento (opcional - para contexto)</Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Template</Label>
                <Select onValueChange={(value) => handleTemplateChange(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registration">Confirmação de Inscrição</SelectItem>
                    <SelectItem value="checkin">Confirmação de Check-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailTo">Destinatário *</Label>
                <Input
                  id="emailTo"
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="exemplo@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailSubject">Assunto *</Label>
                <Input
                  id="emailSubject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Assunto do e-mail"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailBody">Conteúdo do E-mail *</Label>
                <Textarea
                  id="emailBody"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={12}
                  placeholder="Digite o conteúdo do e-mail..."
                  required
                />
              </div>

              <Button 
                onClick={handleSendEmail} 
                className="w-full gap-2"
                disabled={!emailTo || !emailSubject || !emailBody || isSending}
              >
                <Send className="h-4 w-4" />
                {isSending ? 'Enviando...' : 'Enviar E-mail'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Pré-visualização</CardTitle>
            </CardHeader>
            <CardContent>
              {emailSubject && emailBody ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-foreground">Event Manager</p>
                        <p className="text-sm text-muted-foreground">
                          noreply@eventmanager.com
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Para:</p>
                        <p className="text-foreground">
                          {emailTo || 'destinatario@email.com'}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Assunto:</p>
                        <p className="text-foreground">
                          {emailSubject}
                        </p>
                      </div>

                      <div className="whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm">
                        {emailBody}
                      </div>
                    </div>
                  </div>

                  {selectedEvent && (
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                      <p className="text-sm text-blue-500">
                        Evento selecionado: {selectedEvent.titulo}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex min-h-[400px] items-center justify-center">
                  <p className="text-muted-foreground">
                    Preencha o formulário para visualizar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}