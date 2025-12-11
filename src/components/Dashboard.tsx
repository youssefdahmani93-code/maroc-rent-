
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Car, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MOCK_KPI, REVENUE_DATA, MOCK_RESERVATIONS, formatCurrency } from '../constants';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Tableau de bord</h2>
        <div className="flex space-x-2">
          <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option>Toutes les agences</option>
            <option>Casablanca</option>
            <option>Marrakech</option>
          </select>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            Exporter rapport
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Revenus mensuels</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(MOCK_KPI.totalRevenue, true)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUpRight className="mr-1 h-4 w-4" />
            <span className="font-medium">12%</span>
            <span className="ml-2 text-slate-500">vs mois dernier</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Réservations actives</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{MOCK_KPI.activeBookings}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUpRight className="mr-1 h-4 w-4" />
            <span className="font-medium">4</span>
            <span className="ml-2 text-slate-500">nouvelles aujourd'hui</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Véhicules dispo.</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{MOCK_KPI.availableVehicles}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Car className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-500">
            <span>Sur une flotte de 45</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">En maintenance</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{MOCK_KPI.maintenanceCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-orange-600">
            <ArrowDownRight className="mr-1 h-4 w-4" />
            <span className="font-medium">1</span>
            <span className="ml-2 text-slate-500">retour prévu demain</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Évolution des Revenus (MAD)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-800">Dernières Réservations</h3>
          <div className="space-y-4">
            {MOCK_RESERVATIONS.map((res) => (
              <div key={res.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-slate-900">{res.clientName}</p>
                  <p className="text-xs text-slate-500">{res.pickupLocation}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">{formatCurrency(res.totalPrice)}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    res.status === 'Confirmée' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {res.status}
                  </span>
                </div>
              </div>
            ))}
            <button className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Voir tout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
