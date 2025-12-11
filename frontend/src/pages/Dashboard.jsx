import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Car, CheckCircle, Key, Wrench, FileText, DollarSign, Calendar,
    AlertTriangle, TrendingUp, Activity, Clock
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalVehicules: 0,
        vehiculesDisponibles: 0,
        vehiculesLoues: 0,
        vehiculesMaintenance: 0,
        contratsActifs: 0,
        totalReservations: 0,
        chiffreAffairesMois: 0
    });
    const [revenueData, setRevenueData] = useState([]);
    const [fleetData, setFleetData] = useState([]);
    const [typeData, setTypeData] = useState([]);
    const [latestContracts, setLatestContracts] = useState([]);
    const [upcomingReservations, setUpcomingReservations] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [
                    statsRes,
                    revenueRes,
                    fleetRes,
                    typeRes,
                    contractsRes,
                    reservationsRes,
                    alertsRes
                ] = await Promise.all([
                    axios.get(`${API_URL}/dashboard/stats`),
                    axios.get(`${API_URL}/dashboard/charts/revenue`),
                    axios.get(`${API_URL}/dashboard/charts/fleet`),
                    axios.get(`${API_URL}/dashboard/charts/vehicle-types`),
                    axios.get(`${API_URL}/dashboard/tables/latest-contracts`),
                    axios.get(`${API_URL}/dashboard/tables/upcoming-reservations`),
                    axios.get(`${API_URL}/dashboard/alerts`)
                ]);

                setStats(statsRes.data);
                setRevenueData(revenueRes.data);
                setFleetData(fleetRes.data);
                setTypeData(typeRes.data);
                setLatestContracts(contractsRes.data);
                setUpcomingReservations(reservationsRes.data);
                setAlerts(alertsRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord</h1>
                    <p className="text-slate-400">Vue d'ensemble de votre activité</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-400">Dernière mise à jour</p>
                    <p className="text-white font-medium">{new Date().toLocaleString()}</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Véhicules"
                    value={stats.totalVehicules}
                    icon={Car}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Disponibles"
                    value={stats.vehiculesDisponibles}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <StatCard
                    title="Loués / Réservés"
                    value={stats.vehiculesLoues}
                    icon={Key}
                    color="bg-orange-500"
                />
                <StatCard
                    title="En Maintenance"
                    value={stats.vehiculesMaintenance}
                    icon={Wrench}
                    color="bg-red-500"
                />
                <StatCard
                    title="Contrats Actifs"
                    value={stats.contratsActifs}
                    icon={FileText}
                    color="bg-purple-500"
                />
                <StatCard
                    title="CA du Mois"
                    value={`${stats.chiffreAffairesMois?.toLocaleString()} MAD`}
                    icon={DollarSign}
                    color="bg-cyan-500"
                    isMoney
                />
                <StatCard
                    title="Total Réservations"
                    value={stats.totalReservations}
                    icon={Calendar}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Alertes Actives"
                    value={alerts.length}
                    icon={AlertTriangle}
                    color="bg-yellow-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                        Évolution du Chiffre d'Affaires
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ color: '#22d3ee' }}
                                />
                                <Line type="monotone" dataKey="total" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Fleet Status Pie Chart */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        État de la Flotte
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={fleetData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {fleetData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Tables & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Latest Contracts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-cyan-400" />
                            Derniers Contrats Signés
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-400">
                                <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3">Client</th>
                                        <th className="px-4 py-3">Véhicule</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 text-right">Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {latestContracts.map((contract) => (
                                        <tr key={contract.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                                            <td className="px-4 py-3 font-medium text-white">
                                                {contract.client?.nom} {contract.client?.prenom}
                                            </td>
                                            <td className="px-4 py-3">
                                                {contract.vehicule?.marque} {contract.vehicule?.modele}
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(contract.cree_le).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right text-cyan-400 font-bold">
                                                {parseFloat(contract.montant_total).toLocaleString()} MAD
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-cyan-400" />
                            Prochaines Réservations
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-400">
                                <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
                                    <tr>
                                        <th className="px-4 py-3">Client</th>
                                        <th className="px-4 py-3">Véhicule</th>
                                        <th className="px-4 py-3">Début</th>
                                        <th className="px-4 py-3">Fin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingReservations.map((res) => (
                                        <tr key={res.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                                            <td className="px-4 py-3 font-medium text-white">
                                                {res.client?.nom} {res.client?.prenom}
                                            </td>
                                            <td className="px-4 py-3">
                                                {res.vehicule?.marque} {res.vehicule?.modele}
                                            </td>
                                            <td className="px-4 py-3 text-green-400">
                                                {new Date(res.date_debut).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(res.date_fin).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Alerts Panel */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 shadow-lg h-fit">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Alertes & Notifications
                    </h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {alerts.length > 0 ? (
                            alerts.map((alert, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border-l-4 ${alert.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
                                            alert.severity === 'danger' ? 'bg-red-500/10 border-red-500' :
                                                'bg-blue-500/10 border-blue-500'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-sm font-bold ${alert.severity === 'warning' ? 'text-yellow-400' :
                                                alert.severity === 'danger' ? 'text-red-400' :
                                                    'text-blue-400'
                                            }`}>
                                            {alert.type === 'assurance' ? 'Assurance Expire' :
                                                alert.type === 'visite_technique' ? 'Visite Technique' :
                                                    'Maintenance'}
                                        </h4>
                                        <span className="text-xs text-slate-500">Important</span>
                                    </div>
                                    <p className="text-sm text-slate-300 mt-1">{alert.message}</p>
                                    <p className="text-xs text-slate-500 mt-2 font-mono">{alert.vehicule}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>Aucune alerte pour le moment</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, isMoney }) => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <h3 className={`text-2xl font-bold text-white ${isMoney ? 'tracking-tight' : ''}`}>{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-20 text-white group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

export default Dashboard;
