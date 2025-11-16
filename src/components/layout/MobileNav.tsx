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
  Database
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { motion } from 'motion/react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MobileNav({ isOpen, onClose, currentPage, onNavigate }: MobileNavProps) {
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
    { id: 'logs', label: 'Sincronização', icon: Database },
  ];

  const menuItems = user?.isAdmin ? adminMenuItems : userMenuItems;

  const handleNavigate = (page: string) => {
    onNavigate(page);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        
        <nav className="flex flex-col gap-1 p-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute left-0 h-8 w-1 rounded-r-full bg-primary"
                    layoutId="mobileActiveIndicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}