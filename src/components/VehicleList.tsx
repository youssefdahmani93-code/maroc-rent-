import React, { useState, useEffect } from 'react';
import {
  Plus, Filter, Search, MapPin, Gauge, Fuel, Settings2,
  Edit, Trash2, Eye, ArrowLeft, Save, Car,
  FileText, Calendar, DollarSign, AlertTriangle, ShieldCheck,
  LayoutGrid, List as ListIcon, Loader2, History, Wrench
} from 'lucide-react';
import { AGENCIES, formatCurrency } from '../constants';
import { Vehicle, VehicleStatus, VehicleCategory, TransmissionType, FuelType, Contract, MaintenanceRecord } from '../types';
import { supabase } from '../lib/supabaseClient';

type ViewMode = 'LIST' | 'FORM' | 'DETAILS';
type Tab = 'GENERAL' | 'DOCUMENTS' | 'FINANCE';
type DetailTab = 'INFO' | 'HISTORY' | 'MAINTENANCE';

export const VehicleList: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<Tab>('GENERAL');
  const [detailTab, setDetailTab] = useState<DetailTab>('INFO');
  const [displayMode, setDisplayMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Related Data State
  const [relatedContracts, setRelatedContracts] = useState<Contract[]>([]);
  const [relatedMaintenance, setRelatedMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // --- Empty Form State ---
  const initialFormState: Vehicle = {
    id: '',
    brand: '',
    model: '',
    version: '',
    year: new Date().getFullYear(),
    plate: '',
    vin: '',
    category: VehicleCategory.ECONOMY,
    status: VehicleStatus.AVAILABLE,
    dailyRate: 0,
    weeklyRate: 0,
    monthlyRate: 0,
    purchasePrice: 0,
    currentValue: 0,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000', // Default Image
    transmission: TransmissionType.MANUAL,
    fuel: FuelType.DIESEL,
    seats: 5,
    color: '',
    fiscalPower: 6,
    mileage: 0,
    agencyId: AGENCIES[0],
    gpsId: '',
    insuranceExpiry: '',
    techVisitExpiry: '',
    images: []
  };

  const [formData, setFormData] = useState<Vehicle>(initialFormState);

  // --- 1. Fetch Data from Supabase ---
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedVehicles: Vehicle[] = data.map((v: any) => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          version: v.version,
          year: v.year,
          plate: v.plate,
          vin: v.vin,
          category: v.category as VehicleCategory,
          status: v.status as VehicleStatus,
          dailyRate: v.daily_rate,
          weeklyRate: v.weekly_rate,
          monthlyRate: v.monthly_rate,
          purchasePrice: v.purchase_price,
          currentValue: v.current_value,
          imageUrl: v.image_url || initialFormState.imageUrl,
          transmission: v.transmission as TransmissionType,
          fuel: v.fuel as FuelType,
          seats: v.seats,
          mileage: v.mileage,
          agencyId: v.agency_id,
          insuranceExpiry: v.insurance_expiry,
          techVisitExpiry: v.tech_visit_expiry,
          gpsId: v.gps_id,
          color: v.color,
          fiscalPower: 6, // افتراضي
          images: v.images || []
        }));
        setVehicles(formattedVehicles);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Fetch details when a vehicle is selected
  useEffect(() => {
    if (selectedVehicle && viewMode === 'DETAILS') {
      fetchVehicleDetails(selectedVehicle.id);
    }
  }, [selectedVehicle, viewMode]);

  const fetchVehicleDetails = async (vehicleId: string) => {
    setLoadingDetails(true);
    try {
      // Fetch Contracts
      const { data: contractsData, error: contractsError } = await supabase
        .from('contracts')
        .select('*, clients(full_name)')
        .eq('vehicle_id', vehicleId)
        .order('start_date', { ascending: false });

      if (contractsError) console.error('Error fetching contracts:', contractsError);
      else {
        // Map to Contract type (simplified mapping)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedContracts: any[] = contractsData?.map((c: any) => ({
          id: c.id,
          startDate: c.start_date,
          endDate: c.end_date,
          totalAmount: c.total_amount,
          client: { fullName: c.clients?.full_name || 'Inconnu' },
          status: c.status
        })) || [];
        setRelatedContracts(mappedContracts);
      }

      // Fetch Maintenance
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('entry_date', { ascending: false });

      if (maintenanceError) console.error('Error fetching maintenance:', maintenanceError);
      else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedMaintenance: any[] = maintenanceData?.map((m: any) => ({
          id: m.id,
          type: m.type,
          entryDate: m.entry_date,
          garage: m.garage,
          totalCost: m.total_cost,
          status: m.status
        })) || [];
        setRelatedMaintenance(mappedMaintenance);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // --- Helpers ---
  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.AVAILABLE: return 'bg-green-100 text-green-800 border-green-200';
      case VehicleStatus.RENTED: return 'bg-blue-100 text-blue-800 border-blue-200';
      case VehicleStatus.MAINTENANCE: return 'bg-orange-100 text-orange-800 border-orange-200';
      case VehicleStatus.OUT_OF_SERVICE: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const isExpiringSoon = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return true;
    return new Date(dateString) < new Date();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const newImages: string[] = [];
    setLoading(true);

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('vehicles')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('vehicles').getPublicUrl(filePath);
        newImages.push(data.publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
        imageUrl: prev.imageUrl || newImages[0] // Set first image as main if none exists
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error uploading images:', error);
      alert('Erreur lors du téléchargement des images: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, index) => index !== indexToRemove)
    }));
  };

  // --- 2. Handle Save (Create/Update) ---
  const handleSave = async () => {
    if (!formData.brand || !formData.model || !formData.plate) {
      alert("Veuillez remplir les champs obligatoires (Marque, Modèle, Matricule).");
      return;
    }

    setLoading(true);

    // تحضير البيانات لـ Supabase (snake_case)
    const vehicleData = {
      brand: formData.brand,
      model: formData.model,
      version: formData.version,
      year: formData.year,
      plate: formData.plate,
      vin: formData.vin,
      category: formData.category,
      status: formData.status,
      daily_rate: formData.dailyRate,
      weekly_rate: formData.weeklyRate,
      monthly_rate: formData.monthlyRate,
      purchase_price: formData.purchasePrice,
      current_value: formData.currentValue,
      image_url: formData.imageUrl,
      transmission: formData.transmission,
      fuel: formData.fuel,
      seats: formData.seats,
      mileage: formData.mileage,
      agency_id: formData.agencyId,
      tech_visit_expiry: formData.techVisitExpiry || null,
      gps_id: formData.gpsId,
      images: formData.images
    };

    try {
      if (selectedVehicle) {
        // Update
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', selectedVehicle.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('vehicles')
          .insert([vehicleData]);
        if (error) throw error;
      }

      await fetchVehicles();
      setViewMode('LIST');
      setFormData(initialFormState);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Handle Delete ---
  const handleDelete = async (vehicle: Vehicle) => {
    if (vehicle.status === VehicleStatus.RENTED) {
      alert("Impossible de supprimer un véhicule en cours de location.");
      return;
    }
    if (window.confirm(`Supprimer le véhicule ${vehicle.brand} ${vehicle.model} ?`)) {
      try {
        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicle.id);

        if (error) throw error;

        setVehicles(vehicles.filter(v => v.id !== vehicle.id));
        if (selectedVehicle?.id === vehicle.id) setViewMode('LIST');
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // --- Render Components ---

  const renderList = () => {
    const filteredVehicles = vehicles.filter(vehicle => {
      const matchesStatus = filterStatus === 'All' || vehicle.status === filterStatus;
      const matchesSearch =
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Flotte de véhicules</h2>
            <p className="text-sm text-slate-500">Gérez vos voitures, documents et état.</p>
          </div>
          <div className="flex gap-2">
            <div className="flex rounded-lg bg-white shadow-sm">
              <button
                onClick={() => setDisplayMode('GRID')}
                className={`p-2 rounded-l-lg border border-r-0 border-slate-300 ${displayMode === 'GRID' ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setDisplayMode('TABLE')}
                className={`p-2 rounded-r-lg border border-slate-300 ${displayMode === 'TABLE' ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <ListIcon className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => {
                setFormData(initialFormState);
                setSelectedVehicle(null);
                setViewMode('FORM');
              }}
              className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par modèle, marque ou matricule..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                className="rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">Tous les statuts</option>
                {Object.values(VehicleStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading && vehicles.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : displayMode === 'GRID' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </div>
                  {(isExpired(vehicle.insuranceExpiry) || isExpired(vehicle.techVisitExpiry)) && (
                    <div className="absolute top-3 left-3 rounded-full bg-red-500 p-1 text-white shadow-sm" title="Document expiré">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">{vehicle.brand} {vehicle.model}</h3>
                      <p className="text-sm text-slate-500">{vehicle.category} • {vehicle.year}</p>
                    </div>
                    <p className="text-lg font-bold text-blue-700">{vehicle.dailyRate} <span className="text-xs font-normal text-slate-500">DH</span></p>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1 rounded bg-slate-50 px-2 py-1">
                      <Settings2 className="h-3 w-3" /> {vehicle.transmission}
                    </div>
                    <div className="flex items-center gap-1 rounded bg-slate-50 px-2 py-1">
                      <Fuel className="h-3 w-3" /> {vehicle.fuel}
                    </div>
                    <div className="flex items-center gap-1 rounded bg-slate-50 px-2 py-1">
                      <Gauge className="h-3 w-3" /> {vehicle.mileage.toLocaleString()} km
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {vehicle.agencyId.split(' ')[0]}
                    </div>
                    <div className="font-mono font-medium text-slate-700">{vehicle.plate}</div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => { setSelectedVehicle(vehicle); setViewMode('DETAILS'); }}
                      className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => { setFormData(vehicle); setSelectedVehicle(vehicle); setViewMode('FORM'); }}
                      className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Véhicule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Matricule / Cat.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Agence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Docs</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img className="h-10 w-10 rounded-full object-cover mr-3" src={vehicle.imageUrl} alt="" />
                          <div>
                            <div className="font-bold text-slate-900">{vehicle.brand} {vehicle.model}</div>
                            <div className="text-xs text-slate-500">{vehicle.version}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-slate-900">{vehicle.plate}</div>
                        <div className="text-xs text-slate-500">{vehicle.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {vehicle.agencyId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold border ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isExpired(vehicle.insuranceExpiry) || isExpired(vehicle.techVisitExpiry) ? (
                          <span className="text-red-600 flex items-center text-xs font-bold"><AlertTriangle className="h-3 w-3 mr-1" /> Expiré</span>
                        ) : isExpiringSoon(vehicle.insuranceExpiry) ? (
                          <span className="text-orange-600 flex items-center text-xs font-bold"><AlertTriangle className="h-3 w-3 mr-1" /> Bientôt</span>
                        ) : (
                          <span className="text-green-600 flex items-center text-xs font-bold"><ShieldCheck className="h-3 w-3 mr-1" /> OK</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => { setSelectedVehicle(vehicle); setViewMode('DETAILS'); }} className="text-slate-400 hover:text-blue-600"><Eye className="h-5 w-5" /></button>
                          <button onClick={() => { setFormData(vehicle); setSelectedVehicle(vehicle); setViewMode('FORM'); }} className="text-slate-400 hover:text-indigo-600"><Edit className="h-5 w-5" /></button>
                          <button onClick={() => handleDelete(vehicle)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderForm = () => (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">
          {selectedVehicle ? 'Modifier Véhicule' : 'Ajouter un Véhicule'}
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setViewMode('LIST')}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Form Tabs */}
      <div className="flex border-b border-slate-200">
        {(['GENERAL', 'DOCUMENTS', 'FINANCE'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab === 'GENERAL' && 'Infos Générales'}
            {tab === 'DOCUMENTS' && 'Documents & Dates'}
            {tab === 'FINANCE' && 'Financier & Tarifs'}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'GENERAL' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 mb-4">Identification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Marque *</label>
                  <input type="text" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Modèle *</label>
                  <input type="text" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Version</label>
                  <input type="text" value={formData.version} onChange={e => setFormData({ ...formData, version: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Année</label>
                  <input type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Matricule (Plate) *</label>
                <input type="text" value={formData.plate} onChange={e => setFormData({ ...formData, plate: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm uppercase" placeholder="12345-A-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">N° Châssis (VIN)</label>
                <input type="text" value={formData.vin || ''} onChange={e => setFormData({ ...formData, vin: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Image URL (Principale)</label>
                <input type="text" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" placeholder="https://..." />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Galerie Photos</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.images?.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={img} alt={`Vehicle ${idx}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-50 transition-colors">
                    <Plus className="h-8 w-8 text-slate-400" />
                    <span className="text-xs text-slate-500 mt-2">Ajouter des photos</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 mb-4">Caractéristiques & État</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Catégorie</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as VehicleCategory })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm">
                    {Object.values(VehicleCategory).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Carburant</label>
                  <select value={formData.fuel} onChange={e => setFormData({ ...formData, fuel: e.target.value as FuelType })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm">
                    {Object.values(FuelType).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Transmission</label>
                  <select value={formData.transmission} onChange={e => setFormData({ ...formData, transmission: e.target.value as TransmissionType })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm">
                    {Object.values(TransmissionType).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Places</label>
                  <input type="number" value={formData.seats} onChange={e => setFormData({ ...formData, seats: parseInt(e.target.value) })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Kilométrage</label>
                  <input type="number" value={formData.mileage} onChange={e => setFormData({ ...formData, mileage: parseInt(e.target.value) })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Agence</label>
                  <select value={formData.agencyId} onChange={e => setFormData({ ...formData, agencyId: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm">
                    {AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Statut</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as VehicleStatus })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm">
                  {Object.values(VehicleStatus).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'DOCUMENTS' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800">Suivi Administratif</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Date Fin Assurance</label>
                <input type="date" value={formData.insuranceExpiry || ''} onChange={e => setFormData({ ...formData, insuranceExpiry: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
                {isExpiringSoon(formData.insuranceExpiry) && <p className="text-xs text-orange-600 mt-1">Expire bientôt !</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Date Fin Visite Technique</label>
                <input type="date" value={formData.techVisitExpiry || ''} onChange={e => setFormData({ ...formData, techVisitExpiry: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Année Vignette</label>
                <input type="number" value={formData.vignetteYear || new Date().getFullYear()} onChange={e => setFormData({ ...formData, vignetteYear: parseInt(e.target.value) })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Tracker GPS ID</label>
                <input type="text" value={formData.gpsId || ''} onChange={e => setFormData({ ...formData, gpsId: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" placeholder="ex: gps-01" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'FINANCE' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800">Tarifs de Location (MAD)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Prix / Jour</label>
                <input type="number" value={formData.dailyRate} onChange={e => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Prix / Semaine</label>
                <input type="number" value={formData.weeklyRate || ''} onChange={e => setFormData({ ...formData, weeklyRate: parseFloat(e.target.value) })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Prix / Mois</label>
                <input type="number" value={formData.monthlyRate || ''} onChange={e => setFormData({ ...formData, monthlyRate: parseFloat(e.target.value) })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
              </div>
            </div>

            <h3 className="font-bold text-slate-800 pt-4 border-t border-slate-100">Valeur Véhicule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Prix d'achat</label>
                <input type="number" value={formData.purchasePrice || ''} onChange={e => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Valeur Actuelle (Estimée)</label>
                <input type="number" value={formData.currentValue || ''} onChange={e => setFormData({ ...formData, currentValue: parseFloat(e.target.value) })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDetails = () => {
    if (!selectedVehicle) return null;

    return (
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => setViewMode('LIST')} className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
          </button>
          <div className="flex gap-2">
            <button onClick={() => { setFormData(selectedVehicle); setViewMode('FORM'); }} className="flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </button>
            {selectedVehicle.status !== VehicleStatus.RENTED && (
              <button onClick={() => handleDelete(selectedVehicle)} className="flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100">
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
              </button>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="relative bg-slate-100 md:col-span-1 h-64 md:h-auto">
              <img src={selectedVehicle.imageUrl} className="h-full w-full object-cover" alt="Car" />
              <div className="absolute bottom-4 left-4">
                <span className={`rounded-full px-3 py-1 text-sm font-bold border shadow-sm ${getStatusColor(selectedVehicle.status)}`}>
                  {selectedVehicle.status}
                </span>
              </div>
            </div>
          </div>
          <div className="p-6 md:col-span-2">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{selectedVehicle.brand} {selectedVehicle.model}</h1>
                <p className="text-lg text-slate-500">{selectedVehicle.version} • {selectedVehicle.year}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700">{selectedVehicle.dailyRate} DH</p>
                <p className="text-xs text-slate-500">par jour</p>
              </div>
            </div>

            {/* Image Gallery Preview */}
            {selectedVehicle.images && selectedVehicle.images.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {selectedVehicle.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`View ${idx}`}
                    className="h-20 w-32 object-cover rounded-lg border border-slate-200 flex-shrink-0 cursor-pointer hover:opacity-80"
                    onClick={() => window.open(img, '_blank')}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500">Kilométrage</div>
                <div className="font-bold text-slate-800">{selectedVehicle.mileage.toLocaleString()} km</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500">Carburant</div>
                <div className="font-bold text-slate-800">{selectedVehicle.fuel}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500">Boîte</div>
                <div className="font-bold text-slate-800">{selectedVehicle.transmission}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500">Catégorie</div>
                <div className="font-bold text-slate-800">{selectedVehicle.category}</div>
              </div>
            </div>
          </div>
        </div>


        {/* Details Tabs */}
        <div>
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              <button onClick={() => setDetailTab('INFO')} className={`pb-4 px-1 text-sm font-medium border-b-2 ${detailTab === 'INFO' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Informations</button>
              <button onClick={() => setDetailTab('HISTORY')} className={`pb-4 px-1 text-sm font-medium border-b-2 ${detailTab === 'HISTORY' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Historique Location</button>
              <button onClick={() => setDetailTab('MAINTENANCE')} className={`pb-4 px-1 text-sm font-medium border-b-2 ${detailTab === 'MAINTENANCE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Maintenance</button>
            </nav>
          </div>

          <div className="mt-6">
            {detailTab === 'INFO' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-blue-600" /> Documents</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Assurance</span>
                      <span className={`font-medium ${isExpiringSoon(selectedVehicle.insuranceExpiry) ? 'text-orange-600' : 'text-slate-900'}`}>
                        {selectedVehicle.insuranceExpiry || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Visite Technique</span>
                      <span className="font-medium text-slate-900">{selectedVehicle.techVisitExpiry || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Matricule</span>
                      <span className="font-medium text-slate-900 bg-slate-100 px-2 rounded">{selectedVehicle.plate}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center"><DollarSign className="mr-2 h-5 w-5 text-green-600" /> Financier</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Prix d'achat</span>
                      <span className="font-medium text-slate-900">{formatCurrency(selectedVehicle.purchasePrice || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-slate-600">Revenu Total (Estimé)</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(relatedContracts.reduce((acc, c) => acc + c.totalAmount, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'HISTORY' && (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {loadingDetails ? (
                  <div className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" /></div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Dates</th>
                        <th className="px-6 py-3 text-right">Montant</th>
                        <th className="px-6 py-3 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {relatedContracts.map(contract => (
                        <tr key={contract.id}>
                          <td className="px-6 py-4 font-medium">{contract.client.fullName}</td>
                          <td className="px-6 py-4 text-slate-500">{contract.startDate} au {contract.endDate}</td>
                          <td className="px-6 py-4 text-right">{formatCurrency(contract.totalAmount)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${contract.status === ContractStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                              {contract.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {relatedContracts.length === 0 && (
                        <tr><td colSpan={4} className="p-6 text-center text-slate-500">Aucun historique trouvé.</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {detailTab === 'MAINTENANCE' && (
              <div className="space-y-4">
                {loadingDetails ? (
                  <div className="p-6 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" /></div>
                ) : (
                  <>
                    {relatedMaintenance.map(record => (
                      <div key={record.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                            <Wrench className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{record.type}</p>
                            <p className="text-xs text-slate-500">{record.entryDate} • {record.garage}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{formatCurrency(record.totalCost)}</p>
                          <span className="text-xs text-slate-500">{record.status}</span>
                        </div>
                      </div>
                    ))}
                    {relatedMaintenance.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                        Aucune maintenance enregistrée.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {viewMode === 'LIST' && renderList()}
      {viewMode === 'FORM' && renderForm()}
      {viewMode === 'DETAILS' && renderDetails()}
    </div>
  );
};
