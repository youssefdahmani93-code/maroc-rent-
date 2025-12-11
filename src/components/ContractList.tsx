import React, { useState, useEffect } from 'react';
import {
  Plus, Search, FileText, Printer, Download, Eye,
  Edit, Trash2, CheckCircle, XCircle, Calendar,
  User, Car, ArrowRight, PenTool, Loader2, DollarSign
} from 'lucide-react';
import { formatCurrency, AGENCIES } from '../constants';
import { Contract, ContractStatus, Client, Vehicle } from '../types';
import { contractsAPI, clientsAPI, vehiclesAPI } from '../lib/api';

type ViewMode = 'LIST' | 'FORM' | 'DETAILS';

interface ContractListProps {
  initialData?: any;
}

export const ContractList: React.FC<ContractListProps> = ({ initialData }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');

  // Data States
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Empty form state
  const initialFormState: any = {
    id: '',
    type: 'CONTRAT',
    client_id: '',
    vehicle_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    pickup_location: AGENCIES[0],
    return_location: AGENCIES[0],
    daily_rate: 0,
    total_days: 1,
    discount: 0,
    total_amount: 0,
    deposit: 0,
    paid_amount: 0,
    status: ContractStatus.DRAFT,
    reservation_id: '',
    notes: ''
  };

  const [formData, setFormData] = useState<any>(initialFormState);

  useEffect(() => {
    if (initialData && initialData.id) {
      console.log('📥 Received initial data for contract:', initialData);

      // Calculate days
      const start = new Date(initialData.startDate);
      const end = new Date(initialData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      setFormData({
        ...initialFormState,
        client_id: initialData.clientId,
        vehicle_id: initialData.vehicleId,
        start_date: initialData.startDate,
        end_date: initialData.endDate,
        pickup_location: initialData.pickupLocation,
        return_location: initialData.returnLocation,
        total_days: diffDays,
        total_amount: initialData.totalPrice,
        status: ContractStatus.DRAFT,
        reservation_id: initialData.id,
        notes: `Généré depuis la réservation #${initialData.id.slice(0, 8)}`
      });
      setViewMode('FORM');
    }
  }, [initialData]);

  // --- 1. Fetch Data (Contracts, Clients, Vehicles) ---
  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching contracts data from Backend API...');

      // 1. Get Contracts
      const contractsRes = await contractsAPI.getAll();
      console.log('📊 Contracts Data:', contractsRes.data);

      // 2. Get Clients
      const clientsRes = await clientsAPI.getAll();
      console.log('👥 Clients Data:', clientsRes.data?.length, 'clients');

      // 3. Get Vehicles
      const vehiclesRes = await vehiclesAPI.getAll();
      console.log('🚗 Vehicles Data:', vehiclesRes.data?.length, 'vehicles');

      if (contractsRes.data) {
        // Map Backend data to Frontend format
        const formattedContracts = contractsRes.data.map((c: any) => ({
          id: c.id,
          type: c.type,
          status: c.statut,
          contractNumber: c.numero,
          startDate: c.date_debut?.split('T')[0],
          endDate: c.date_fin?.split('T')[0],
          pickupLocation: c.lieu_depart,
          returnLocation: c.lieu_retour,
          dailyRate: c.prix_journalier,
          totalDays: c.nombre_jours,
          totalAmount: c.montant_total,
          paidAmount: c.acompte,
          deposit: c.caution,
          // Relations
          client: {
            id: c.client?.id,
            fullName: c.client?.nom || 'Inconnu',
            phone: c.client?.telephone,
            docNumber: c.client?.cin,
            licenseNumber: c.client?.permis,
            address: c.client?.adresse
          },
          vehicle: {
            id: c.vehicule?.id,
            brand: c.vehicule?.marque,
            model: c.vehicule?.modele,
            plate: c.vehicule?.immatriculation
          },
          // Flat IDs for editing
          clientId: c.client_id,
          vehicleId: c.vehicule_id
        }));
        setContracts(formattedContracts);
        console.log('✅ Formatted contracts:', formattedContracts.length);
      }

      if (clientsRes.data) {
        setClients(clientsRes.data.map((c: any) => ({
          ...c,
          id: c.id,
          fullName: c.nom
        })));
      }

      if (vehiclesRes.data) {
        setVehicles(vehiclesRes.data.map((v: any) => ({
          ...v,
          id: v.id,
          dailyRate: v.prix_journalier
        })));
      }

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Calculations ---
  const calculateTotal = (days: number, rate: number, discount: number = 0) => {
    return (days * rate) - discount;
  };

  // --- 2. Handle Save ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('🔵 Starting handleSave...');
    console.log('📝 Form Data:', formData);

    const total = calculateTotal(formData.total_days, formData.daily_rate, formData.discount);

    const contractPayload = {
      type: formData.type,
      statut: formData.status,
      client_id: formData.client_id,
      vehicule_id: formData.vehicle_id,
      date_debut: formData.start_date,
      date_fin: formData.end_date,
      lieu_depart: formData.pickup_location,
      lieu_retour: formData.return_location,
      prix_journalier: formData.daily_rate,
      nombre_jours: formData.total_days,
      reduction: formData.discount,
      montant_total: total,
      caution: formData.deposit,
      acompte: formData.paid_amount,
      reservation_id: formData.reservation_id,
      notes: formData.notes
    };

    console.log('📦 Contract Payload:', contractPayload);

    try {
      if (formData.id) {
        // Update
        console.log('🔄 Updating contract with ID:', formData.id);
        const { data } = await contractsAPI.update(formData.id, contractPayload);
        console.log('✅ Update Success:', data);
      } else {
        // Create
        console.log('➕ Creating new contract...');
        const { data } = await contractsAPI.create(contractPayload);
        console.log('✅ Insert Success:', data);
      }

      console.log('🔄 Refreshing data...');
      await fetchData();
      setViewMode('LIST');
      setFormData(initialFormState);
      console.log('✅ Contract saved successfully!');
    } catch (error: any) {
      console.error('❌ Error saving contract:', error);
      console.error('Error message:', error.response?.data?.message || error.message);
      alert('Erreur: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Handle Delete ---
  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce contrat ?')) {
      try {
        await contractsAPI.delete(id);
        setContracts(contracts.filter(c => c.id !== id));
      } catch (error) {
        console.error(error);
        alert('Erreur de suppression');
      }
    }
  };

  // --- Helper to Auto-fill Vehicle Price ---
  const handleVehicleChange = (vehicleId: string) => {
    const v = vehicles.find(v => v.id === vehicleId);
    if (v) {
      setFormData({
        ...formData,
        vehicle_id: vehicleId,
        daily_rate: v.dailyRate
      });
    }
  };

  // --- Render Helpers ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // --- Views ---

  const renderList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Contrats de Location</h2>
        <button
          onClick={() => {
            setSelectedContract(null);
            setFormData(initialFormState);
            setViewMode('FORM');
          }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Nouveau Contrat
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher client, véhicule, n° contrat..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 bg-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">Tous les états</option>
          <option value="ACTIVE">En cours</option>
          <option value="COMPLETED">Terminé</option>
          <option value="DRAFT">Brouillon</option>
        </select>
      </div>

      {loading && contracts.length === 0 ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Contrat</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Véhicule</th>
                <th className="px-6 py-3 font-medium">Dates</th>
                <th className="px-6 py-3 font-medium">Montant</th>
                <th className="px-6 py-3 font-medium text-center">État</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts
                .filter(c => filterStatus === 'All' || c.status === filterStatus)
                .filter(c =>
                  c.client?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((contract: any) => (
                  <tr key={contract.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-blue-600">
                      {contract.contractNumber || 'N/A'}
                      <div className="text-xs text-slate-400">{contract.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{contract.client?.fullName}</div>
                      <div className="text-xs text-slate-500">{contract.client?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{contract.vehicle?.brand} {contract.vehicle?.model}</div>
                      <div className="text-xs text-slate-500 font-mono">{contract.vehicle?.plate}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div>Du: {contract.startDate}</div>
                      <div>Au: {contract.endDate}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(contract.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedContract(contract); setViewMode('DETAILS'); }} className="p-1 hover:bg-slate-200 rounded"><Eye className="h-4 w-4 text-slate-500" /></button>
                        <button
                          onClick={() => {
                            setSelectedContract(contract);
                            setFormData({
                              id: contract.id,
                              client_id: contract.clientId,
                              vehicle_id: contract.vehicleId,
                              start_date: contract.startDate,
                              end_date: contract.endDate,
                              pickup_location: contract.pickupLocation,
                              return_location: contract.returnLocation,
                              daily_rate: contract.dailyRate,
                              total_days: contract.totalDays,
                              total_amount: contract.totalAmount,
                              deposit: contract.deposit,
                              paid_amount: contract.paidAmount || 0,
                              discount: 0,
                              status: contract.status,
                              contract_number: contract.contractNumber,
                              type: contract.type || 'CONTRAT',
                              notes: contract.notes || ''
                            });
                            setViewMode('FORM');
                          }}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(contract.id)} className="p-1 hover:bg-slate-200 rounded"><Trash2 className="h-4 w-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">{formData.id ? 'Modifier Contrat' : 'Nouveau Contrat'}</h3>
        <button onClick={() => setViewMode('LIST')} className="text-slate-500 hover:text-slate-800">Annuler</button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client & Vehicle Selection */}
        <div className="col-span-2 grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
            <select
              required
              className="w-full border rounded-lg p-2"
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            >
              <option value="">Sélectionner un client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Véhicule *</label>
            <select
              required
              className="w-full border rounded-lg p-2"
              value={formData.vehicle_id}
              onChange={(e) => handleVehicleChange(e.target.value)}
            >
              <option value="">Sélectionner un véhicule</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plate})</option>)}
            </select>
          </div>
        </div>

        {/* Dates & Locations */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date Début</label>
          <input type="datetime-local" className="w-full border rounded-lg p-2" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date Fin</label>
          <input type="datetime-local" className="w-full border rounded-lg p-2" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Lieu Départ</label>
          <select className="w-full border rounded-lg p-2" value={formData.pickup_location} onChange={e => setFormData({ ...formData, pickup_location: e.target.value })}>
            {AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Lieu Retour</label>
          <select className="w-full border rounded-lg p-2" value={formData.return_location} onChange={e => setFormData({ ...formData, return_location: e.target.value })}>
            {AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Financials */}
        <div className="col-span-2 grid grid-cols-3 gap-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Prix Journalier (DH)</label>
            <input type="number" className="w-full border rounded-lg p-2" value={formData.daily_rate} onChange={e => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Jours</label>
            <input type="number" className="w-full border rounded-lg p-2" value={formData.total_days} onChange={e => setFormData({ ...formData, total_days: parseInt(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Caution (DH)</label>
            <input type="number" className="w-full border rounded-lg p-2" value={formData.deposit} onChange={e => setFormData({ ...formData, deposit: parseFloat(e.target.value) })} />
          </div>
        </div>

        <div className="col-span-2 flex justify-between items-center border-t pt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">État du contrat</label>
            <select className="border rounded-lg p-2" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
              <option value="DRAFT">Brouillon</option>
              <option value="ACTIVE">Actif (Véhicule sorti)</option>
              <option value="COMPLETED">Terminé (Véhicule rentré)</option>
              <option value="CANCELLED">Annulé</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700">
            {loading ? 'Enregistrement...' : 'Enregistrer le Contrat'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderDetails = () => {
    if (!selectedContract) return null;
    return (
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
        {/* Printable Area Header */}
        <div className="bg-slate-800 text-white p-6 flex justify-between items-center print:bg-white print:text-black">
          <div>
            <h2 className="text-2xl font-bold">Contrat de Location</h2>
            <p className="text-slate-300">Réf: {selectedContract.contractNumber}</p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button onClick={() => window.print()} className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-sm">
              <Printer className="mr-2 h-4 w-4" /> Imprimer
            </button>
            <button onClick={() => setViewMode('LIST')} className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-sm">Fermer</button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Client & Vehicle Info Block */}
          <div className="grid grid-cols-2 gap-8">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h3 className="text-sm font-bold uppercase text-slate-500 mb-3 flex items-center"><User className="h-4 w-4 mr-2" /> Locataire</h3>
              <p className="font-bold text-lg text-slate-900">{selectedContract.client?.fullName}</p>
              <p className="text-slate-600">{selectedContract.client?.address}</p>
              <div className="mt-2 text-sm text-slate-500">
                <p>Tél: {selectedContract.client?.phone}</p>
                <p>Permis: {selectedContract.client?.licenseNumber}</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <h3 className="text-sm font-bold uppercase text-slate-500 mb-3 flex items-center"><Car className="h-4 w-4 mr-2" /> Véhicule</h3>
              <p className="font-bold text-lg text-slate-900">{selectedContract.vehicle?.brand} {selectedContract.vehicle?.model}</p>
              <div className="inline-block bg-white border px-2 py-1 rounded font-mono font-bold mt-1">
                {selectedContract.vehicle?.plate}
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3 text-left">Détails</th>
                  <th className="p-3 text-left">Départ</th>
                  <th className="p-3 text-left">Retour</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-3 font-medium">Dates & Heures</td>
                  <td className="p-3">{selectedContract.startDate}</td>
                  <td className="p-3">{selectedContract.endDate}</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Lieux</td>
                  <td className="p-3">{selectedContract.pickupLocation}</td>
                  <td className="p-3">{selectedContract.returnLocation}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financials Total */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Jours ({selectedContract.totalDays}) x Prix</span>
                <span>{formatCurrency(selectedContract.dailyRate * selectedContract.totalDays)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-slate-900 border-t pt-2">
                <span>Total à payer</span>
                <span>{formatCurrency(selectedContract.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Caution (Bloquée)</span>
                <span>{formatCurrency(selectedContract.deposit)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-12 mt-12 border-t">
            <div className="text-center">
              <p className="font-bold text-slate-400 mb-12">Signature Agence</p>
              <div className="border-b-2 border-slate-200"></div>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-400 mb-12">Signature Client</p>
              <div className="border-b-2 border-slate-200"></div>
              <p className="text-xs text-slate-400 mt-2">"Lu et approuvé"</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {viewMode === 'LIST' && renderList()}
      {viewMode === 'FORM' && renderForm()}
      {viewMode === 'DETAILS' && renderDetails()}
    </div>
  );
};