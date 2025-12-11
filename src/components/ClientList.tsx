import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Filter, Eye, Edit, Trash2, User,
  Mail, Phone, MapPin, FileText, CreditCard,
  Download, ShieldAlert, CheckCircle, AlertTriangle,
  ArrowLeft, Calendar, RefreshCw
} from 'lucide-react';

import { formatCurrency } from '../constants';
import { Client, ClientStatus, Reservation } from '../types/index';
import { supabase } from '../lib/supabaseClient';

type ViewMode = 'LIST' | 'FORM' | 'DETAILS';

// Helper: Convert Supabase snake_case to camelCase
const formatClient = (client: any): Client => ({
  id: client.id,
  fullName: client.full_name,
  phone: client.phone,
  email: client.email,
  address: client.address,
  city: client.city,
  docType: client.doc_type,
  docNumber: client.doc_number,
  licenseNumber: client.license_number,
  status: client.status as ClientStatus,
  createdAt: client.created_at.split('T')[0],
  totalBookings: client.total_bookings || 0,
  notes: client.notes || '',
});

export const ClientList: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientReservations, setClientReservations] = useState<any[]>([]); // Using any for mapped reservation display

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Initial empty form state
  const initialFormState: Client = {
    id: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    docType: 'CIN',
    docNumber: '',
    licenseNumber: '',
    status: ClientStatus.NORMAL,
    createdAt: new Date().toISOString().split('T')[0],
    totalBookings: 0,
  };

  const [formData, setFormData] = useState<Client>(initialFormState);


  // --- 1. Fetch Data ---

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedClients = data.map(formatClient);
      setClients(formattedClients);

    } catch (error) {
      console.error('Error fetching clients:', error);
      alert('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);


  // --- 2. Fetch Client Details (Reservations) ---

  const fetchClientDetails = useCallback(async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, vehicles(brand, model)')
        .eq('client_id', clientId)
        .order('start_date', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedReservations = data.map((r: any) => ({
          id: r.id,
          vehicleSnapshot: r.vehicles ? `${r.vehicles.brand} ${r.vehicles.model}` : 'Véhicule inconnu',
          startDate: r.start_date,
          endDate: r.end_date,
          pickupLocation: r.pickup_location,
          totalPrice: r.total_price,
          status: r.status
        }));
        setClientReservations(formattedReservations);
      } else {
        setClientReservations([]);
      }
    } catch (err) {
      console.error("Error fetching client details:", err);
    }
  }, []);


  // --- 3. Handle Form Actions (Save/Edit) ---

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      full_name: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      doc_type: formData.docType,
      doc_number: formData.docNumber,
      license_number: formData.licenseNumber,
      status: formData.status,
      // total_bookings and created_at are handled by DB triggers/defaults
    };

    try {
      if (formData.id) {
        // Update existing client
        const { error } = await supabase.from('clients').update(payload).eq('id', formData.id);
        if (error) throw error;
      } else {
        // Create new client
        const { error } = await supabase.from('clients').insert([payload]);
        if (error) throw error;
      }

      await fetchClients();
      setViewMode('LIST');
      setFormData(initialFormState);

    } catch (error: any) {
      console.error('Error saving client:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  // --- 4. Handle Delete ---

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce client ? Tous les contrats liés doivent être gérés séparément.')) {
      setLoading(true);
      try {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;

        setClients(clients.filter(c => c.id !== id));
        if (selectedClient?.id === id) setViewMode('LIST');
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Erreur de suppression. Assurez-vous qu\'aucun contrat actif n\'est lié à ce client.');
      } finally {
        setLoading(false);
      }
    }
  };


  // --- 5. Render Helpers ---

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.RISKY: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ClientStatus.BLOCKED: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const handleEdit = (client: Client) => {
    setFormData(client);
    setViewMode('FORM');
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    fetchClientDetails(client.id);
    setViewMode('DETAILS');
  };


  // --- 6. Render Views ---

  const renderList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestion des Clients</h2>
        <button
          onClick={() => { setFormData(initialFormState); setViewMode('FORM'); }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Ajouter Client
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, CIN, téléphone..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Tous les statuts</option>
          {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && clients.length === 0 ? (
        <div className="flex justify-center p-12"><RefreshCw className="animate-spin h-8 w-8 text-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Nom Complet</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">Pièces d'identité</th>
                <th className="px-6 py-3 font-medium">Adresse</th>
                <th className="px-6 py-3 font-medium text-center">Statut</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients
                .filter(c => statusFilter === 'All' || c.status === statusFilter)
                .filter(c =>
                  c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.docNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.phone.includes(searchTerm)
                )
                .map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{client.fullName}</div>
                      <div className="text-xs text-slate-500">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center text-xs"><Phone className="h-3 w-3 mr-1" /> {client.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="text-xs font-semibold">{client.docType}: {client.docNumber}</div>
                      <div className="text-xs text-slate-500">Permis: {client.licenseNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {client.address}, {client.city}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleViewDetails(client)} className="p-1 hover:bg-slate-200 rounded"><Eye className="h-4 w-4 text-slate-500" /></button>
                        <button onClick={() => handleEdit(client)} className="p-1 hover:bg-slate-200 rounded"><Edit className="h-4 w-4 text-blue-500" /></button>
                        <button onClick={() => handleDelete(client.id)} className="p-1 hover:bg-slate-200 rounded"><Trash2 className="h-4 w-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {clients.length === 0 && !loading && (
            <div className="py-12 text-center text-slate-500">Aucun client trouvé.</div>
          )}
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">{formData.id ? 'Modifier Client' : 'Nouveau Client'}</h3>
        <button onClick={() => setViewMode('LIST')} className="text-slate-500 hover:text-slate-800">Annuler</button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom Complet *</label>
            <input type="text" className="w-full border rounded-lg p-2" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone *</label>
            <input type="tel" className="w-full border rounded-lg p-2" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" className="w-full border rounded-lg p-2" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse (Ville)</label>
            <input type="text" className="w-full border rounded-lg p-2" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
          </div>
        </div>

        {/* Identity Docs */}
        <div className="grid grid-cols-3 gap-4 border-t pt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type de Document</label>
            <select className="w-full border rounded-lg p-2" value={formData.docType} onChange={e => setFormData({ ...formData, docType: e.target.value as 'CIN' | 'PASSPORT' })}>
              <option value="CIN">CIN</option>
              <option value="PASSPORT">Passeport</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">N° Document *</label>
            <input type="text" className="w-full border rounded-lg p-2" required value={formData.docNumber} onChange={e => setFormData({ ...formData, docNumber: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">N° Permis de Conduire *</label>
            <input type="text" className="w-full border rounded-lg p-2" required value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} />
          </div>
        </div>

        {/* Status & Address */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Statut du Client</label>
            <select className="w-full border rounded-lg p-2" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as ClientStatus })}>
              {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse Complète</label>
            <input type="text" className="w-full border rounded-lg p-2" required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Enregistrement...' : 'Enregistrer Client'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderDetails = () => {
    if (!selectedClient) return null;
    const client = selectedClient;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setViewMode('LIST')} className="flex items-center text-slate-500 hover:text-slate-800 text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour à la liste
          </button>
          <div className="flex gap-2">
            <button onClick={() => handleEdit(client)} className="flex items-center bg-white border border-slate-300 hover:bg-slate-100 px-3 py-1 rounded text-sm text-blue-600">
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </button>
            <button onClick={() => handleDelete(client.id)} className="flex items-center bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-3 py-1 rounded text-sm">
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </button>
          </div>
        </div>

        {/* Client Header */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{client.fullName}</h1>
              <p className="text-md text-slate-600 mt-1">{client.email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold border mt-1 ${getStatusColor(client.status)}`}>
              {client.status}
            </span>
          </div>

          <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-slate-700"><Phone className="h-4 w-4 mr-2 text-blue-500" /> {client.phone}</div>
              <div className="flex items-center text-slate-700"><MapPin className="h-4 w-4 mr-2 text-blue-500" /> {client.address}, {client.city}</div>
              <div className="flex items-center text-slate-700"><Calendar className="h-4 w-4 mr-2 text-blue-500" /> Membre depuis: {client.createdAt}</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-slate-700"><FileText className="h-4 w-4 mr-2 text-blue-500" /> {client.docType}: <span className="font-bold ml-1">{client.docNumber}</span></div>
              <div className="flex items-center text-slate-700"><CreditCard className="h-4 w-4 mr-2 text-blue-500" /> Permis: <span className="font-bold ml-1">{client.licenseNumber}</span></div>
              <div className="flex items-center text-slate-700"><ShieldAlert className="h-4 w-4 mr-2 text-red-500" /> Total Contrats: <span className="font-bold ml-1">{client.totalBookings}</span></div>
            </div>
          </div>
        </div>

        {/* Reservations/Contracts History */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Historique des Réservations</h3>

          <div className="overflow-x-auto">
            <div className="min-w-full">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Véhicule</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Période</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Lieu</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Prix Total</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {clientReservations.length > 0 ? (
                    clientReservations.map((res: any) => (
                      <tr key={res.id}>
                        <td className="px-4 py-2 text-sm font-medium text-slate-900">
                          {res.vehicleSnapshot}
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-600">
                          {new Date(res.startDate).toLocaleDateString()} → {new Date(res.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-slate-900">
                          {res.pickupLocation}
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-900 text-right">
                          {formatCurrency(res.totalPrice)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${res.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-sm text-slate-500">
                        Aucune réservation trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {viewMode === 'LIST' && renderList()}
      {viewMode === 'FORM' && renderForm()}
      {viewMode === 'DETAILS' && renderDetails()}
    </div>
  );
};