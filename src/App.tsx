import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { VehicleList } from './components/VehicleList';
import { ContractList } from './components/ContractList';
import { ClientList } from './components/ClientList';
import { MaintenanceList } from './components/MaintenanceList';
import { GPSModule } from './components/GPSModule';
import { ReservationList } from './components/ReservationList';
import { ReportsModule } from './components/ReportsModule';
import { SettingsModule } from './components/SettingsModule';
import { NotificationCenter } from './components/NotificationCenter';
import { InvoiceList } from './components/InvoiceList';
import { Login } from './components/Login';
import { Menu, Car, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout

function AppContent() {
  const { userProfile, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Auth & Session Logic ---

  const resetInactivityTimer = () => {
    if (!userProfile) return;

    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    inactivityTimerRef.current = setTimeout(() => {
      signOut();
    }, SESSION_TIMEOUT_MS);
  };

  // Setup Inactivity Listeners
  useEffect(() => {
    if (!userProfile) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => resetInactivityTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetInactivityTimer(); // Start timer

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [userProfile]);

  // --- View Routing ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [navigationData, setNavigationData] = useState<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNavigate = (view: string, data?: any) => {
    setNavigationData(data);
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'vehicles':
        return <VehicleList />;
      case 'contracts':
        return <ContractList initialData={navigationData} />;
      case 'clients':
        return <ClientList />;
      case 'maintenance':
        return <MaintenanceList />;
      case 'gps':
        return <GPSModule />;
      case 'reservations':
        return <ReservationList onNavigate={handleNavigate} />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule currentUser={userProfile} />;
      case 'invoices':
        return <InvoiceList />;
      default:
        return <Dashboard />;
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!userProfile) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="fixed top-0 z-30 flex w-full items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Car className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold text-slate-900">Go<span className="text-blue-600">Rent</span></span>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
          {userProfile?.name.charAt(0)}
        </div>
      </div>

      <Sidebar
        currentView={currentView}
        onChangeView={(view) => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onLogout={signOut}
        currentUser={userProfile}
      />

      {/* Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsNotificationOpen(false);
        }}
      />

      {/* Main Content Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="min-h-screen p-4 pt-20 sm:ml-64 sm:p-8 sm:pt-8">
        <div className="mx-auto max-w-7xl animate-in fade-in duration-300">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}