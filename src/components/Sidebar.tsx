import React from 'react';
import { 
  LayoutDashboard, Car, FileText, Users, Wrench, 
  MapPin, Calendar, Settings, DollarSign, LogOut, 
  Menu, X, Bell
} from 'lucide-react';
import { UserProfile } from '../types';
import { VIEWS } from '../constants';

type View = 'dashboard' | 'vehicles' | 'contracts' | 'clients' | 'maintenance' | 'gps' | 'reservations' | 'reports' | 'invoices' | 'settings';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: View) => void;
  isOpen: boolean;
  onOpenNotifications: () => void;
  onLogout: () => void;
  currentUser: UserProfile | null;
}

const navItems = [
  { view: 'dashboard', label: 'لوحة القيادة (Dashboard)', icon: LayoutDashboard },
  { view: 'contracts', label: 'العقود (Contracts)', icon: FileText },
  { view: 'invoices', label: 'الفواتير (Facturation)', icon: DollarSign },
  { view: 'vehicles', label: 'المركبات (Parc Auto)', icon: Car },
  { view: 'clients', label: 'الزبناء (Clients)', icon: Users },
  { view: 'reservations', label: 'الحجوزات (Réservations)', icon: Calendar },
  { view: 'maintenance', label: 'الصيانة (Maintenance)', icon: Wrench },
  { view: 'gps', label: 'تتبع (GPS)', icon: MapPin },
  { view: 'reports', label: 'التقارير (Rapports)', icon: Settings },
  { view: 'settings', label: 'الإعدادات (Settings)', icon: Settings }
];

const NavItem: React.FC<{
  item: typeof navItems[0];
  currentView: string;
  onChangeView: (view: View) => void;
}> = ({ item, currentView, onChangeView }) => (
  <button
    onClick={() => onChangeView(item.view as View)}
    className={`flex items-center w-full p-3 rounded-xl transition-colors ${
      currentView === item.view
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
    }`}
  >
    <item.icon className="h-5 w-5 mr-3" />
    <span className="font-medium">{item.label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onChangeView,
  isOpen,
  onOpenNotifications,
  onLogout,
  currentUser
}) => {
  return (
    <>
      {/* Static Sidebar for Desktop (sm+) */}
      <aside
        id="default-sidebar"
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-slate-100 transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col overflow-y-auto px-4 py-4 sm:py-6">
          
          {/* Header & Logo (Hidden on Desktop, Visible on Mobile Menu) */}
          <div className="flex items-center justify-between py-2 mb-4 sm:hidden">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Car className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 ml-2">Go<span className="text-blue-600">Rent</span></span>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center p-3 mb-6 bg-slate-50 rounded-xl border border-slate-100">
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg mr-3">
                {currentUser?.name.charAt(0)}
             </div>
             <div>
                <p className="text-sm font-semibold text-slate-800">{currentUser?.name}</p>
                <p className="text-xs text-slate-500">{currentUser?.role}</p>
             </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavItem 
                key={item.view} 
                item={item} 
                currentView={currentView} 
                onChangeView={onChangeView} 
              />
            ))}
          </div>

          {/* Logout/Footer Actions */}
          <div className="mt-auto border-t border-slate-100 pt-4 space-y-2">
             <button
                onClick={onOpenNotifications}
                className="flex items-center w-full p-3 rounded-xl transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-800"
             >
                <Bell className="h-5 w-5 mr-3" />
                <span className="font-medium">الإشعارات</span>
             </button>
             <button
                onClick={onLogout}
                className="flex items-center w-full p-3 rounded-xl transition-colors text-red-500 hover:bg-red-50 hover:text-red-700"
             >
                <LogOut className="h-5 w-5 mr-3" />
                <span className="font-medium">تسجيل الخروج</span>
             </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button (Hidden on Desktop) is in App.tsx */}
    </>
  );
};