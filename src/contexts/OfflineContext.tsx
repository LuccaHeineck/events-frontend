import React, { createContext, useContext, useState, useEffect } from 'react';

interface OfflineContextType {
  isOnline: boolean;
  pendingSync: number;
  syncNow: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  // Verifica conectividade real com backend
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

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const syncNow = async () => {
    const pending = localStorage.getItem('pendingActions');
    if (!pending) return;

    // Simular sync
    await new Promise(resolve => setTimeout(resolve, 1500));
    localStorage.removeItem('pendingActions');
    setPendingSync(0);
  };

  return (
    <OfflineContext.Provider value={{ isOnline, pendingSync, syncNow }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within OfflineProvider');
  return context;
}
