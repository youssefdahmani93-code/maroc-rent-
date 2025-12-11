
import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Car, AlertTriangle, Battery, 
  Clock, Search, Radio, Filter, MoreVertical, PlayCircle, 
  Calendar, ShieldAlert, History, ArrowRight
} from 'lucide-react';
import { MOCK_GPS_DATA, MOCK_VEHICLES, MOCK_GPS_ALERTS, MOCK_TRIP_HISTORY } from '../constants';
import { GPSDevice, GPSStatus, Vehicle } from '../types';

export const GPSModule: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<GPSDevice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'LIVE' | 'HISTORY'>('LIVE');

  // Helpers
  const getVehicle = (id: string) => MOCK_VEHICLES.find(v => v.id === id);

  const getStatusColor = (status: GPSStatus) => {
    switch (status) {
      case GPSStatus.MOVING: return 'text-green-600 bg-green-100';
      case GPSStatus.IDLE: return 'text-blue-600 bg-blue-100';
      case GPSStatus.OFFLINE: return 'text-gray-500 bg-gray-100';
      case GPSStatus.ALERT: return 'text-red-600 bg-red-100';
    }
  };

  const getStatusDot = (status: GPSStatus) => {
    switch (status) {
      case GPSStatus.MOVING: return 'bg-green-500';
      case GPSStatus.IDLE: return 'bg-blue-500';
      case GPSStatus.OFFLINE: return 'bg-gray-400';
      case GPSStatus.ALERT: return 'bg-red-500 animate-pulse';
    }
  };

  // Simulated Map Positioning (Mocking a map view without an API key)
  // We define a bounding box for Casablanca/Rabat area and map lat/lng to % top/left
  // Min Lat: 33.52, Max Lat: 33.62, Min Lng: -7.70, Max Lng: -7.55 (Approx Casa)
  // For display purposes we scale loosely.
  const getMapPosition = (lat: number, lng: number) => {
    // Mock conversion for visual demo
    // Scale coordinates to fit in the box
    const minLat = 33.50;
    const maxLat = 34.00;
    const minLng = -7.80;
    const maxLng = -6.80;

    const bottom = ((lat - minLat) / (maxLat - minLat)) * 100;
    const left = ((lng - minLng) / (maxLng - minLng)) * 100;

    return { bottom: `${Math.max(5, Math.min(95, bottom))}%`, left: `${Math.max(5, Math.min(95, left))}%` };
  };

  const filteredDevices = MOCK_GPS_DATA.filter(d => {
    const v = getVehicle(d.vehicleId);
    const searchString = `${v?.brand} ${v?.model} ${v?.plate}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4 lg:flex-row">
      {/* Left Panel: List & Stats */}
      <div className="flex w-full flex-col gap-4 lg:w-1/3">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-500">Total</div>
            <div className="text-xl font-bold text-slate-900">{MOCK_GPS_DATA.length}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-500">Actifs</div>
            <div className="text-xl font-bold text-green-600">
              {MOCK_GPS_DATA.filter(d => d.status === GPSStatus.MOVING).length}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center shadow-sm">
            <div className="text-xs font-bold uppercase text-slate-500">Alertes</div>
            <div className="text-xl font-bold text-red-600">{MOCK_GPS_ALERTS.length}</div>
          </div>
        </div>

        {/* List Container */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Search Header */}
          <div className="border-b border-slate-200 p-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher véhicule..."
                className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <button 
                onClick={() => setFilterStatus('All')}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${filterStatus === 'All' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Tout
              </button>
              {Object.values(GPSStatus).map(s => (
                <button 
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto">
            {filteredDevices.map(device => {
              const vehicle = getVehicle(device.vehicleId);
              return (
                <div 
                  key={device.id}
                  onClick={() => setSelectedDevice(device)}
                  className={`cursor-pointer border-b border-slate-100 p-4 transition-colors hover:bg-slate-50 ${selectedDevice?.id === device.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{vehicle?.brand} {vehicle?.model}</div>
                      <div className="text-xs text-slate-500">{vehicle?.plate}</div>
                    </div>
                    <div className={`rounded px-2 py-1 text-xs font-bold ${getStatusColor(device.status)}`}>
                      {device.status}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1"><Navigation className="h-3 w-3" /> {device.speed} km/h</span>
                    <span className="flex items-center gap-1"><Battery className="h-3 w-3" /> {device.batteryLevel}%</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {device.lastUpdate}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400 truncate">
                    <MapPin className="inline h-3 w-3 mr-1" />
                    {device.address}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Alerts Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
           <h3 className="mb-3 flex items-center text-sm font-bold text-slate-800">
             <ShieldAlert className="mr-2 h-4 w-4 text-red-500" />
             Dernières Alertes
           </h3>
           <div className="space-y-3">
             {MOCK_GPS_ALERTS.map(alert => {
               const v = MOCK_VEHICLES.find(veh => veh.id === alert.vehicleId);
               return (
                 <div key={alert.id} className="flex items-start gap-3 rounded bg-red-50 p-2 text-xs">
                   <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                   <div>
                     <div className="font-bold text-red-800">{alert.type}</div>
                     <div className="text-red-700">{v?.brand} {v?.model} - {alert.message}</div>
                     <div className="mt-1 text-red-500 opacity-75">{alert.timestamp}</div>
                   </div>
                 </div>
               )
             })}
           </div>
        </div>
      </div>

      {/* Right Panel: Map & Details */}
      <div className="flex w-full flex-col gap-4 lg:w-2/3">
        
        {/* Simulated Map Container */}
        <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-300 bg-slate-200 shadow-inner">
          {/* Map Background (Stylized) */}
          <div className="absolute inset-0 opacity-30" 
             style={{
               backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
               backgroundSize: '20px 20px',
               backgroundColor: '#f1f5f9'
             }}>
          </div>
          
          {/* Roads / Landmarks (Decoration) */}
          <div className="absolute top-[20%] left-0 h-2 w-full bg-white opacity-50 -rotate-2"></div>
          <div className="absolute top-0 left-[40%] h-full w-2 bg-white opacity-50 rotate-12"></div>
          <div className="absolute bottom-[30%] right-[20%] h-32 w-32 rounded-full border-4 border-white opacity-20"></div>

          {/* Trip History Lines (SVG Overlay) */}
          {viewMode === 'HISTORY' && selectedDevice && (
             <svg className="absolute inset-0 h-full w-full pointer-events-none">
               <polyline 
                 points="150,300 180,280 250,280 300,250 320,200" 
                 fill="none" 
                 stroke="#3b82f6" 
                 strokeWidth="4" 
                 strokeDasharray="5,5"
               />
               <circle cx="150" cy="300" r="4" fill="#3b82f6" />
               <circle cx="320" cy="200" r="4" fill="#10b981" />
             </svg>
          )}

          {/* Controls */}
          <div className="absolute right-4 top-4 flex flex-col gap-2">
             <button 
               className="rounded-lg bg-white p-2 shadow hover:bg-slate-50" 
               title="Zoom In"
               onClick={() => alert("Zoom non disponible dans la démo")}
             >
               <div className="text-xl font-bold text-slate-700">+</div>
             </button>
             <button className="rounded-lg bg-white p-2 shadow hover:bg-slate-50" title="Zoom Out">
               <div className="text-xl font-bold text-slate-700">-</div>
             </button>
          </div>

          <div className="absolute left-4 top-4 flex gap-2">
            <button 
              onClick={() => setViewMode('LIVE')}
              className={`rounded-lg px-4 py-2 text-sm font-bold shadow transition-colors ${viewMode === 'LIVE' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              Direct
            </button>
             <button 
              onClick={() => {
                if (!selectedDevice) { alert("Sélectionnez un véhicule pour voir l'historique."); return; }
                setViewMode('HISTORY');
              }}
              className={`rounded-lg px-4 py-2 text-sm font-bold shadow transition-colors ${viewMode === 'HISTORY' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
            >
              Historique
            </button>
          </div>

          {/* Vehicle Markers */}
          {filteredDevices.map(device => {
             const pos = getMapPosition(device.lat, device.lng);
             const isSelected = selectedDevice?.id === device.id;
             
             // If history mode, only show selected vehicle
             if (viewMode === 'HISTORY' && !isSelected) return null;

             return (
               <div 
                 key={device.id}
                 className="absolute -translate-x-1/2 translate-y-1/2 transition-all duration-500 ease-in-out cursor-pointer group"
                 style={{ bottom: pos.bottom, left: pos.left, zIndex: isSelected ? 10 : 1 }}
                 onClick={(e) => { e.stopPropagation(); setSelectedDevice(device); setViewMode('LIVE'); }}
               >
                 {/* Tooltip on Hover */}
                 <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {MOCK_VEHICLES.find(v => v.id === device.vehicleId)?.brand}
                 </div>

                 {/* Pin Icon */}
                 <div className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-lg ${isSelected ? 'scale-125 border-blue-600 bg-white z-20' : 'border-white bg-slate-50'}`}>
                    <div className={`h-3 w-3 rounded-full ${getStatusDot(device.status)}`}></div>
                    <Car className="h-5 w-5 text-slate-700 absolute opacity-20" />
                 </div>
                 {isSelected && (
                   <div className="absolute top-full left-1/2 mt-1 -translate-x-1/2 h-2 w-2 rotate-45 bg-blue-600"></div>
                 )}
               </div>
             );
          })}
        </div>

        {/* Bottom Panel: Active Vehicle Detail */}
        {selectedDevice ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                      <Car className="h-6 w-6 text-slate-600" />
                   </div>
                   <div>
                      <h3 className="font-bold text-slate-900">
                        {getVehicle(selectedDevice.vehicleId)?.brand} {getVehicle(selectedDevice.vehicleId)?.model}
                      </h3>
                      <p className="text-xs text-slate-500">{getVehicle(selectedDevice.vehicleId)?.plate}</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="text-center">
                      <div className="text-xs text-slate-500">Vitesse</div>
                      <div className="font-mono text-lg font-bold text-slate-900">{selectedDevice.speed} <span className="text-xs">km/h</span></div>
                   </div>
                    <div className="text-center border-l border-slate-200 pl-4">
                      <div className="text-xs text-slate-500">Moteur</div>
                      <div className={`font-bold text-sm ${selectedDevice.engineOn ? 'text-green-600' : 'text-slate-400'}`}>
                        {selectedDevice.engineOn ? 'MARCHE' : 'ARRÊT'}
                      </div>
                   </div>
                   <div className="text-center border-l border-slate-200 pl-4">
                      <div className="text-xs text-slate-500">Batterie</div>
                      <div className="flex items-center font-bold text-sm text-slate-700">
                        <Battery className="h-4 w-4 mr-1" /> {selectedDevice.batteryLevel}%
                      </div>
                   </div>
                </div>
                <div className="flex flex-col gap-2">
                   <button className="rounded border border-slate-300 px-3 py-1 text-xs font-bold hover:bg-slate-50">
                     Couper Moteur
                   </button>
                    <button className="rounded bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700">
                     Voir Trajet
                   </button>
                </div>
             </div>
             <div className="mt-4 flex items-center gap-2 rounded bg-slate-50 p-2 text-xs text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="font-medium">Position actuelle :</span>
                {selectedDevice.address}
             </div>
             
             {viewMode === 'HISTORY' && (
               <div className="mt-4 border-t border-slate-200 pt-4">
                  <h4 className="mb-3 text-sm font-bold text-slate-800 flex items-center">
                    <History className="mr-2 h-4 w-4" /> Historique (Aujourd'hui)
                  </h4>
                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {MOCK_TRIP_HISTORY.map((point, idx) => (
                      <div key={idx} className="flex items-center shrink-0">
                        <div className="flex flex-col items-center">
                           <div className="text-[10px] text-slate-400">{point.timestamp}</div>
                           <div className={`h-2 w-2 rounded-full ${point.speed > 0 ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                           <div className="text-[10px] font-bold">{point.speed} km/h</div>
                        </div>
                        {idx < MOCK_TRIP_HISTORY.length - 1 && <div className="h-[1px] w-8 bg-slate-300 mx-1"></div>}
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
             Sélectionnez un véhicule pour voir les détails
          </div>
        )}

      </div>
    </div>
  );
};
