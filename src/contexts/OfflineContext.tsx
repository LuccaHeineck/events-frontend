// src/contexts/OfflineContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getPendingActions,
  addPendingAction,
  clearPendingActions,
  updatePendingAction,
} from '../lib/dbActions';

interface OfflineContextType {
  isOnline: boolean;
  pendingSync: number;
  registerPending: (type: string, url: string, body?: any) => Promise<void>;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  // ------------------------------------------------------------
  // 1) CHECK DE CONEXÃO
  // ------------------------------------------------------------
  async function checkConnection() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      await fetch('http://177.44.248.81:8080', {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeout);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }

  useEffect(() => {
    checkConnection();
    const interval = setInterval(async () => {
      await checkConnection();
      const pending = await getPendingActions();
      setPendingSync(pending.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ------------------------------------------------------------
  // 2) REGISTRO DE AÇÕES PENDENTES
  // ------------------------------------------------------------
  const registerPending = async (type: string, url: string, body?: any) => {
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

    await addPendingAction({
      type,
      payload: { url: normalizedUrl, body },
    });

    const pending = await getPendingActions();
    setPendingSync(pending.length);
  };

  // ------------------------------------------------------------
  // 3) SINCRONIZAÇÃO
  // - resolve localId -> real id
  // - remove local-only keys before enviar ao backend
  // - atualiza ações seguintes no DB para substituir ids locais por reais
  // ------------------------------------------------------------
  const syncNow = async () => {
    const actions = await getPendingActions();
    if (actions.length === 0) return;

    const userMap: Record<number, number> = {}; // localUserId -> realUserId
    const inscricaoMap: Record<number, number> = {}; // localInscricaoId -> realInscricaoId

    // process actions in order
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      const actionId = action.id;
      let { type, payload } = action;
      let { url, body } = payload;

      body = body ? { ...body } : undefined;
      url = url ?? '';

	  // susbtitui ids locais por reais
      if (body) {
        if (body.localId) {
          delete body.localId;
        }

        if (body.idUsuarioLocal && userMap[body.idUsuarioLocal]) {
          body.id_usuario = userMap[body.idUsuarioLocal];
          delete body.idUsuarioLocal;
        }

        if (body.id_usuario && userMap[body.id_usuario]) {
          body.id_usuario = userMap[body.id_usuario];
        }

        if (body.id_inscricao && inscricaoMap[body.id_inscricao]) {
          body.id_inscricao = inscricaoMap[body.id_inscricao];
        }
      }

      // --------------------------------------------------------
      // substitute local id in URL (example /inscricoes/{localId}/checkin)
      // If the URL contains a numeric segment which is a local inscricao id, replace it
      // --------------------------------------------------------
      if (url.startsWith('/inscricoes/')) {
        const parts = url.split('/');
        const maybeId = Number(parts[2]);
        if (!Number.isNaN(maybeId) && inscricaoMap[maybeId]) {
          url = `/inscricoes/${inscricaoMap[maybeId]}/checkin`;
        }
      }

      // Manda request
      const token = localStorage.getItem('auth_token');

      let response: Response;
      try {
        response = await fetch('http://177.44.248.81:8080' + url, {
          method: type,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
        });
      } catch (err) {
        console.error('Erro de rede ao enviar pendência:', url, err);
        return;
      }

      if (!response.ok) {
        console.error('Erro ao enviar pendência:', url, response.status);
        return;
      }

      let data: any = {};
      try {
        data = await response.json();
      } catch {}

	  // captura ids reais retornados para mapeamento
      const normalizedUrlPath = payload.url; // url original armazenada no payload

      if (type === 'POST' && normalizedUrlPath === '/usuarios') {
        const localId = payload.body?.localId ?? payload.body?.id;
        const realId = data?.id_usuario ?? data?.id;
        if (localId && realId) userMap[localId] = realId;
      }

      if (type === 'POST' && normalizedUrlPath === '/inscricoes') {
        const localId = payload.body?.localId ?? payload.body?.id;
		const realId = data?.data?.id_inscricao ?? data?.id_inscricao ?? data?.id;
        if (localId && realId) inscricaoMap[localId] = realId;
      }

	  // Atualiza ações seguintes no DB para substituir ids locais por reais
      for (let j = i + 1; j < actions.length; j++) {
        const next = actions[j];
        const nextPayload = { ...next.payload };

        if (nextPayload.body) {
          const nb = { ...nextPayload.body };

          if (nb.idUsuarioLocal && userMap[nb.idUsuarioLocal]) {
            nb.id_usuario = userMap[nb.idUsuarioLocal];
            delete nb.idUsuarioLocal;
          }

          if (nb.id_usuario && userMap[nb.id_usuario]) {
            nb.id_usuario = userMap[nb.id_usuario];
          }

          if (nb.id_inscricao && inscricaoMap[nb.id_inscricao]) {
            nb.id_inscricao = inscricaoMap[nb.id_inscricao];
          }

          nextPayload.body = nb;
        }

        if (typeof nextPayload.url === 'string' && nextPayload.url.startsWith('/inscricoes/')) {
          const parts2 = nextPayload.url.split('/');
          const lid = Number(parts2[2]);
          if (!Number.isNaN(lid) && inscricaoMap[lid]) {
            nextPayload.url = `/inscricoes/${inscricaoMap[lid]}/checkin`;
          }
        }

        // persiste as mudanças
        try {
          await updatePendingAction(next.id, nextPayload);
        } catch (err) {
          console.warn('Falha ao atualizar ação pendente no DB', next.id, err);
        }
      }
    }

    // depois de pronto, limpa a lista de pendentes
    await clearPendingActions();
    setPendingSync(0);
    console.log('✅ Sincronização concluída');
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingSync,
        registerPending,
        syncNow,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
  return ctx;
}
