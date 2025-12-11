import React, { useState } from 'react';
import {
   Save, Building2, DollarSign, Car, FileText, Users,
   Wrench, MapPin, Bell, Shield, Monitor, CreditCard,
   Plus, Trash2, Edit, Check, X, Lock, Globe, RefreshCw,
   Search, Filter, MessageSquare, Mail, Download, CheckCircle, Info
} from 'lucide-react';
import { MOCK_SETTINGS, MOCK_USERS, DEFAULT_PERMISSIONS, DEFAULT_ALERT_CONFIGS } from '../constants';
import { SystemSettings, UserProfile, UserRole, VehicleCategory, UserPermissions, AlertConfig, NotificationCategory } from '../types';

type SettingsTab =
   | 'GENERAL' | 'FINANCE' | 'FLEET' | 'CONTRACTS' | 'USERS'
   | 'GENERAL' | 'FINANCE' | 'FLEET' | 'CONTRACTS' | 'USERS'
   | 'MAINTENANCE' | 'GPS' | 'ALERTS' | 'COMMUNICATION' | 'SYSTEM' | 'PAYMENTS' | 'BILLING';

const PERMISSION_LABELS: Record<keyof UserPermissions, string> = {
   manageReservations: 'Gérer les Réservations',
   manageContracts: 'Gérer les Contrats',
   viewFinancials: 'Voir les Finances',
   manageFleet: 'Gérer la Flotte',
   manageMaintenance: 'Gérer la Maintenance',
   manageUsers: 'Gérer les Utilisateurs',
   downloadReports: 'Télécharger les Rapports'
};

