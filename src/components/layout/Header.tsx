import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../contexts/OfflineContext';
import { Calendar, RefreshCw, LogOut, User, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { user, logout } = useAuth();
  const { isOnline, pendingSync, syncNow } = useOffline();
  const [isSyncing, setIsSyncing] = useState(false);

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-foreground">Event Manager</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Sync Status */}
          <div className="flex items-center gap-2">
            <motion.div
              className={`h-2 w-2 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-muted-foreground">
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {pendingSync > 0 && (
              <span className="text-sm text-muted-foreground">
                ({pendingSync} pendente{pendingSync > 1 ? 's' : ''})
              </span>
            )}
          </div>

          {/* Sync Button */}
          {(pendingSync > 0 || !isOnline) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </Button>
          )}

          {/* User Info & Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-auto items-center gap-3 px-3 py-2 hover:bg-accent"
              >
                <div className="hidden flex-col items-end md:flex">
                  <span className="text-sm text-foreground">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.isAdmin ? 'Administrador' : 'Participante'}
                  </span>
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p>{user?.name}</p>
                  <p className="text-muted-foreground">{user?.email}</p>
                  {user?.isAdmin && (
                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                      Administrador
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}