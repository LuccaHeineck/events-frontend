import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { OfflineProvider } from "./contexts/OfflineContext";

import { LoginPage } from "./components/auth/LoginPage";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { MobileNav } from "./components/layout/MobileNav";

import { EventsPage } from "./components/pages/EventsPage";
import { RegistrationsPage } from "./components/pages/RegistrationsPage";
import { CertificatesPage } from "./components/pages/CertificatesPage";

import { CheckInPage } from "./components/pages/admin/CheckInPage";
import { EmailsPage } from "./components/pages/admin/EmailsPage";
import { LogsPage } from "./components/pages/admin/LogsPage";
import { UsersPage } from "./components/pages/admin/UsersPage";

import { Event, Subscription, Certificate } from "./types";
import {
  mockEvents,
  mockRegistrations,
  mockCertificates,
  mockLogs,
} from "./lib/mockData";

import { Toaster } from "./components/ui/sonner";
import "./lib/syncIndexedDb";
import "./styles/globals.css";

function AppContent() {
  const { user, isLoading } = useAuth();

  const [currentPage, setCurrentPage] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [registrations, setRegistrations] =
    useState<Subscription[]>(mockRegistrations);
  const [certificates, setCertificates] =
    useState<Certificate[]>(mockCertificates);

  useEffect(() => {
    if (user && !currentPage) {
      setCurrentPage(user.isAdmin ? "checkin" : "events");
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

  if (!user) return <LoginPage />;

  const updateEventCount = (eventId: string, delta: number) => {
    setEvents(
      events.map((e) =>
        e.id === eventId
          ? { ...e, currentAttendees: Math.max(0, e.currentAttendees + delta) }
          : e
      )
    );
  };

  const handleRegister = (eventId: string) => {
    const newRegistration: Subscription = {
      id: `r${Date.now()}`,
      userId: user.id,
      eventId,
      status: "active",
      checkedIn: false,
      registeredAt: new Date().toISOString(),
    };

    setRegistrations([...registrations, newRegistration]);
    updateEventCount(eventId, +1);
  };

  const handleCancelRegistration = (eventId: string) => {
    setRegistrations(
      registrations.map((r) =>
        r.eventId === eventId && r.userId === user.id
          ? { ...r, status: "cancelled" }
          : r
      )
    );
    updateEventCount(eventId, -1);
  };

  const handleCheckIn = (eventIdOrRegistrationId: string) => {
    const registration = registrations.find(
      (r) => r.id === eventIdOrRegistrationId
    );

    setRegistrations(
      registrations.map((r) => {
        if (registration && r.id === eventIdOrRegistrationId)
          return { ...r, checkedIn: true };
        if (
          !registration &&
          r.eventId === eventIdOrRegistrationId &&
          r.userId === user.id
        )
          return { ...r, checkedIn: true };
        return r;
      })
    );
  };

  const handleQuickRegister = (
    name: string,
    email: string,
    eventId: string
  ) => {
    const newUserId = `u${Date.now()}`;

    const newRegistration: Subscription = {
      id: `r${Date.now()}`,
      userId: newUserId,
      eventId,
      status: "active",
      checkedIn: true,
      registeredAt: new Date().toISOString(),
    };

    setRegistrations([...registrations, newRegistration]);
    updateEventCount(eventId, +1);
  };

  const renderPage = () => {
    if (user.isAdmin) {
      switch (currentPage) {
        case "users":
          return <UsersPage />;
        case "checkin":
          return (
            <CheckInPage
              events={events}
              registrations={registrations}
              onCheckIn={handleCheckIn}
              onQuickRegister={handleQuickRegister}
            />
          );
        case "emails":
          return <EmailsPage />;
        case "logs":
          return <LogsPage logs={mockLogs} />;
        default:
          return (
            <CheckInPage
              events={events}
              registrations={registrations}
              onCheckIn={handleCheckIn}
              onQuickRegister={handleQuickRegister}
            />
          );
      }
    }

    switch (currentPage) {
      case "events":
        return (
          <EventsPage
            registrations={registrations}
            onRegister={handleRegister}
            onCancelRegistration={handleCancelRegistration}
            onCheckIn={handleCheckIn}
          />
        );
      case "registrations":
        return <RegistrationsPage onNavigate={setCurrentPage} />;
      case "certificates":
        return <CertificatesPage />;
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

      <Toaster position="top-center" />
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
