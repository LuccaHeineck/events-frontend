import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { EventsPage } from './components/pages/EventsPage';
import { RegistrationsPage } from './components/pages/RegistrationsPage';
import { CertificatesPage } from './components/pages/CertificatesPage';
import { DashboardPage } from './components/pages/admin/DashboardPage';
import { ManageEventsPage } from './components/pages/admin/ManageEventsPage';
import { CheckInPage } from './components/pages/admin/CheckInPage';
import { EmailsPage } from './components/pages/admin/EmailsPage';
import { LogsPage } from './components/pages/admin/LogsPage';
import { Event, Registration, Certificate } from './types';
import { mockEvents, mockRegistrations, mockCertificates, mockLogs } from './lib/mockData';
import { Toaster } from './components/ui/sonner';
import './styles/globals.css';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [registrations, setRegistrations] = useState<Registration[]>(mockRegistrations);
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);

  useEffect(() => {
    if (user && !currentPage) {
      setCurrentPage(user.isAdmin ? 'dashboard' : 'events');
    }
  }, [user, currentPage]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleRegister = (eventId: string) => {
    const newRegistration: Registration = {
      id: `r${Date.now()}`,
      userId: user.id,
      eventId,
      status: 'active',
      checkedIn: false,
      registeredAt: new Date().toISOString(),
    };
    setRegistrations([...registrations, newRegistration]);

    // Update event attendees count
    setEvents(events.map(e => 
      e.id === eventId 
        ? { ...e, currentAttendees: e.currentAttendees + 1 }
        : e
    ));
  };

  const handleCancelRegistration = (eventId: string) => {
    setRegistrations(
      registrations.map((r) =>
        r.eventId === eventId && r.userId === user.id
          ? { ...r, status: 'cancelled' as const }
          : r
      )
    );

    // Update event attendees count
    setEvents(events.map(e => 
      e.id === eventId 
        ? { ...e, currentAttendees: Math.max(0, e.currentAttendees - 1) }
        : e
    ));
  };

  const handleCheckIn = (eventIdOrRegistrationId: string) => {
    // Check if it's a registration ID or event ID
    const registration = registrations.find(r => r.id === eventIdOrRegistrationId);
    
    if (registration) {
      // Admin check-in by registration ID
      setRegistrations(
        registrations.map((r) =>
          r.id === eventIdOrRegistrationId ? { ...r, checkedIn: true } : r
        )
      );
    } else {
      // User check-in by event ID
      setRegistrations(
        registrations.map((r) =>
          r.eventId === eventIdOrRegistrationId && r.userId === user.id
            ? { ...r, checkedIn: true }
            : r
        )
      );
    }
  };

  const handleGenerateCertificate = (eventId: string) => {
    const newCertificate: Certificate = {
      id: `c${Date.now()}`,
      eventId,
      userId: user.id,
      code: `CERT-2025-${eventId.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      issuedAt: new Date().toISOString(),
      validationUrl: `https://eventmanager.com/validate/${eventId}`,
    };
    setCertificates([...certificates, newCertificate]);

    // Update registration status
    setRegistrations(
      registrations.map((r) =>
        r.eventId === eventId && r.userId === user.id
          ? { ...r, status: 'completed' as const }
          : r
      )
    );

    // Navigate to certificates page
    setCurrentPage('certificates');
  };

  const handleCreateEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: `e${Date.now()}`,
    };
    setEvents([...events, newEvent]);
  };

  const handleUpdateEvent = (id: string, eventData: Partial<Event>) => {
    setEvents(events.map((e) => (e.id === id ? { ...e, ...eventData } : e)));
  };

  const handleQuickRegister = (name: string, email: string, eventId: string) => {
    // In a real app, we'd create a user here
    const newUserId = `u${Date.now()}`;
    const newRegistration: Registration = {
      id: `r${Date.now()}`,
      userId: newUserId,
      eventId,
      status: 'active',
      checkedIn: true,
      registeredAt: new Date().toISOString(),
    };
    setRegistrations([...registrations, newRegistration]);

    // Update event attendees count
    setEvents(events.map(e => 
      e.id === eventId 
        ? { ...e, currentAttendees: e.currentAttendees + 1 }
        : e
    ));
  };

  const renderPage = () => {
    if (user.isAdmin) {
      switch (currentPage) {
        case 'dashboard':
          return <DashboardPage />;
        case 'manage-events':
          return <ManageEventsPage />;
        case 'checkin':
          return (
            <CheckInPage
              events={events}
              registrations={registrations}
              onCheckIn={handleCheckIn}
              onQuickRegister={handleQuickRegister}
            />
          );
        case 'emails':
          return <EmailsPage />;
        case 'logs':
          return <LogsPage logs={mockLogs} />;
        default:
          return <DashboardPage />;
      }
    } else {
      switch (currentPage) {
        case 'events':
          return (
            <EventsPage
              registrations={registrations}
              onRegister={handleRegister}
              onCancelRegistration={handleCancelRegistration}
              onCheckIn={handleCheckIn}
            />
          );
        case 'registrations':
          return (
            <RegistrationsPage
              onGenerateCertificate={handleGenerateCertificate}
            />
          );
        case 'certificates':
          return <CertificatesPage certificates={certificates} />;
        default:
          return (
            <EventsPage
              registrations={registrations}
              onRegister={handleRegister}
              onCancelRegistration={handleCancelRegistration}
              onCheckIn={handleCheckIn}
            />
          );
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      <div className="flex">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="flex-1 lg:ml-64">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {renderPage()}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <AppContent />
      </OfflineProvider>
    </AuthProvider>
  );
}