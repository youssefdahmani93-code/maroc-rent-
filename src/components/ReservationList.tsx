import React, { useState, useEffect } from 'react';
import {
  Calendar, List, Plus, Search, Filter,
  CheckCircle, XCircle, Clock, MoreVertical,
  ArrowLeft, Car, User, FileText, CreditCard,
  Trash2, Edit, Eye, CalendarDays, Loader2
} from 'lucide-react';
import { AGENCIES, formatCurrency } from '../constants';
import { Reservation, ReservationStatus, Vehicle, Client, VehicleStatus } from '../types';
import { supabase } from '../lib/supabaseClient';

type ViewMode = 'LIST' | 'CALENDAR' | 'FORM' | 'DETAILS';

interface ReservationListProps {
  onNavigate?: (view: string, data?: any) => void;
}

export const ReservationList: React.FC<ReservationListProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // --- Form State ---
  const initialFormState: Reservation = {
    id: '',
    vehicleId: '',
    clientId: '',
    clientName: '',
    clientPhone: '',
    startDate: '',
    endDate: '',
    pickupLocation: AGENCIES[0],
    returnLocation: AGENCIES[0],
    totalPrice: 0,
    status: ReservationStatus.PENDING,
    createdAt: new Date().toISOString().split('T')[0]
  };
  const [formData, setFormData] = useState<Reservation>(initialFormState);

  // --- Data Fetching ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Reservations
      const { data: resData, error: resError } = await supabase
        .from('reservations')
        .select(`
          *,
          vehicle:vehicles (brand, model, plate, daily_rate),
          client:clients (full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (resError) throw resError;

      const formattedReservations: Reservation[] = resData.map((r: any) => ({
        id: r.id,
        vehicleId: r.vehicle_id,
        clientId: r.client_id,
        clientName: r.client?.full_name || 'Inconnu',
        clientPhone: r.client?.phone || '',
        startDate: r.start_date,
        endDate: r.end_date,
        pickupLocation: r.pickup_location,
        returnLocation: r.return_location,
        totalPrice: r.total_price,
        status: r.status as ReservationStatus,
        createdAt: r.created_at,
        // Helper properties for display
        vehicleBrand: r.vehicle?.brand,
        vehicleModel: r.vehicle?.model,
        vehiclePlate: r.vehicle?.plate
      }));
      setReservations(formattedReservations);

      // 2. Fetch Vehicles (for form & calendar)
      const { data: vData, error: vError } = await supabase
        .from('vehicles')
        .select('*');

      if (vError) throw vError;

      const formattedVehicles: Vehicle[] = vData.map((v: any) => ({
        id: v.id,
        brand: v.brand,
        model: v.model,
        plate: v.plate,
        category: v.category,
        status: v.status,
        dailyRate: v.daily_rate,
        imageUrl: v.image_url
      } as unknown as Vehicle));
      setVehicles(formattedVehicles);

      // 3. Fetch Clients (for form)
      const { data: cData, error: cError } = await supabase
        .from('clients')
        .select('*');

      if (cError) throw cError;

      const formattedClients: Client[] = cData.map((c: any) => ({
        id: c.id,
        fullName: c.full_name,
        phone: c.phone,
        email: c.email
      } as unknown as Client));
      setClients(formattedClients);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Helpers ---

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ReservationStatus.CONFIRMED: return 'bg-green-100 text-green-800 border-green-200';
      case ReservationStatus.ONGOING: return 'bg-blue-100 text-blue-800 border-blue-200';
      case ReservationStatus.COMPLETED: return 'bg-gray-100 text-gray-800 border-gray-200';
      case ReservationStatus.CANCELLED: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculatePrice = (vehicleId: string, start: string, end: string) => {
    if (!vehicleId || !start || !end) return 0;
    const v = vehicles.find(veh => veh.id === vehicleId);
    if (!v) return 0;

    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    return diffDays * v.dailyRate;
  };

  const checkAvailability = (vehicleId: string, start: string, end: string, excludeResId?: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();

    return !reservations.some(r => {
      if (r.id === excludeResId || r.status === ReservationStatus.CANCELLED) return false;
      if (r.vehicleId !== vehicleId) return false;

      const rStart = new Date(r.startDate).getTime();
      const rEnd = new Date(r.endDate).getTime();

      // Check overlap
      return (s < rEnd && e > rStart);
    });
  };

  const handleSubmit = async () => {
    if (!formData.clientId || !formData.vehicleId || !formData.startDate || !formData.endDate) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!checkAvailability(formData.vehicleId, formData.startDate, formData.endDate, selectedReservation?.id)) {
      alert("Ce véhicule n'est pas disponible pour les dates sélectionnées.");
      return;
    }

    setLoading(true);
    const totalPrice = calculatePrice(formData.vehicleId, formData.startDate, formData.endDate);

    const reservationData = {
      vehicle_id: formData.vehicleId,
      client_id: formData.clientId,
      start_date: formData.startDate,
      end_date: formData.endDate,
      pickup_location: formData.pickupLocation,
      return_location: formData.returnLocation,
      total_price: totalPrice,
      status: formData.status
    };

    try {
      if (selectedReservation) {
        // Update
        const { error } = await supabase
          .from('reservations')
          .update(reservationData)
          .eq('id', selectedReservation.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('reservations')
          .insert([reservationData]);
        if (error) throw error;
      }

      await fetchData();
      setViewMode('LIST');
      setFormData(initialFormState);
    } catch (error: any) {
      console.error('Error saving reservation:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (res: Reservation, newStatus: ReservationStatus) => {
    if (window.confirm(`Changer le statut de la réservation à ${newStatus} ?`)) {
      try {
        const { error } = await supabase
          .from('reservations')
          .update({ status: newStatus })
          .eq('id', res.id);

        if (error) throw error;

        // Update local state
        setReservations(reservations.map(r => r.id === res.id ? { ...r, status: newStatus } : r));
        if (selectedReservation && selectedReservation.id === res.id) {
          setSelectedReservation({ ...selectedReservation, status: newStatus });
        }
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Erreur lors de la mise à jour du statut');
      }
    }
  };

  // --- Views ---

  const renderList = () => {
    const filtered = reservations.filter(r => {
      const matchesSearch =
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        {/* Actions Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Réservations</h2>
            <p className="text-sm text-slate-500">Gérez le planning et les demandes.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('CALENDAR')}
              className="flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Planning
            </button>
            <button
              onClick={() => {
                setFormData(initialFormState);
                setSelectedReservation(null);
                setViewMode('FORM');
              }}
              className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Réservation
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Client, N° Réservation..."
              className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">Tous les statuts</option>
            {Object.values(ReservationStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading && reservations.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">N° / Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Véhicule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filtered.map((res) => {
                    // We use the joined data if available, or find in vehicles array
                    const vehicle = vehicles.find(v => v.id === res.vehicleId);
                    return (
                      <tr key={res.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="font-bold text-slate-900 text-xs">{res.id.slice(0, 8)}...</div>
                          <div className="text-sm text-slate-600">{res.clientName}</div>
                          <div className="text-xs text-slate-400">{res.clientPhone}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{vehicle?.brand} {vehicle?.model}</div>
                          <div className="text-xs text-slate-500">{vehicle?.plate}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex flex-col text-sm text-slate-600">
                            <span>Du: {new Date(res.startDate).toLocaleDateString()}</span>
                            <span>Au: {new Date(res.endDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-900">
                          {formatCurrency(res.totalPrice)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold border ${getStatusColor(res.status)}`}>
                            {res.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => { setSelectedReservation(res); setViewMode('DETAILS'); }}
                              className="text-slate-400 hover:text-blue-600" title="Détails">
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => { setFormData(res); setSelectedReservation(res); setViewMode('FORM'); }}
                              className="text-slate-400 hover:text-indigo-600" title="Modifier">
                              <Edit className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCalendar = () => {
    // Simplified Timeline View (Rows = Vehicles, Cols = Days of Month)
    const daysInMonth = 30; // Demo fixed
    const today = new Date().getDate();

    // Generate array [1..30]
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewMode('LIST')} className="rounded-full p-2 hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <h2 className="text-2xl font-bold text-slate-800">Planning</h2>
          </div>
          <div className="flex gap-2 text-sm">
            <div className="flex items-center gap-1"><div className="h-3 w-3 bg-blue-200 rounded"></div> En cours</div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 bg-green-200 rounded"></div> Confirmé</div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 bg-yellow-200 rounded"></div> En attente</div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              <div className="w-48 shrink-0 px-4 py-3 text-xs font-bold uppercase text-slate-500">Véhicule</div>
              <div className="flex flex-1">
                {days.map(d => (
                  <div key={d} className={`flex-1 border-l border-slate-100 py-2 text-center text-xs ${d === today ? 'bg-blue-50 font-bold text-blue-600' : 'text-slate-400'}`}>
                    {d}
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Rows */}
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="flex border-b border-slate-100 last:border-0 hover:bg-slate-50 relative h-12">
                <div className="w-48 shrink-0 px-4 py-2 flex flex-col justify-center border-r border-slate-100 bg-white z-10">
                  <span className="font-bold text-sm text-slate-900 truncate">{vehicle.brand} {vehicle.model}</span>
                  <span className="text-xs text-slate-500">{vehicle.plate}</span>
                </div>

                {/* Grid Background */}
                <div className="flex flex-1 absolute inset-0 left-48 h-full pointer-events-none">
                  {days.map(d => (
                    <div key={d} className={`flex-1 border-l border-slate-100 h-full ${d === today ? 'bg-blue-50/30' : ''}`}></div>
                  ))}
                </div>

                {/* Reservation Bars */}
                <div className="flex-1 relative h-full">
                  {reservations.filter(r => r.vehicleId === vehicle.id && r.status !== ReservationStatus.CANCELLED).map(res => {
                    // Simplified calc for demo 
                    const start = new Date(res.startDate).getDate();
                    const end = new Date(res.endDate).getDate();

                    // Only render if within range 1-30 (approx)
                    if (start > 30 || end < 1) return null;

                    const leftPct = ((Math.max(1, start) - 1) / 30) * 100;
                    const widthPct = ((Math.min(30, end) - Math.max(1, start)) / 30) * 100;

                    let colorClass = 'bg-blue-500';
                    if (res.status === ReservationStatus.CONFIRMED) colorClass = 'bg-green-500';
                    if (res.status === ReservationStatus.PENDING) colorClass = 'bg-yellow-500';

                    return (
                      <div
                        key={res.id}
                        onClick={() => { setSelectedReservation(res); setViewMode('DETAILS'); }}
                        className={`absolute top-2 bottom-2 rounded-md ${colorClass} text-white text-[10px] flex items-center justify-center overflow-hidden cursor-pointer shadow hover:brightness-110 z-20`}
                        style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 3)}%` }}
                        title={`${res.clientName} (${new Date(res.startDate).toLocaleDateString()} - ${new Date(res.endDate).toLocaleDateString()})`}
                      >
                        {widthPct > 10 && <span className="truncate px-1">{res.clientName}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    const availableVehicles = vehicles.filter(v => {
      // Filter availability only if dates are selected
      if (formData.startDate && formData.endDate) {
        return checkAvailability(v.id, formData.startDate, formData.endDate, selectedReservation?.id);
      }
      return true;
    });

    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-800">
            {selectedReservation ? 'Modifier Réservation' : 'Nouvelle Réservation'}
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setViewMode('LIST')}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Client Selection */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-slate-900">Client</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Client Existant</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => {
                    const c = clients.find(cl => cl.id === e.target.value);
                    if (c) {
                      setFormData({
                        ...formData,
                        clientId: c.id,
                        clientName: c.fullName,
                        clientPhone: c.phone
                      });
                    }
                  }}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Sélectionner --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                  ))}
                </select>
              </div>
              {/* Or manual entry fields would go here if no client selected */}
              <div className="border-t border-dashed border-slate-200 pt-4">
                <p className="text-xs text-slate-500 mb-2">Info contact (pré-rempli):</p>
                <input
                  disabled
                  value={formData.clientName}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 mb-2"
                  placeholder="Nom complet"
                />
                <input
                  disabled
                  value={formData.clientPhone}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                  placeholder="Téléphone"
                />
              </div>
            </div>
          </div>

          {/* Dates & Location */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-slate-900">Dates & Lieux</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Début</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Fin</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Agence Retrait</label>
                <select
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                >
                  {AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Agence Retour</label>
                <select
                  value={formData.returnLocation}
                  onChange={(e) => setFormData({ ...formData, returnLocation: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                >
                  {AGENCIES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-slate-900">Véhicule</h3>
              </div>
              <span className="text-xs text-slate-500">
                {formData.startDate && formData.endDate ?
                  `${availableVehicles.length} véhicules disponibles sur cette période` :
                  "Sélectionnez des dates pour voir la disponibilité"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableVehicles.map(v => (
                <div
                  key={v.id}
                  onClick={() => setFormData({ ...formData, vehicleId: v.id, totalPrice: calculatePrice(v.id, formData.startDate, formData.endDate) })}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${formData.vehicleId === v.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 hover:border-blue-300'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{v.brand} {v.model}</div>
                      <div className="text-xs text-slate-500">{v.category}</div>
                    </div>
                    <div className="text-sm font-bold text-blue-700">{v.dailyRate} <span className="text-[10px] font-normal text-slate-500">DH/j</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-slate-900">Total Estimé</h3>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(calculatePrice(formData.vehicleId, formData.startDate, formData.endDate))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetails = () => {
    if (!selectedReservation) return null;
    const vehicle = vehicles.find(v => v.id === selectedReservation.vehicleId);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewMode('LIST')}
            className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </button>
          <div className="flex gap-2">
            {selectedReservation.status === ReservationStatus.PENDING && (
              <button
                onClick={() => handleStatusChange(selectedReservation, ReservationStatus.CONFIRMED)}
                className="flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Confirmer
              </button>
            )}
            <button
              onClick={() => onNavigate?.('contracts', selectedReservation)}
              className="flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <FileText className="mr-2 h-4 w-4" /> Générer Contrat
            </button>
            <button
              onClick={() => handleStatusChange(selectedReservation, ReservationStatus.CANCELLED)}
              className="flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              <XCircle className="mr-2 h-4 w-4" /> Annuler
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Réservation #{selectedReservation.id.slice(0, 8)}...</h1>
                  <p className="text-sm text-slate-500">Créée le {new Date(selectedReservation.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(selectedReservation.status)}`}>
                  {selectedReservation.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Client</h3>
                  <p className="text-lg font-medium text-slate-900">{selectedReservation.clientName}</p>
                  <p className="text-slate-600">{selectedReservation.clientPhone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Véhicule</h3>
                  <p className="text-lg font-medium text-slate-900">{vehicle?.brand} {vehicle?.model}</p>
                  <p className="text-slate-600">{vehicle?.plate}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Détails du séjour</h3>
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg mb-4">
                <div>
                  <p className="text-xs text-slate-500">Départ</p>
                  <p className="font-bold text-slate-900">{new Date(selectedReservation.startDate).toLocaleDateString()} <span className="text-xs font-normal">{new Date(selectedReservation.startDate).toLocaleTimeString().slice(0, 5)}</span></p>
                  <p className="text-xs text-slate-500">{selectedReservation.pickupLocation}</p>
                </div>
                <div className="flex-1 border-t border-dashed border-slate-300 mx-4 relative top-1"></div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Retour</p>
                  <p className="font-bold text-slate-900">{new Date(selectedReservation.endDate).toLocaleDateString()} <span className="text-xs font-normal">{new Date(selectedReservation.endDate).toLocaleTimeString().slice(0, 5)}</span></p>
                  <p className="text-xs text-slate-500">{selectedReservation.returnLocation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Paiement</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">Total</span>
                <span className="text-xl font-bold text-blue-600">{formatCurrency(selectedReservation.totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-slate-500">Caution (bloquée)</span>
                <span className="font-medium text-slate-700">{formatCurrency(10000)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                <div className="bg-green-500 h-2 rounded-full w-1/3"></div>
              </div>
              <p className="text-xs text-slate-500 text-center">Acompte payé (30%)</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Checklist</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500" /> Identité vérifiée
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500" /> Permis valide
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="h-4 w-4 rounded-full border border-slate-300"></div> Contrat signé
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="h-4 w-4 rounded-full border border-slate-300"></div> Paiement complet
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {viewMode === 'LIST' && renderList()}
      {viewMode === 'CALENDAR' && renderCalendar()}
      {viewMode === 'FORM' && renderForm()}
      {viewMode === 'DETAILS' && renderDetails()}
    </div>
  );
};
