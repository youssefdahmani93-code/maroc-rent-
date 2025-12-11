
import React, { useState } from 'react';
import { 
  Wrench, Calendar, Search, Filter, Plus, AlertTriangle, 
  CheckCircle, Clock, FileText, Download, Trash2, Edit, 
  ArrowLeft, DollarSign, Gauge, Info
} from 'lucide-react';
import { MOCK_MAINTENANCE, MOCK_VEHICLES, formatCurrency } from '../constants';
import { MaintenanceRecord, MaintenanceStatus, MaintenanceType } from '../types';

type ViewMode = 'LIST' | 'FORM' | 'DETAILS';

export const MaintenanceList: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(MOCK_MAINTENANCE);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  // Empty form state
  const initialFormState: MaintenanceRecord = {
    id: '',
    vehicleId: '',
    type: MaintenanceType.OIL_CHANGE,
    description: '',
    garage: '',
    entryDate: new Date().toISOString().split('T')[0],
    currentMileage: 0,
    partsCost: 0,
    laborCost: 0,
    totalCost: 0,
    status: MaintenanceStatus.TODO
  };

  const [formData, setFormData] = useState<MaintenanceRecord>(initialFormState);

  // --- Helpers ---

  const getVehicleDetails = (id: string) => MOCK_VEHICLES.find(v => v.id === id);

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.COMPLETED: return 'bg-green-100 text-green-800 border-green-200';
      case MaintenanceStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border-blue-200';
      case MaintenanceStatus.URGENT: return 'bg-red-100 text-red-800 border-red-200';
      case MaintenanceStatus.TODO: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = (record: MaintenanceRecord) => {
    if (record.status === MaintenanceStatus.IN_PROGRESS) {
      alert("Impossible de supprimer une maintenance en cours.");
      return;
    }
    if (window.confirm("Voulez-vous vraiment supprimer cet enregistrement ?")) {
      setMaintenanceRecords(maintenanceRecords.filter(m => m.id !== record.id));
      if (selectedRecord?.id === record.id) setViewMode('LIST');
    }
  };

  const handleSubmit = () => {
    if (!formData.vehicleId || !formData.description) {
      alert("Veuillez sélectionner un véhicule et ajouter une description.");
      return;
    }

    // Auto-calc total
    const total = Number(formData.partsCost) + Number(formData.laborCost);
    const recordToSave = { ...formData, totalCost: total };

    if (selectedRecord) {
      setMaintenanceRecords(maintenanceRecords.map(m => m.id === selectedRecord.id ? recordToSave : m));
    } else {
      setMaintenanceRecords([{ ...recordToSave, id: `m-${Date.now()}` }, ...maintenanceRecords]);
    }
    setViewMode('LIST');
  };

  // --- Views ---

  const renderList = () => {
    let filtered = maintenanceRecords.filter(rec => {
      const vehicle = getVehicleDetails(rec.vehicleId);
      const searchString = `${vehicle?.brand} ${vehicle?.model} ${vehicle?.plate} ${rec.description}`.toLowerCase();
      const matchesSearch = searchString.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || rec.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    if (showUrgentOnly) {
      filtered = filtered.filter(rec => rec.status === MaintenanceStatus.URGENT || rec.status === MaintenanceStatus.TODO);
    }

    return (
      <div className="space-y-6">
        {/* Header & Actions */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Maintenance & Suivi</h2>
            <p className="text-sm text-slate-500">Entretiens, réparations et contrôles techniques.</p>
          </div>
          <div className="flex gap-2">
             <button 
              onClick={() => setShowUrgentOnly(!showUrgentOnly)}
              className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                showUrgentOnly 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Urgences
            </button>
            <button className="flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </button>
            <button 
              onClick={() => {
                setFormData(initialFormState);
                setSelectedRecord(null);
                setViewMode('FORM');
              }}
              className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </button>
          </div>
        </div>

        {/* KPIs Summary (Optional but useful) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase">Total Dépenses (2024)</p>
            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(maintenanceRecords.reduce((acc, curr) => acc + curr.totalCost, 0))}
            </p>
          </div>
           <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase">En cours</p>
            <p className="text-xl font-bold text-blue-600">
              {maintenanceRecords.filter(m => m.status === MaintenanceStatus.IN_PROGRESS).length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase">À faire / Urgent</p>
            <p className="text-xl font-bold text-red-600">
              {maintenanceRecords.filter(m => m.status === MaintenanceStatus.TODO || m.status === MaintenanceStatus.URGENT).length}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase">Terminées</p>
            <p className="text-xl font-bold text-green-600">
              {maintenanceRecords.filter(m => m.status === MaintenanceStatus.COMPLETED).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par véhicule, immatriculation..."
              className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select 
                className="rounded-md border border-slate-300 bg-white py-2 pl-10 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">Tous statuts</option>
                {Object.values(MaintenanceStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Véhicule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Type / Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date / Garage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Coût</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filtered.map((rec) => {
                  const vehicle = getVehicleDetails(rec.vehicleId);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-slate-900">{vehicle?.brand} {vehicle?.model}</div>
                        <div className="text-xs text-slate-500">{vehicle?.plate}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{rec.type}</div>
                        <div className="truncate text-xs text-slate-500 max-w-[200px]">{rec.description}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-slate-900">{new Date(rec.entryDate).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500">{rec.garage}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-bold text-slate-700">{formatCurrency(rec.totalCost)}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                         <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(rec.status)}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => { setSelectedRecord(rec); setViewMode('DETAILS'); }}
                            className="text-slate-400 hover:text-blue-600" title="Voir">
                            <Info className="h-5 w-5" />
                          </button>
                          <button 
                             onClick={() => { setFormData(rec); setSelectedRecord(rec); setViewMode('FORM'); }}
                            className="text-slate-400 hover:text-indigo-600" title="Modifier">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(rec)}
                            className="text-slate-400 hover:text-red-600" title="Supprimer">
                            <Trash2 className="h-5 w-5" />
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
      </div>
    );
  };

  const renderForm = () => (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">
          {selectedRecord ? 'Modifier Maintenance' : 'Ajouter Maintenance'}
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
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Enregistrer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Vehicle & Type */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-slate-900">Intervention</h3>
          </div>
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-slate-700">Véhicule *</label>
                <select 
                  value={formData.vehicleId}
                  onChange={(e) => {
                    const vehicle = MOCK_VEHICLES.find(v => v.id === e.target.value);
                    setFormData({...formData, vehicleId: e.target.value, currentMileage: vehicle ? vehicle.mileage : 0});
                  }}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- Sélectionner --</option>
                  {MOCK_VEHICLES.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} - {v.plate}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Type *</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as MaintenanceType})}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {Object.values(MaintenanceType).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description du problème</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Statut actuel</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as MaintenanceStatus})}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                   {Object.values(MaintenanceStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
          </div>
        </div>

        {/* Details & Costs */}
        <div className="space-y-6">
           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-slate-900">Détails & Garage</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Garage / Tech.</label>
                  <input 
                    type="text" 
                    value={formData.garage}
                    onChange={e => setFormData({...formData, garage: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700">Kilométrage</label>
                  <input 
                    type="number" 
                    value={formData.currentMileage}
                    onChange={e => setFormData({...formData, currentMileage: Number(e.target.value)})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700">Date Entrée</label>
                  <input 
                    type="date" 
                    value={formData.entryDate}
                    onChange={e => setFormData({...formData, entryDate: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700">Date Sortie (Prévue)</label>
                  <input 
                    type="date" 
                    value={formData.exitDate || ''}
                    onChange={e => setFormData({...formData, exitDate: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                  />
                </div>
              </div>
           </div>

           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-slate-900">Coûts (MAD)</h3>
              </div>
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Pièces</label>
                      <input 
                        type="number" 
                        value={formData.partsCost}
                        onChange={e => setFormData({...formData, partsCost: Number(e.target.value), totalCost: Number(e.target.value) + formData.laborCost})}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                      />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-slate-700">Main d'œuvre</label>
                      <input 
                        type="number" 
                        value={formData.laborCost}
                        onChange={e => setFormData({...formData, laborCost: Number(e.target.value), totalCost: formData.partsCost + Number(e.target.value)})}
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                      />
                    </div>
                 </div>
                 <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="font-bold text-slate-700">Total</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(Number(formData.partsCost) + Number(formData.laborCost))}
                    </span>
                 </div>
              </div>
           </div>

           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-slate-900">Prévention</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-700">Prochaine maintenance (KM)</label>
                    <input 
                      type="number" 
                      value={formData.nextServiceMileage || ''}
                      onChange={e => setFormData({...formData, nextServiceMileage: Number(e.target.value)})}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                    />
                 </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Prochaine date</label>
                    <input 
                      type="date" 
                      value={formData.nextServiceDate || ''}
                      onChange={e => setFormData({...formData, nextServiceDate: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderDetails = () => {
    if (!selectedRecord) return null;
    const vehicle = getVehicleDetails(selectedRecord.vehicleId);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <button 
              onClick={() => setViewMode('LIST')}
              className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </button>
            <div className="flex gap-2">
               <button className="flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Download className="mr-2 h-4 w-4" /> PDF
              </button>
              <button 
                onClick={() => { setFormData(selectedRecord); setViewMode('FORM'); }}
                className="flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Edit className="mr-2 h-4 w-4" /> Modifier
              </button>
            </div>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-md">
           {/* Invoice Header */}
           <div className="bg-slate-50 p-8 border-b border-slate-200">
              <div className="flex justify-between items-start">
                 <div>
                    <h1 className="text-2xl font-bold text-slate-900">Fiche de Maintenance</h1>
                    <p className="text-sm text-slate-500">#{selectedRecord.id}</p>
                 </div>
                 <div className="text-right">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold border ${getStatusColor(selectedRecord.status)}`}>
                      {selectedRecord.status}
                    </span>
                 </div>
              </div>
           </div>

           <div className="p-8">
              <div className="grid grid-cols-2 gap-12 mb-8">
                 <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Véhicule</h3>
                    <p className="text-lg font-medium text-slate-900">{vehicle?.brand} {vehicle?.model}</p>
                    <p className="text-slate-600">{vehicle?.plate}</p>
                    <div className="flex items-center mt-2 text-sm text-slate-500">
                       <Gauge className="h-4 w-4 mr-1" />
                       {selectedRecord.currentMileage.toLocaleString()} km
                    </div>
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Intervention</h3>
                    <p className="font-medium text-slate-900">{selectedRecord.type}</p>
                    <p className="text-slate-600">{selectedRecord.garage}</p>
                    <div className="flex items-center mt-2 text-sm text-slate-500">
                       <Calendar className="h-4 w-4 mr-1" />
                       {new Date(selectedRecord.entryDate).toLocaleDateString()}
                    </div>
                 </div>
              </div>

              <div className="mb-8">
                 <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Description</h3>
                 <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                    {selectedRecord.description}
                 </div>
              </div>

              <div className="border-t border-slate-200 pt-8">
                 <h3 className="text-lg font-bold text-slate-900 mb-4">Détails des Coûts</h3>
                 <table className="w-full">
                    <tbody className="divide-y divide-slate-100">
                       <tr className="py-2">
                          <td className="py-2 text-slate-600">Pièces & Matériel</td>
                          <td className="py-2 text-right font-medium text-slate-900">{formatCurrency(selectedRecord.partsCost)}</td>
                       </tr>
                       <tr className="py-2">
                          <td className="py-2 text-slate-600">Main d'œuvre</td>
                          <td className="py-2 text-right font-medium text-slate-900">{formatCurrency(selectedRecord.laborCost)}</td>
                       </tr>
                       <tr className="bg-slate-50">
                          <td className="py-3 px-2 font-bold text-slate-800">Total</td>
                          <td className="py-3 px-2 text-right font-bold text-blue-600 text-lg">{formatCurrency(selectedRecord.totalCost)}</td>
                       </tr>
                    </tbody>
                 </table>
              </div>

              {selectedRecord.notes && (
                 <div className="mt-8 border-t border-slate-200 pt-4">
                    <p className="text-xs font-bold text-slate-500 uppercase">Notes Internes</p>
                    <p className="text-sm text-slate-600 mt-1">{selectedRecord.notes}</p>
                 </div>
              )}
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
