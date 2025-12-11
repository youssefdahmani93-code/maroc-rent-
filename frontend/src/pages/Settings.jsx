import { NavLink, Outlet } from 'react-router-dom';
import { Building, MapPin, Users, Shield, CreditCard, Wrench, Bell, Database } from 'lucide-react';

const tabs = [
    { id: 'company', label: 'Entreprise', icon: Building, href: '/admin/settings/company' },
    { id: 'agency', label: 'Agences', icon: MapPin, href: '/admin/settings/agency' },
    { id: 'users', label: 'Utilisateurs', icon: Users, href: '/admin/settings/users' },
    { id: 'roles', label: 'Rôles & Permissions', icon: Shield, href: '/admin/settings/roles' },
    { id: 'finance', label: 'Finance', icon: CreditCard, href: '/admin/settings/finance' },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, href: '/admin/settings/maintenance' },
    { id: 'gps', label: 'GPS', icon: MapPin, href: '/admin/settings/gps' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/admin/settings/notifications' },
    { id: 'system', label: 'Système', icon: Database, href: '/admin/settings/system' },
];

const Settings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Paramètres</h1>
                <p className="text-slate-400">Configuration générale et administration du système</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
                        <nav className="flex flex-col p-2 space-y-1">
                            {tabs.map((tab) => (
                                <NavLink
                                    key={tab.id}
                                    to={tab.href}
                                    className={({ isActive }) =>
                                        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                        }`}
                                >
                                    <tab.icon size={20} />
                                    <span className="font-medium">{tab.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="flex-1">
                    {/* Le contenu du sous-menu s'affichera ici */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Settings;
