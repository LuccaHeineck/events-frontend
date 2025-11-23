import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useOffline } from '../../../contexts/OfflineContext';
import { motion } from 'motion/react';

export function LogsPage() {
	const { isOnline, pendingSync, syncNow } = useOffline();
	const [isSyncing, setIsSyncing] = useState(false);

	const handleSync = async () => {
		setIsSyncing(true);
		try {
			await syncNow();
			toast.success('Sincronização concluída');
		} catch {
			toast.error('Falha ao sincronizar');
		} finally {
			setIsSyncing(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="mb-2 text-foreground">Sincronização</h1>
					<p className="text-muted-foreground">
						Controle de ações pendentes e status da conexão
					</p>
				</div>

				<Button
					onClick={handleSync}
					disabled={!isOnline || isSyncing}
					className="gap-2"
				>
					<RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
					Sincronizar Agora
				</Button>
			</div>

			{/* Sync Status */}
			<Card className="border-border">
				<CardContent className="p-6 space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-foreground">Status da Conexão</p>
							<p className="text-sm text-muted-foreground">
								{isOnline ? 'Conectado ao servidor' : 'Modo offline'}
							</p>
						</div>
						<div className="flex items-center gap-3">
							<motion.div
								className={`h-3 w-3 rounded-full ${
									isOnline ? 'bg-green-500' : 'bg-red-500'
								}`}
								animate={{ scale: [1, 1.2, 1] }}
								transition={{ duration: 2, repeat: Infinity }}
							/>
							<span className="text-foreground">
								{isOnline ? 'Online' : 'Offline'}
							</span>
						</div>
					</div>

					{/* Pending Actions */}
					{pendingSync > 0 && (
						<div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
							<p className="text-sm text-yellow-500">
								{pendingSync} {pendingSync > 1 ? 'ações' : 'ação'} pendente{pendingSync > 1 ? 's' : ''} de sincronização
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
