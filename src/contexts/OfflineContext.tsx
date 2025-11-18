import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPendingActions, addPendingAction, clearPendingActions } from '../lib/dbActions';

interface OfflineContextType {
	isOnline: boolean;
	pendingSync: number;
	syncNow: () => Promise<void>;
	registerPending: (
		type: string,
		url: string,
		body?: any
	) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
	const [isOnline, setIsOnline] = useState(true);
	const [pendingSync, setPendingSync] = useState(0);

	// --- Verificação real com backend ---
	async function checkConnection() {
		try {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 3000);

			await fetch('http://177.44.248.81:8080', {
				method: "GET",
				signal: controller.signal,
			});

			clearTimeout(timeout);
			setIsOnline(true);
		} catch {
			setIsOnline(false);
		}
	}

	// Atualiza contador sempre que checa conexão
	useEffect(() => {
		checkConnection();
		const interval = setInterval(async () => {
			await checkConnection();
			const pending = await getPendingActions();
			setPendingSync(pending.length);
		}, 5000);
		return () => clearInterval(interval);
	}, []);

	// --- Registra uma ação a ser sincronizada posteriormente ---
	const registerPending = async (type: string, url: string, body?: any) => {
		await addPendingAction({
			type,
			payload: { 
				url: "http://177.44.248.81:8080" + url,  // 👈 CORREÇÃO AQUI
				body 
			},
		});

		const pending = await getPendingActions();
		setPendingSync(pending.length);
	};


	// --- Sincronização ---
	const syncNow = async () => {
	const actions = await getPendingActions();
	if (actions.length === 0) return;

	for (const action of actions) {
		try {
			console.log("➡️ Enviando ação pendente:", action);

			const { url, body } = action.payload;

			const token = localStorage.getItem('auth_token');

			const response = await fetch(url, {
				method: action.type,
				headers: {
					'Content-Type': 'application/json',
					...(token ? { Authorization: `Bearer ${token}` } : {})
				},
				body: body ? JSON.stringify(body) : undefined
			});

			if (!response.ok) {
				throw new Error(`Falha ao enviar: ${response.status}`);
			}

			console.log("✅ Ação pendente enviada:", action);
		} catch (e) {
			console.error("❌ Erro ao enviar ação pendente:", e);
			// Interrompe sincronização se alguma falhar
			return;
		}
	}

	// Se todas as requisições foram bem-sucedidas, limpa o pending
	await clearPendingActions();
	setPendingSync(0);
	console.log("✅ Todas as ações pendentes foram sincronizadas e removidas");
};



	return (
		<OfflineContext.Provider value={{
			isOnline,
			pendingSync,
			syncNow,
			registerPending
		}}>
			{children}
		</OfflineContext.Provider>
	);
}

export function useOffline() {
	const ctx = useContext(OfflineContext);
	if (!ctx) throw new Error('useOffline must be used within OfflineProvider');
	return ctx;
}
