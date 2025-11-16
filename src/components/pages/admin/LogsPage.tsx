import React, { useState } from 'react';
import { Log } from '../../../types';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useOffline } from '../../../contexts/OfflineContext';
import { motion } from 'motion/react';

interface LogsPageProps {
  logs: Log[];
}

export function LogsPage({ logs }: LogsPageProps) {
  const { isOnline, pendingSync, syncNow } = useOffline();
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncNow();
      toast.success('Sincronização concluída com sucesso');
    } catch (error) {
      toast.error('Erro ao sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-foreground">Sincronização e Logs</h1>
          <p className="text-muted-foreground">
            Monitore atividades e sincronize dados
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
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-foreground">Status da Conexão</p>
              <p className="text-sm text-muted-foreground">
                {isOnline ? 'Conectado ao servidor' : 'Modo offline ativo'}
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

          {pendingSync > 0 && (
            <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
              <p className="text-sm text-yellow-500">
                {pendingSync} ação{pendingSync > 1 ? 'ões' : ''} pendente
                {pendingSync > 1 ? 's' : ''} de sincronização
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="p-4 text-left">Timestamp</th>
                  <th className="p-4 text-left">Endpoint</th>
                  <th className="p-4 text-left">Método</th>
                  <th className="p-4 text-left">Usuário</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <p className="text-sm text-foreground">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </td>
                    <td className="p-4">
                      <code className="text-sm text-primary">{log.endpoint}</code>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{log.method}</Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-muted-foreground">{log.user}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {log.status === 'success' ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-500">Sucesso</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-500">Erro</span>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border p-4">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
