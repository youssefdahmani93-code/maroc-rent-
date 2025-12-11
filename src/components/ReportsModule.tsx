
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Download, Filter, Calendar, TrendingUp, DollarSign, 
  Car, Activity, AlertTriangle, Wrench, FileText, Users
} from 'lucide-react';
import { MOCK_MONTHLY_STATS, VEHICLE_PERFORMANCE_DATA, EXPENSE_BREAKDOWN, formatCurrency } from '../constants';

type Tab = 'OVERVIEW' | 'FINANCE' | 'FLEET' | 'MAINTENANCE' | 'RESERVATIONS';

export const ReportsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [dateRange, setDateRange] = useState('Cette année');

  // --- Helper Components ---

  const KPICard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {subtext && <p className="mt-4 text-xs text-slate-500">{subtext}</p>}
    </div>
  );

  // --- Tab Content ---

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard 
          title="Revenu Total" 
          value={formatCurrency(336000, true)} 
          subtext="+12% vs année dernière" 
          icon={DollarSign} 
          colorClass="bg-green-50 text-green-600" 
        />
        <KPICard 
          title="Bénéfice Net" 
          value={formatCurrency(245000, true)} 
          subtext="Marge: 73%" 
          icon={TrendingUp} 
          colorClass="bg-blue-50 text-blue-600" 
        />
        <KPICard 
          title="Taux d'occupation" 
          value="68%" 
          subtext="Moyenne de la flotte" 
          icon={Activity} 
          colorClass="bg-indigo-50 text-indigo-600" 
        />
        <KPICard 
          title="Maintenance" 
          value={formatCurrency(21100, true)} 
          subtext="Coût total interventions" 
          icon={Wrench} 
          colorClass="bg-orange-50 text-orange-600" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-lg font-bold text-slate-800">Évolution Financière</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_MONTHLY_STATS}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" name="Revenus" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" name="Bénéfices" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-800">Répartition Flotte</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Disponible', value: 12, color: '#10b981' },
                    { name: 'Loué', value: 8, color: '#3b82f6' },
                    { name: 'Maintenance', value: 3, color: '#f59e0b' },
                    { name: 'Hors Service', value: 1, color: '#ef4444' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: 'Disponible', value: 12, color: '#10b981' },
                    { name: 'Loué', value: 8, color: '#3b82f6' },
                    { name: 'Maintenance', value: 3, color: '#f59e0b' },
                    { name: 'Hors Service', value: 1, color: '#ef4444' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-green-500"></div> Disponible</div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-blue-500"></div> Loué</div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-yellow-500"></div> Maintenance</div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-red-500"></div> Hors Service</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
             <h3 className="mb-4 text-lg font-bold text-slate-800">Revenus vs Dépenses (Mensuel)</h3>
             <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={MOCK_MONTHLY_STATS}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} />
                   <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                   <Tooltip cursor={{fill: '#f1f5f9'}} />
                   <Bar dataKey="revenue" name="Revenus" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="expenses" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
          
          {/* Expense Categories */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
             <h3 className="mb-4 text-lg font-bold text-slate-800">Répartition des Charges</h3>
             <div className="space-y-4">
                {EXPENSE_BREAKDOWN.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                       <span className="text-slate-600">{item.name}</span>
                       <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                       <div 
                         className="h-2 rounded-full" 
                         style={{ width: `${(item.value / 21100) * 100}%`, backgroundColor: item.color }}
                       ></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
       </div>

       {/* Detailed Table */}
       <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
             <h3 className="font-bold text-slate-800">Détail des Transactions</h3>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-white">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Mois</th>
                   <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Revenus</th>
                   <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Dépenses</th>
                   <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Résultat Net</th>
                   <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Marge</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200 bg-white">
                {MOCK_MONTHLY_STATS.map((stat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                     <td className="px-6 py-4 text-sm font-medium text-slate-900">{stat.month}</td>
                     <td className="px-6 py-4 text-sm text-right text-slate-600">{formatCurrency(stat.revenue)}</td>
                     <td className="px-6 py-4 text-sm text-right text-red-600">{formatCurrency(stat.expenses)}</td>
                     <td className="px-6 py-4 text-sm text-right font-bold text-green-600">{formatCurrency(stat.profit)}</td>
                     <td className="px-6 py-4 text-sm text-right text-slate-600">{Math.round((stat.profit/stat.revenue)*100)}%</td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );

  const renderFleet = () => (
    <div className="space-y-6">
       {/* Performance Table */}
       <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
             <h3 className="font-bold text-slate-800">Performance par Véhicule</h3>
             <button className="text-sm text-blue-600 hover:underline">Télécharger Excel</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Véhicule</th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">Jours Loués</th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">Occupation</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Revenu Généré</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Coût Maint.</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">ROI</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                  {VEHICLE_PERFORMANCE_DATA.map((v) => (
                    <tr key={v.vehicleId} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{v.vehicleName}</div>
                          <div className="text-xs text-slate-500">{v.plate}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-slate-600">{v.daysRented}</td>
                        <td className="px-6 py-4 text-center">
                           <div className="flex items-center justify-center">
                             <span className="text-xs font-medium mr-2">{v.occupancyRate}%</span>
                             <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${v.occupancyRate > 70 ? 'bg-green-500' : v.occupancyRate > 40 ? 'bg-blue-500' : 'bg-red-500'}`} style={{width: `${v.occupancyRate}%`}}></div>
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-blue-700">{formatCurrency(v.revenue)}</td>
                        <td className="px-6 py-4 text-right text-sm text-red-600">{formatCurrency(v.maintenanceCost)}</td>
                        <td className="px-6 py-4 text-right text-sm font-bold">
                           <span className={v.roi > 100 ? 'text-green-600' : 'text-yellow-600'}>{v.roi}%</span>
                        </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
       </div>

       {/* Alerts Section */}
       <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-800">Alertes Documents & Maintenance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <div className="flex items-start p-3 bg-red-50 border border-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                <div>
                   <p className="text-sm font-bold text-red-800">Assurance Expirée</p>
                   <p className="text-xs text-red-600">Renault Clio 5 (88221-B-26) - 12/05/2024</p>
                </div>
             </div>
             <div className="flex items-start p-3 bg-orange-50 border border-orange-100 rounded-lg">
                <Wrench className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                <div>
                   <p className="text-sm font-bold text-orange-800">Vidange Proche</p>
                   <p className="text-xs text-orange-600">Dacia Logan (12345-A-6) - Dans 500km</p>
                </div>
             </div>
              <div className="flex items-start p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                   <p className="text-sm font-bold text-yellow-800">Visite Technique</p>
                   <p className="text-xs text-yellow-600">Peugeot 208 - Expire dans 15 jours</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderMaintenance = () => (
     <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-800">Coûts Maintenance par Catégorie</h3>
              <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={EXPENSE_BREAKDOWN}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                       <XAxis type="number" hide />
                       <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                       <Tooltip cursor={{fill: '#f1f5f9'}} />
                       <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20}>
                          {EXPENSE_BREAKDOWN.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-800">Maintenance Préventive (À venir)</h3>
              <ul className="space-y-3">
                 <li className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div>
                       <span className="font-medium text-slate-900">Vidange + Filtres</span>
                       <span className="block text-xs text-slate-500">Hyundai Tucson (2000 km restants)</span>
                    </div>
                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">Juin</span>
                 </li>
                 <li className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div>
                       <span className="font-medium text-slate-900">Changement Pneus (x2)</span>
                       <span className="block text-xs text-slate-500">Renault Clio 5</span>
                    </div>
                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">Juin</span>
                 </li>
                  <li className="flex justify-between items-center">
                    <div>
                       <span className="font-medium text-slate-900">Courroie distribution</span>
                       <span className="block text-xs text-slate-500">Dacia Logan (Prévision 80k km)</span>
                    </div>
                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">Août</span>
                 </li>
              </ul>
           </div>
        </div>
     </div>
  );

  const renderReservations = () => (
     <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <h3 className="mb-4 text-lg font-bold text-slate-800">Évolution des Réservations</h3>
              <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_MONTHLY_STATS}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                       <XAxis dataKey="month" axisLine={false} tickLine={false} />
                       <YAxis axisLine={false} tickLine={false} />
                       <Tooltip />
                       <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
           
           <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                 <h3 className="mb-4 text-sm font-bold text-slate-500 uppercase">Canaux d'acquisition</h3>
                 <div className="space-y-4">
                    <div>
                       <div className="flex justify-between text-sm mb-1">
                          <span>Site Web</span>
                          <span className="font-bold">45%</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full w-[45%]"></div></div>
                    </div>
                    <div>
                       <div className="flex justify-between text-sm mb-1">
                          <span>Agence (Physique)</span>
                          <span className="font-bold">30%</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full w-[30%]"></div></div>
                    </div>
                    <div>
                       <div className="flex justify-between text-sm mb-1">
                          <span>Téléphone / WhatsApp</span>
                          <span className="font-bold">25%</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full w-[25%]"></div></div>
                    </div>
                 </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                 <h3 className="mb-4 text-sm font-bold text-slate-500 uppercase">Stats Rapides</h3>
                 <ul className="space-y-3 text-sm">
                    <li className="flex justify-between">
                       <span className="text-slate-600">Durée Moyenne</span>
                       <span className="font-bold text-slate-900">4.5 Jours</span>
                    </li>
                     <li className="flex justify-between">
                       <span className="text-slate-600">Taux Annulation</span>
                       <span className="font-bold text-red-600">8%</span>
                    </li>
                     <li className="flex justify-between">
                       <span className="text-slate-600">Panier Moyen</span>
                       <span className="font-bold text-blue-600">1,850 MAD</span>
                    </li>
                 </ul>
              </div>
           </div>
        </div>
     </div>
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Rapports & Analytique</h2>
           <p className="text-sm text-slate-500">Analysez la performance financière et opérationnelle.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="rounded-md border border-slate-300 bg-white py-2 pl-10 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                 <option>Ce mois</option>
                 <option>Le mois dernier</option>
                 <option>Cette année</option>
                 <option>Personnalisé...</option>
              </select>
           </div>
           <button className="flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
             <Filter className="mr-2 h-4 w-4" />
             Filtres
           </button>
           <button className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
             <Download className="mr-2 h-4 w-4" />
             Exporter PDF
           </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {(['OVERVIEW', 'FINANCE', 'FLEET', 'MAINTENANCE', 'RESERVATIONS'] as Tab[]).map((tab) => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                 activeTab === tab 
                   ? 'border-blue-600 text-blue-600' 
                   : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
               }`}
             >
               {tab === 'OVERVIEW' && 'Vue d\'ensemble'}
               {tab === 'FINANCE' && 'Finances'}
               {tab === 'FLEET' && 'Parc Auto'}
               {tab === 'MAINTENANCE' && 'Maintenance'}
               {tab === 'RESERVATIONS' && 'Réservations'}
             </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="mt-6">
         {activeTab === 'OVERVIEW' && renderOverview()}
         {activeTab === 'FINANCE' && renderFinance()}
         {activeTab === 'FLEET' && renderFleet()}
         {activeTab === 'MAINTENANCE' && renderMaintenance()}
         {activeTab === 'RESERVATIONS' && renderReservations()}
      </div>
    </div>
  );
};