interface SettingsModuleProps {
   currentUser: UserProfile | null;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ currentUser }) => {
   const [activeTab, setActiveTab] = useState<SettingsTab>('GENERAL');
   const [settings, setSettings] = useState<SystemSettings>(MOCK_SETTINGS);
   const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
   const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>(DEFAULT_ALERT_CONFIGS);
   const [newMaintenanceType, setNewMaintenanceType] = useState('');

   // --- User Management State ---
   const [isUserModalOpen, setIsUserModalOpen] = useState(false);
   const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
   const [userSearchTerm, setUserSearchTerm] = useState('');
   const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

   const initialUserFormState: UserProfile = {
      id: '',
      name: '',
      email: '',
      phone: '',
      role: 'AGENT',
      active: true,
      permissions: DEFAULT_PERMISSIONS.AGENT
   };

   const [userFormData, setUserFormData] = useState<UserProfile>(initialUserFormState);

   // --- Helpers for User Management ---
   const handleUserToggle = (id: string) => {
      setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
   };

   const getRoleColor = (role: UserRole) => {
      switch (role) {
         case 'ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
         case 'MANAGER': return 'bg-blue-100 text-blue-800 border-blue-200';
         case 'AGENT': return 'bg-green-100 text-green-800 border-green-200';
         case 'ACCOUNTANT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
         case 'MECHANIC': return 'bg-orange-100 text-orange-800 border-orange-200';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const openUserModal = (user: UserProfile | null = null) => {
      if (user) {
         setEditingUser(user);
         setUserFormData(user);
      } else {
         setEditingUser(null);
         setUserFormData({ ...initialUserFormState, id: `u-${Date.now()}` });
      }
      setIsUserModalOpen(true);
   };

   const handleSaveUser = () => {
      if (!userFormData.name || !userFormData.email) {
         alert('Veuillez remplir le nom et l\'email.');
         return;
      }

      if (editingUser) {
         setUsers(users.map(u => u.id === editingUser.id ? userFormData : u));
      } else {
         setUsers([...users, userFormData]);
      }
      setIsUserModalOpen(false);
   };

   const handleDeleteUser = (id: string) => {
      if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
         setUsers(users.filter(u => u.id !== id));
      }
   };

   // --- Tabs Logic Based on Role ---
   // Determines which tabs are visible to the current user
   const getVisibleTabs = () => {
      const role = currentUser?.role;
      const baseTabs = [
         { id: 'GENERAL', label: 'Agence', icon: Building2 },
         { id: 'FLEET', label: 'Flotte', icon: Car },
         { id: 'CONTRACTS', label: 'Contrats', icon: FileText },
         { id: 'MAINTENANCE', label: 'Maintenance', icon: Wrench },
         { id: 'COMMUNICATION', label: 'Communication', icon: MessageSquare },
         { id: 'PAYMENTS', label: 'Paiements', icon: CreditCard },
      ];

      // Admins see everything
      if (role === 'ADMIN') {
         return [
            ...baseTabs,
            { id: 'FINANCE', label: 'Finances', icon: DollarSign },
            { id: 'USERS', label: 'Utilisateurs', icon: Users },
            { id: 'GPS', label: 'GPS / Tracking', icon: MapPin },
            { id: 'ALERTS', label: 'Alertes', icon: Bell },
            { id: 'SYSTEM', label: 'Système', icon: Monitor },
            { id: 'BILLING', label: 'Mon Abonnement', icon: CreditCard },
         ];
      }

      // Managers
      if (role === 'MANAGER') {
         return [
            ...baseTabs,
            { id: 'FINANCE', label: 'Finances', icon: DollarSign },
            { id: 'GPS', label: 'GPS / Tracking', icon: MapPin },
            { id: 'ALERTS', label: 'Alertes', icon: Bell },
         ];
      }

      // Accountants
      if (role === 'ACCOUNTANT') {
         return [
            { id: 'GENERAL', label: 'Agence', icon: Building2 },
            { id: 'FINANCE', label: 'Finances', icon: DollarSign },
            { id: 'CONTRACTS', label: 'Contrats', icon: FileText },
            { id: 'PAYMENTS', label: 'Paiements', icon: CreditCard },
         ];
      }

      // Mechanics
      if (role === 'MECHANIC') {
         return [
            { id: 'FLEET', label: 'Flotte', icon: Car },
            { id: 'MAINTENANCE', label: 'Maintenance', icon: Wrench },
         ];
      }

      // Agents
      return baseTabs;
   };

   const visibleTabs = getVisibleTabs();

   // --- Render Sections ---

   const renderGeneral = () => (
      <div className="space-y-6 max-w-4xl">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" /> Informations de l'Agence
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-700">Nom de l'agence</label>
               <input
                  type="text"
                  value={settings.agencyName}
                  onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
               />
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-700">Adresse complète</label>
               <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">Email officiel</label>
               <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">Téléphone</label>
               <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">ICE (Identifiant Commun Entreprise)</label>
               <input
                  type="text"
                  value={settings.ice}
                  onChange={(e) => setSettings({ ...settings, ice: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">Site Web</label>
               <input
                  type="text"
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
               />
            </div>
         </div>
      </div>
   );

   const renderFinance = () => (
      <div className="space-y-6 max-w-4xl">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" /> Paramètres Financiers
         </h3>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div>
                  <label className="block text-sm font-medium text-slate-700">Devise par défaut</label>
                  <select
                     value={settings.currency}
                     onChange={(e) => setSettings({ ...settings, currency: e.target.value as any })}
                     className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
                  >
                     <option value="MAD">MAD (Dirham Marocain)</option>
                     <option value="EUR">EUR (Euro)</option>
                     <option value="USD">USD (Dollar)</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700">Taux de TVA (%)</label>
                  <input
                     type="number"
                     value={settings.vatRate}
                     onChange={(e) => setSettings({ ...settings, vatRate: Number(e.target.value) })}
                     className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700">Caution par défaut (MAD)</label>
                  <input
                     type="number"
                     value={settings.defaultDeposit}
                     onChange={(e) => setSettings({ ...settings, defaultDeposit: Number(e.target.value) })}
                     className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
                  />
               </div>
            </div>
         </div>
      </div>
   );

   const renderFleet = () => (
      <div className="space-y-6 max-w-4xl">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-600" /> Configuration Flotte
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h4 className="text-sm font-bold text-slate-800 mb-4">Catégories de Véhicules</h4>
               <ul className="space-y-2">
                  {Object.values(VehicleCategory).map((cat, idx) => (
                     <li key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-sm text-slate-700">{cat}</span>
                        <button className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                     </li>
                  ))}
               </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h4 className="text-sm font-bold text-slate-800 mb-4">Carburants Supportés</h4>
               <ul className="space-y-2">
                  {['Diesel', 'Essence', 'Hybride', 'Électrique'].map((fuel, idx) => (
                     <li key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-sm text-slate-700">{fuel}</span>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                     </li>
                  ))}
               </ul>
            </div>
         </div>
      </div>
   );

   const renderContracts = () => (
      <div className="space-y-6 max-w-4xl">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" /> Contrats & Documents
         </h3>

         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
               <label className="block text-sm font-bold text-slate-700">Conditions Générales (CGU)</label>
            </div>
            <textarea
               rows={10}
               value={settings.termsAndConditions}
               onChange={(e) => setSettings({ ...settings, termsAndConditions: e.target.value })}
               className="block w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-mono text-slate-600 shadow-sm"
            />
         </div>
      </div>
   );

   const renderUsers = () => {
      const filteredUsers = users.filter(user => {
         const matchesSearch =
            user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
         const matchesStatus = userStatusFilter === 'ALL'
            ? true
            : userStatusFilter === 'ACTIVE' ? user.active : !user.active;
         return matchesSearch && matchesStatus;
      });

      return (
         <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" /> Gestion des Utilisateurs
               </h3>
               <div className="flex gap-2">
                  <button
                     onClick={() => openUserModal()}
                     className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                     <Plus className="h-4 w-4 mr-2" /> Ajouter un utilisateur
                  </button>
               </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                     type="text"
                     placeholder="Rechercher par nom ou email..."
                     value={userSearchTerm}
                     onChange={(e) => setUserSearchTerm(e.target.value)}
                     className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
               </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                     <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Utilisateur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Rôle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Statut</th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                     {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900">{user.name}</div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold border ${getRoleColor(user.role)}`}>
                                 {user.role}
                              </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              <div className="flex flex-col">
                                 <span>{user.email}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                 onClick={() => handleUserToggle(user.id)}
                                 className={`text-xs font-bold px-2 py-1 rounded transition-colors ${user.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                              >
                                 {user.active ? 'Actif' : 'Inactif'}
                              </button>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => openUserModal(user)} className="text-slate-400 hover:text-blue-600 mr-3"><Edit className="h-4 w-4" /></button>
                              <button onClick={() => handleDeleteUser(user.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            {/* Add/Edit User Modal */}
            {isUserModalOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
                     <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                        <h3 className="text-lg font-bold text-slate-800">
                           {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                        </h3>
                        <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                           <X className="h-6 w-6" />
                        </button>
                     </div>

                     <div className="p-6 space-y-6">
                        {/* Info Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-slate-700">Nom Complet *</label>
                              <input
                                 type="text"
                                 value={userFormData.name}
                                 onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                                 className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700">Email *</label>
                              <input
                                 type="email"
                                 value={userFormData.email}
                                 onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                 className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700">Téléphone</label>
                              <input
                                 type="text"
                                 value={userFormData.phone}
                                 onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                                 className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
                              <input
                                 type="password"
                                 placeholder="••••••"
                                 className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                              />
                           </div>
                        </div>

                        {/* Role Panel */}
                        <div className="border-t border-slate-100 pt-4">
                           <div className="mb-4">
                              <label className="block text-sm font-medium text-slate-700">Rôle de l'utilisateur</label>
                              <select
                                 value={userFormData.role}
                                 onChange={(e) => {
                                    const newRole = e.target.value as UserRole;
                                    setUserFormData({
                                       ...userFormData,
                                       role: newRole,
                                       permissions: DEFAULT_PERMISSIONS[newRole]
                                    });
                                 }}
                                 className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                              >
                                 <option value="ADMIN">Administrateur (Accès Total)</option>
                                 <option value="MANAGER">Manager Agence</option>
                                 <option value="AGENT">Agent de Réservation</option>
                                 <option value="ACCOUNTANT">Comptable</option>
                                 <option value="MECHANIC">Responsable Maintenance</option>
                              </select>
                           </div>
                        </div>

                        {/* Permissions Panel */}
                        <div className="border-t border-slate-100 pt-4">
                           <h4 className="text-sm font-bold text-slate-800 mb-3">Permissions</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(Object.keys(DEFAULT_PERMISSIONS.ADMIN) as Array<keyof UserPermissions>).map((perm) => (
                                 <label key={perm} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                       type="checkbox"
                                       checked={userFormData.permissions[perm]}
                                       onChange={(e) => setUserFormData({
                                          ...userFormData,
                                          permissions: {
                                             ...userFormData.permissions,
                                             [perm]: e.target.checked
                                          }
                                       })}
                                       className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">{PERMISSION_LABELS[perm]}</span>
                                 </label>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-xl">
                        <button
                           onClick={() => setIsUserModalOpen(false)}
                           className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                           Annuler
                        </button>
                        <button
                           onClick={handleSaveUser}
                           className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                           Enregistrer
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      );
   };

   const renderAlerts = () => (
      <div className="space-y-6 max-w-5xl">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" /> Configuration des Alertes
         </h3>

         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-white">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Seuil</th>
                     <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">Canaux</th>
                     <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Statut</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200 bg-white">
                  {alertConfigs.map(config => (
                     <tr key={config.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                           <div className="font-bold text-sm text-slate-900">{config.name}</div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              <input
                                 type="number"
                                 value={config.threshold}
                                 onChange={(e) => setAlertConfigs(configs => configs.map(c => c.id === config.id ? { ...c, threshold: Number(e.target.value) } : c))}
                                 className="w-16 rounded border border-slate-300 px-2 py-1 text-sm"
                              />
                              <span className="text-sm font-bold text-slate-700">{config.thresholdUnit}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="text-xs text-slate-500">Email, App, SMS</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button
                              onClick={() => setAlertConfigs(configs => configs.map(c => c.id === config.id ? { ...c, enabled: !c.enabled } : c))}
                              className={`w-10 h-5 inline-flex items-center rounded-full p-1 transition-colors ${config.enabled ? 'bg-green-500 justify-end' : 'bg-slate-300 justify-start'}`}
                           >
                              <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );

   const renderMaintenance = () => (
      <div className="space-y-6 max-w-4xl">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" /> Maintenance
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h4 className="text-sm font-bold text-slate-800 mb-4">Seuils & Alertes</h4>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700">Intervalle Vidange par défaut (KM)</label>
                     <input
                        type="number"
                        value={settings.maintenanceInterval}
                        onChange={(e) => setSettings({ ...settings, maintenanceInterval: Number(e.target.value) })}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );

   const renderGPS = () => (
      <div className="space-y-6 max-w-4xl">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" /> GPS & Tracking
         </h3>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-slate-700">Fournisseur GPS</label>
                  <select
                     value={settings.gpsProvider}
                     onChange={(e) => setSettings({ ...settings, gpsProvider: e.target.value })}
                     className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
                  >
                     <option value="Traccar">Traccar</option>
                     <option value="Wialon">Wialon</option>
                     <option value="Teltonika">Teltonika</option>
                  </select>
               </div>
            </div>
         </div>
      </div>
   );

   const renderCommunication = () => (
      <div className="space-y-6 max-w-4xl">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" /> Communication
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SMS */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
               <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-slate-900">SMS</p>
                  <button
                     onClick={() => setSettings({ ...settings, smsEnabled: !settings.smsEnabled })}
                     className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors ${settings.smsEnabled ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}
                  >
                     <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                  </button>
               </div>
            </div>
         </div>
      </div>
   );

   const renderSystem = () => (
      <div className="space-y-6 max-w-4xl">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-600" /> Système & Sécurité
         </h3>

         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1"><Globe className="inline h-4 w-4 mr-1" /> Langue</label>
                  <select
                     value={settings.language}
                     onChange={(e) => setSettings({ ...settings, language: e.target.value as any })}
                     className="block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
                  >
                     <option value="fr">Français</option>
                     <option value="ar">العربية</option>
                     <option value="en">English</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1"><Lock className="inline h-4 w-4 mr-1" /> Sécurité</label>
                  <div className="flex items-center justify-between mt-2">
                     <span className="text-sm text-slate-600">Authentification à deux facteurs (2FA)</span>
                     <button
                        onClick={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
                        className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${settings.twoFactorAuth ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}
                     >
                        <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );

   const renderPayments = () => (
      <div className="space-y-6 max-w-4xl">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" /> Paiements & Facturation
         </h3>
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Configuration Factures</h4>
            <div>
               <label className="block text-sm font-medium text-slate-700">Préfixe Facture</label>
               <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm"
               />
            </div>
         </div>
      </div>
   );

   const renderBilling = () => (
      <div className="space-y-6 max-w-4xl">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" /> Mon Abonnement (SaaS)
         </h3>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan Details */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">ACTIF</div>
               <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Plan Actuel</h4>
               <p className="text-3xl font-extrabold text-slate-900 mb-1">Entreprise</p>
               <p className="text-sm text-slate-600 mb-6">Accès complet à toutes les fonctionnalités.</p>

               <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-slate-900 font-bold">990 MAD <span className="text-slate-500 font-normal">/ mois</span></span>
                  <button className="text-sm text-blue-600 font-medium hover:underline">Changer</button>
               </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Moyen de paiement</h4>
               <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-16 bg-slate-50 rounded border border-slate-200 flex items-center justify-center">
                     <span className="font-bold text-slate-600 italic">VISA</span>
                  </div>
                  <div>
                     <p className="font-bold text-slate-900">•••• •••• •••• 4242</p>
                     <p className="text-xs text-slate-500">Expire le 12/2025</p>
                  </div>
               </div>
               <button className="w-full py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Mettre à jour la carte
               </button>
            </div>
         </div>

         {/* Invoices History */}
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
               <h4 className="font-bold text-slate-800">Historique de facturation</h4>
               <button className="text-xs text-blue-600 hover:underline">Tout télécharger</button>
            </div>
            <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-white">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Montant</th>
                     <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Statut</th>
                     <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Facture</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200 bg-white">
                  {[
                     { date: '01/06/2024', amount: '990.00 MAD', status: 'Payé' },
                     { date: '01/05/2024', amount: '990.00 MAD', status: 'Payé' },
                     { date: '01/04/2024', amount: '990.00 MAD', status: 'Payé' },
                  ].map((inv, i) => (
                     <tr key={i} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-600">{inv.date}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{inv.amount}</td>
                        <td className="px-6 py-4">
                           <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              <CheckCircle className="h-3 w-3" /> {inv.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="text-slate-400 hover:text-blue-600"><Download className="h-4 w-4" /></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );

   return (
      <div className="pb-20">
         <div className="flex items-center justify-between mb-6">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Paramètres</h2>
               <p className="text-sm text-slate-500">Configuration globale du système Go Rent.</p>
            </div>
            <button className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 shadow-sm">
               <Save className="h-4 w-4 mr-2" /> Enregistrer tout
            </button>
         </div>

         <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Tabs */}
            <nav className="w-full lg:w-64 flex-shrink-0 space-y-1">
               {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as SettingsTab)}
                        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                              ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                              : 'text-slate-600 hover:bg-slate-50'
                           }`}
                     >
                        <Icon className={`mr-3 h-5 w-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                        {tab.label}
                     </button>
                  );
               })}
            </nav>

            {/* Content Area */}
            <div className="flex-1 min-h-[500px] animate-in fade-in duration-300">
               {activeTab === 'GENERAL' && renderGeneral()}
               {activeTab === 'FINANCE' && renderFinance()}
               {activeTab === 'FLEET' && renderFleet()}
               {activeTab === 'CONTRACTS' && renderContracts()}
               {activeTab === 'USERS' && renderUsers()}
               {activeTab === 'MAINTENANCE' && renderMaintenance()}
               {activeTab === 'GPS' && renderGPS()}
               {activeTab === 'ALERTS' && renderAlerts()}
               {activeTab === 'COMMUNICATION' && renderCommunication()}
               {activeTab === 'SYSTEM' && renderSystem()}
               {activeTab === 'PAYMENTS' && renderPayments()}
               {activeTab === 'BILLING' && renderBilling()}
            </div>
         </div>
      </div>
   );
};