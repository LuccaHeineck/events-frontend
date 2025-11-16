import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  ClipboardList, 
  Award, 
  LayoutDashboard, 
  Settings, 
  CheckSquare, 
  Mail,
  Database,
  Users as UsersIcon
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user } = useAuth();

  const userMenuItems = [
    { id: 'events', label: 'Eventos', icon: Calendar },
    { id: 'registrations', label: 'Minhas Inscrições', icon: ClipboardList },
    { id: 'certificates', label: 'Meus Certificados', icon: Award },
  ];

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'manage-events', label: 'Gerenciar Eventos', icon: Settings },
    { id: 'checkin', label: 'Presenças / Check-in', icon: CheckSquare },
    { id: 'emails', label: 'Enviar E-mails', icon: Mail },
    { id: 'users', label: 'Usuários', icon: UsersIcon },
    { id: 'logs', label: 'Sincronização', icon: Database },
  ];

  const menuItems = user?.isAdmin ? adminMenuItems : userMenuItems;

  return (
    <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r border-sidebar-border bg-sidebar lg:block">
      <nav className="flex flex-col gap-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {isActive && (
                <motion.div
                  className="absolute left-0 h-8 w-1 rounded-r-full bg-sidebar-primary"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
    </aside>
  );
}