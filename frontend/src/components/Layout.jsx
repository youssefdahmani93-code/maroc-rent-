import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Truck, Calendar, Users, FileText, CreditCard, Wrench, MapPin, BarChart, Settings, LogOut, Menu, X } from 'lucide-react';

const navigationConfig = [
    { name: 'Tableau de bord', href: '/admin/dashboard', icon: Home, requiredPermission: null },
    { name: 'Véhicules', href: '/admin/vehicles', icon: Truck, requiredPermission: 'vehicles.view' },
    { name: 'Réservations', href: '/admin/reservations', icon: Calendar, requiredPermission: 'reservations.view' },
    { name: 'Clients', href: '/admin/clients', icon: Users, requiredPermission: 'clients.view' },
    { name: 'Devis & Factures', href: '/admin/contracts', icon: FileText, requiredPermission: 'contracts.view' },
    { name: 'Paiements', href: '/admin/payments', icon: CreditCard, requiredPermission: 'payments.view' },
    { name: 'Maintenance', href: '/admin/maintenance', icon: Wrench, requiredPermission: 'maintenance.view' },
    { name: 'GPS', href: '/admin/gps', icon: MapPin, requiredPermission: 'gps.read' }, 
    { name: 'Rapports', href: '/admin/reports', icon: BarChart, requiredPermission: 'reports.view' },
    { name: 'Paramètres', href: '/admin/settings', icon: Settings, requiredPermission: 'settings.view' },
];

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const hasPermission = (requiredPermission) => {
        if (!requiredPermission) return true;

        // Super Admin and Admin have all permissions by default
        if (user?.role === 'Super Admin' || user?.role === 'Admin') return true;
        
        const userPermissions = user?.permissions || [];
        const resource = requiredPermission.split('.')[0];
        const wildcardPermission = `${resource}.*`;
        return userPermissions.includes(requiredPermission) || userPermissions.includes(wildcardPermission);
    };

    const visibleNavigation = navigationConfig.filter(item => hasPermission(item.requiredPermission));

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                        <div className="flex items-center space-x-3">
                            <img src="/logo.jpg" alt="GoRent Logo" className="w-10 h-10 rounded-lg object-cover" />
                            <span className="text-xl font-bold text-white">GoRent</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="p-4 border-b border-slate-700/50">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {visibleNavigation.map((item) => (
                            <Link key={item.name} to={item.href} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${location.pathname.startsWith(item.href) ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`}>
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-700/50">
                        <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Déconnexion</span>
                        </button>
                    </div>
                </div>
            </aside>

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
                    <div className="flex items-center justify-between px-6 py-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white"><Menu className="w-6 h-6" /></button>
                        <div className="flex-1" />
                    </div>
                </header>

                <main className="p-6">{children}</main>
            </div>
        </div>
    );
};

export default Layout;
