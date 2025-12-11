
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Menu, Car } from 'lucide-react';
import { UserProfile } from './types';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes inactivity timeout

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const inactivityTimerRef = useRef<any>(null);

  // --- Auth & Session Logic ---

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    // Clear both storages to be safe
    localStorage.removeItem('gorent_user');
    sessionStorage.removeItem('gorent_user');
    
    setCurrentView('dashboard'); // Reset view
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticated) return;
    
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    
    inactivityTimerRef.current = setTimeout(() => {
      // Auto-logout
      handleLogout();
    }, SESSION_TIMEOUT_MS);
  }, [isAuthenticated, handleLogout]);

  const handleLogin = (user: UserProfile, rememberMe: boolean) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    if (rememberMe) {
      localStorage.setItem('gorent_user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('gorent_user', JSON.stringify(user));
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    // Check localStorage (Remember Me) or sessionStorage (Current Session)
    const storedUser = localStorage.getItem('gorent_user') || sessionStorage.getItem('gorent_user');
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.id) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (e) {
        localStorage.removeItem('gorent_user');
        sessionStorage.removeItem('gorent_user');
      }
    }
  }, []);

  // Setup Inactivity Listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => resetInactivityTimer();

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetInactivityTimer(); // Start timer

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [isAuthenticated, resetInactivityTimer]);

  // --- View Routing ---

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'vehicles':
        return <VehicleList />;
      case 'contracts':
        return <ContractList />;
      case 'clients':
        return <ClientList />;
      case 'maintenance':
        return <MaintenanceList />;
      case 'gps':
        return <GPSModule />;
      case 'reservations':
        return <ReservationList />;
      case 'reports':
        return <ReportsModule />;
       case 'settings':
        return <SettingsModule currentUser={currentUser} />;
      case 'invoices':
        return <InvoiceList />;
      default:
        return <Dashboard />;
    }
  };

  // --- Render ---

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
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
           {currentUser?.name.charAt(0)}
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
        onLogout={handleLogout}
        currentUser={currentUser}
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

export default App;
