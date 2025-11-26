// src/pages/checkin/CheckInPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Event, Subscription } from '../../../types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent } from '../../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Search, UserCheck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import {
  localGetEvents,
  localSaveEvents,
  localGetRegistrations,
  localSaveRegistrations,
  localGetCheckins,
  localSaveCheckins,
} from '../../../lib/dbActions';

import { getEvents } from '../../../lib/api/events';
import {
  getEventRegistrations,
  createRegistration,
  checkInRegistration,
} from '../../../lib/api/registrations';
import { createUser, getUsers } from '../../../lib/api/users';

import { useOffline } from '../../../contexts/OfflineContext';
import { localGetUsers, localSaveUser } from '../../../lib/dbUsers';

export function CheckInPage(): JSX.Element {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [registrations, setRegistrations] = useState<Subscription[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
  const [loadingRegs, setLoadingRegs] = useState<boolean>(false);
  const [loadingQuickRegister, setLoadingQuickRegister] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [checkingInMap, setCheckingInMap] = useState<Record<number, boolean>>({});

  const [quickRegisterData, setQuickRegisterData] = useState({
    nome: '',
    email: '',
  });

  const { isOnline, registerPending } = useOffline();

  // Construir inscrições a partir do IndexedDB (offline)
  async function buildSubscriptionsFromLocal(eventId: number): Promise<Subscription[]> {
    const localRegs = await localGetRegistrations();
    const localCheckins = await localGetCheckins();
    const localUsers = await localGetUsers();

    const regsForEvent = localRegs.filter((r) => Number(r.id_evento) === Number(eventId));

    const mapped: Subscription[] = regsForEvent.map((r) => {
      const checkin = localCheckins.find((c) => c.id_inscricao === r.id_inscricao) ?? null;
      const user = localUsers.find((u) => u.id === r.id_usuario) ?? undefined;

      return {
        id_inscricao: r.id_inscricao,
        id_usuario: r.id_usuario,
        id_evento: r.id_evento,
        data_inscricao: r.data_inscricao,
        data_cancelamento: (r as any).data_cancelamento ?? null,
        status: r.status,
        user: user
          ? {
              id: (user as any).id,
              nome: user.nome,
              email: user.email,
              cpf: (user as any).cpf,
              telefone: (user as any).telefone,
              isAdmin: user.isAdmin,
              syncPending: (user as any).syncPending,
            }
          : undefined,
        event: undefined as any,
        checkin: checkin
          ? {
              id_checkin: checkin.id_checkin,
              id_inscricao: checkin.id_inscricao,
              data_checkin: checkin.data_checkin,
            }
          : null,
      } as Subscription;
    });

    return mapped;
  }

  useEffect(() => {
    const syncUsers = async () => {
      // Apenas se estiver online
      if (!isOnline) return;

      try {
        const apiUsers = await getUsers();

        // Limpa e grava tudo rapidamente
        // ❗ Caso tenha método clear em dbUsers, use ele. Aqui, sobrescrevemos 1 a 1.
        for (const u of apiUsers) {
          await localSaveUser({
            id: u.id ?? u.id_usuario,
            nome: u.nome ?? '',
            email: u.email ?? '',
            senha: '',
            cpf: u.cpf ?? '',
            telefone: u.telefone ?? '',
            isAdmin: u.isAdmin ?? u.is_admin ?? false,
            syncPending: false,
          });
        }
      } catch (err) {
        console.warn('Falha ao sincronizar usuários localmente', err);
      }
    };

    syncUsers();
  }, [isOnline]);

  // Carregar eventos (online -> salva localmente; offline -> lê IndexedDB)
  useEffect(() => {
    const fetch = async () => {
      setLoadingEvents(true);
      try {
        if (isOnline) {
          const ev = await getEvents();

          setEvents(ev);

          // Salva no IndexedDB
          try {
            const localEvents = ev.map((e) => ({
              id_evento: e.id_evento,
              titulo: e.titulo,
              data_inicio: e.data_inicio,
              data_fim: e.data_fim,
              local: e.local ?? '',
            }));
            await localSaveEvents(localEvents);
          } catch (err) {
            console.warn('Falha ao salvar eventos localmente', err);
          }
        } else {
          const localEv = await localGetEvents();
          setEvents(
            localEv.map((le) => ({
              id_evento: le.id_evento,
              titulo: le.titulo,
              data_inicio: le.data_inicio,
              data_fim: le.data_fim,
              local: le.local,
            }))
          );
        }
      } catch (err) {
        console.error('Erro ao carregar eventos', err);
        toast.error('Erro ao carregar eventos');

        // fallback to local
        try {
          const localEv = await localGetEvents();
          if (localEv.length > 0) {
            setEvents(
              localEv.map((le) => ({
                id_evento: le.id_evento,
                titulo: le.titulo,
                data_inicio: le.data_inicio,
                data_fim: le.data_fim,
                local: le.local,
              }))
            );
          }
        } catch {}
      } finally {
        setLoadingEvents(false);
      }
    };

    fetch();
  }, [isOnline]);

  // Carregar inscrições (com suporte offline/online)
  useEffect(() => {
    if (!selectedEventId) {
      setRegistrations([]);
      return;
    }

    const fetchRegistrations = async () => {
      setLoadingRegs(true);
      try {
        if (isOnline) {
          const resp = await getEventRegistrations(Number(selectedEventId));

          // FALHA / SUCESSO = FALSE / NÃO EXISTE "inscricoes"
          if (
            !resp ||
            (resp as any).success === false ||
            !(resp as any).inscricoes
          ) {
            setRegistrations([]);                          // 🔥 LIMPA SEMPRE
            toast.info((resp as any)?.message || 'Nenhuma inscrição encontrada.');
            return;
          }

          // OK
          const inscricoes = (resp as any).inscricoes as Subscription[];
          setRegistrations(inscricoes);

          // SALVAR LOCAL
          try {
            const localRegsToSave = inscricoes.map((s) => ({
              id_inscricao: s.id_inscricao,
              id_usuario: s.id_usuario,
              id_evento: s.id_evento,
              data_inscricao: s.data_inscricao,
              data_cancelamento: s.data_cancelamento ?? null,
              status: s.status ?? true,
            }));
            await localSaveRegistrations(localRegsToSave);

            const localCheckinsToSave = inscricoes
              .filter((s) => !!s.checkin)
              .map((s) => ({
                id_checkin: s.checkin!.id_checkin,
                id_inscricao: s.id_inscricao,
                data_checkin: s.checkin!.data_checkin,
              }));
            if (localCheckinsToSave.length > 0) await localSaveCheckins(localCheckinsToSave);

            const usersToSave = inscricoes
              .map((s) => s.user)
              .filter(Boolean)
              .reduce((acc: any[], u: any) => {
                if (!acc.find((x) => x.id === u.id_usuario || x.id === u.id)) {
                  acc.push(u);
                }
                return acc;
              }, []);

            for (const u of usersToSave) {
              const id = u.id_usuario ?? u.id;
              await localSaveUser({
                id,
                nome: u.nome ?? '',
                email: u.email ?? '',
                senha: '',
                isAdmin: u.is_admin ?? u.isAdmin ?? false,
                cpf: u.cpf ?? '',
                telefone: u.telefone ?? '',
                syncPending: false,
              });
            }
          } catch (e) {
            console.warn('Falha ao salvar dados localmente (sincronização parcial)', e);
          }

        } else {
          const localSubs = await buildSubscriptionsFromLocal(Number(selectedEventId));
          setRegistrations(localSubs);
        }
      } catch (err) {
        console.error('Erro ao carregar inscrições', err);
        toast.error(err instanceof Error ? err.message : 'Erro ao carregar inscrições');

        setRegistrations([]);
      } finally {
        setLoadingRegs(false);
      }
    };

    fetchRegistrations();
  }, [selectedEventId, isOnline]);

  // Recarrega as inscrições do evento selecionado (útil após ações)
  const reloadRegistrations = async () => {
    if (!selectedEventId) {
      setRegistrations([]);
      return;
    }

    setLoadingRegs(true);
    try {
      if (isOnline) {
        const resp = await getEventRegistrations(Number(selectedEventId));

        if (
          !resp ||
          (resp as any).success === false ||
          !(resp as any).inscricoes
        ) {
          setRegistrations([]);
          toast.info((resp as any)?.message || 'Nenhuma inscrição encontrada.');
          return;
        }

        const inscricoes = (resp as any).inscricoes as Subscription[];
        setRegistrations(inscricoes);

        // salvar local
        try {
          const localRegsToSave = inscricoes.map((s) => ({
            id_inscricao: s.id_inscricao,
            id_usuario: s.id_usuario,
            id_evento: s.id_evento,
            data_inscricao: s.data_inscricao,
            data_cancelamento: s.data_cancelamento ?? null,
            status: s.status ?? true,
          }));
          await localSaveRegistrations(localRegsToSave);

          const localCheckinsToSave = inscricoes
            .filter((s) => !!s.checkin)
            .map((s) => ({
              id_checkin: s.checkin!.id_checkin,
              id_inscricao: s.id_inscricao,
              data_checkin: s.checkin!.data_checkin,
            }));
          if (localCheckinsToSave.length > 0) await localSaveCheckins(localCheckinsToSave);
        } catch (e) {
          console.warn('Falha ao salvar dados localmente (reload)', e);
        }

      } else {
        const localSubs = await buildSubscriptionsFromLocal(Number(selectedEventId));
        setRegistrations(localSubs);
      }
    } catch (err) {
      console.error('Erro ao recarregar inscrições', err);
      toast.error('Erro ao recarregar inscrições');

      setRegistrations([]);
    } finally {
      setLoadingRegs(false);
    }
  };

  // CHECK-IN
  const handleCheckIn = async (id_inscricao: number) => {
    setCheckingInMap((prev) => ({ ...prev, [id_inscricao]: true }));

    try {
      if (isOnline) {
        await checkInRegistration(id_inscricao); // API: POST /inscricoes/{id}/checkin (sem body)
        toast.success('Check-in realizado com sucesso!');
        await reloadRegistrations();
      } else {
        const now = new Date().toISOString();
        const localCheckin = {
          id_checkin: Date.now(),
          id_inscricao,
          data_checkin: now,
        };
        try {
          await localSaveCheckins([localCheckin]);
        } catch (e) {
          console.warn('Erro salvando checkin localmente', e);
        }

        // registrar pendência sem body (API espera sem body)
        await registerPending('POST', `/inscricoes/${id_inscricao}/checkin`);

        toast.info('Check-in salvo localmente (offline) e será sincronizado quando online.');
        const localSubs = await buildSubscriptionsFromLocal(Number(selectedEventId));
        setRegistrations(localSubs);
      }
    } catch (err) {
      console.error('Erro ao realizar check-in', err);
      toast.error('Erro ao realizar check-in');
    } finally {
      setCheckingInMap((prev) => ({ ...prev, [id_inscricao]: false }));
    }
  };

  // CADASTRO RÁPIDO
  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      toast.error('Selecione um evento antes de cadastrar');
      return;
    }

    const nome = quickRegisterData.nome.trim();
    const email = quickRegisterData.email.trim();

    if (!nome || !email) {
      toast.error('Nome e e-mail são obrigatórios');
      return;
    }

    setLoadingQuickRegister(true);
    try {
      if (isOnline) {
        // Online: fluxo normal
        const createdUser = await createUser({
          nome,
          email,
          senha: '123',
          isAdmin: false,
        });

        const id_usuario = (createdUser as any).id ?? (createdUser as any).id_usuario;

        await createRegistration({
          id_usuario,
          id_evento: Number(selectedEventId),
        });

        await reloadRegistrations();

        // localizar inscrição recém-criada para checkin
        let target = registrations.find((r) => r.id_usuario === id_usuario || r.user?.id === id_usuario);

        if (!target) {
          const resp = await getEventRegistrations(Number(selectedEventId));
          const inscricoes = (resp as any)?.inscricoes ?? (Array.isArray(resp) ? resp : []);
          target = (inscricoes as Subscription[]).find(
            (r) => r.id_usuario === id_usuario || r.user?.id === id_usuario
          );
        }

        if (!target) {
          toast.error('Não foi possível localizar a inscrição para check-in');
          return;
        }

        await checkInRegistration(target.id_inscricao);
        toast.success('Participante cadastrado e check-in realizado!');
        setQuickRegisterData({ nome: '', email: '' });
        await reloadRegistrations();
      } else {
        // Offline path: create local user, registration and checkin, register pendências in order

        // usuário local
        const localUserId = Date.now();
        const localUser = {
          id: localUserId,
          nome,
          email,
          senha: '123',
          isAdmin: false,
          cpf: '',
          telefone: '',
          syncPending: true,
        };
        try {
          await localSaveUser(localUser);
        } catch (e) {
          console.warn('Erro salvando usuário local', e);
        }

        // pendência para criar usuário (include localId so sync can map)
        await registerPending('POST', '/usuarios', {
          localId: localUserId,
          nome,
          email,
          senha: '123',
          isAdmin: false,
        });

        // inscrição local
        const localInscricaoId = Date.now() + 1;
        const now = new Date().toISOString();
        const localReg = {
          id_inscricao: localInscricaoId,
          id_usuario: localUserId,
          id_evento: Number(selectedEventId),
          data_inscricao: now,
          data_cancelamento: null,
          status: true,
        };
        try {
          await localSaveRegistrations([localReg]);
        } catch (e) {
          console.warn('Erro salvando inscrição local', e);
        }

        // pendência para criar inscrição — include localId and idUsuarioLocal so sync maps correctly
        await registerPending('POST', '/inscricoes', {
          localId: localInscricaoId,
          idUsuarioLocal: localUserId,
          id_evento: Number(selectedEventId),
        });

        // checkin local
        const localCheckin = {
          id_checkin: Date.now() + 2,
          id_inscricao: localInscricaoId,
          data_checkin: now,
        };
        try {
          await localSaveCheckins([localCheckin]);
        } catch (e) {
          console.warn('Erro salvando checkin local', e);
        }

        // pendência para checkin (URL will be rewritten on sync once inscricaoMap resolves)
        await registerPending('POST', `/inscricoes/${localInscricaoId}/checkin`);

        toast.info('Cadastro e check-in salvos localmente (offline); serão sincronizados quando online.');
        const localSubs = await buildSubscriptionsFromLocal(Number(selectedEventId));
        setRegistrations(localSubs);
        setQuickRegisterData({ nome: '', email: '' });
      }
    } catch (err) {
      console.error('Erro no cadastro rápido', err);
      toast.error('Erro no cadastro rápido');
    } finally {
      setLoadingQuickRegister(false);
    }
  };

  // Filtragem
  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return registrations;

    return registrations.filter((r) => {
      const nome = r.user?.nome?.toLowerCase() || '';
      const email = r.user?.email?.toLowerCase() || '';
      return nome.includes(q) || email.includes(q);
    });
  }, [registrations, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-foreground">Presenças / Check-in</h1>
        <p className="text-muted-foreground">Gerencie presenças e realize check-ins por evento</p>
      </div>

      {/* Seleção de eventos */}
      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Selecione o Evento</Label>
            <Select value={selectedEventId} onValueChange={(v) => setSelectedEventId(v)}>
              <SelectTrigger>
                <SelectValue placeholder={loadingEvents ? 'Carregando...' : 'Escolha um evento'} />
              </SelectTrigger>
              <SelectContent>
                {events.map((ev) => (
                  <SelectItem key={ev.id_evento} value={String(ev.id_evento)}>
                    {ev.titulo} — {new Date(ev.data_inicio).toLocaleDateString('pt-BR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedEventId && (
        <>
          {/* Cadastro rápido */}
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="mb-4 text-foreground">Cadastro Rápido</h3>

              <form onSubmit={handleQuickRegister} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={quickRegisterData.nome}
                      onChange={(e) => setQuickRegisterData({ ...quickRegisterData, nome: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={quickRegisterData.email}
                      onChange={(e) => setQuickRegisterData({ ...quickRegisterData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="gap-2" disabled={loadingQuickRegister}>
                  {loadingQuickRegister ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                      Processando...
                    </div>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Cadastrar e Fazer Check-in
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de inscritos */}
          <div className="space-y-3">
            <h3 className="text-foreground">Participantes Inscritos</h3>

            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" placeholder="Buscar por nome ou e-mail..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {loadingRegs ? (
              <Card className="border-border">
                <CardContent className="flex min-h-[120px] items-center justify-center p-6">
                  <p className="text-muted-foreground">Carregando inscrições...</p>
                </CardContent>
              </Card>
            ) : filteredRegistrations.length === 0 ? (
              <Card className="border-border">
                <CardContent className="flex min-h-[120px] items-center justify-center p-6">
                  <p className="text-muted-foreground">Nenhum participante encontrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredRegistrations.map((reg, idx) => (
                  <motion.div key={reg.id_inscricao} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                    <Card className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <UserCheck className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                              <p className="text-foreground">{reg.user?.nome ?? `Participante ${reg.id_usuario}`}</p>

                              <p className="text-sm text-muted-foreground">
                                Inscrito em: {reg.data_inscricao ? new Date(reg.data_inscricao).toLocaleDateString('pt-BR') : '-'}
                              </p>

                              <p className="text-sm text-muted-foreground">{reg.user?.email ?? '-'}</p>
                            </div>
                          </div>

                          {reg.checkin ? (
                            <div className="flex items-center gap-2 text-green-500">
                              <CheckCircle className="h-5 w-5" />
                              <span>Check-in realizado</span>
                            </div>
                          ) : (
                            <Button size="sm" className="gap-2" onClick={() => handleCheckIn(reg.id_inscricao)} disabled={checkingInMap[reg.id_inscricao]}>
                              {checkingInMap[reg.id_inscricao] ? (
                                <div className="flex items-center gap-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                                  Processando...
                                </div>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4" />
                                  Fazer Check-in
                                </>
                              )}
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

export default CheckInPage;
