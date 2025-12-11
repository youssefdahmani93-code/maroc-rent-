import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Eye, Edit, Trash2, Download, X, DollarSign, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import PaiementForm from '../components/PaiementForm';
import Modal from '../components/Modal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const StatCard = ({ title, value, icon, colorClass }) => (
    <div className={`bg-slate-800/50 border ${colorClass} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-sm">{title}</p>
                <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
            {icon}
        </div>
    </div>
);

const PaiementDetails = ({ paiement, onClose, onEdit, formatCurrency, renderReference, renderVehicule, getMethodLabel, getStatusBadge }) => {
    if (!paiement) return null;

    return (
        <Modal title="Détails du Paiement" onClose={onClose}>
            <div className="text-white space-y-4 p-6">
                <p><strong>Client:</strong> {paiement.client?.nom} ({paiement.client?.telephone})</p>
                <p><strong>Référence:</strong> {renderReference(paiement)}</p>
                <p><strong>Véhicule:</strong> {renderVehicule(paiement)}</p>
                <hr className="border-slate-700" />
                <p><strong>Montant Payé:</strong> {formatCurrency(paiement.montant_paye)}</p>
                <p><strong>Reste à Payer:</strong> {formatCurrency(paiement.reste_a_payer)}</p>
                <p><strong>Montant Total:</strong> {formatCurrency(paiement.montant_total)}</p>
                <hr className="border-slate-700" />
                <p><strong>Date:</strong> {new Date(paiement.date_paiement).toLocaleString('fr-FR')}</p>
                <p><strong>Méthode:</strong> {getMethodLabel(paiement.methode_paiement)}</p>
                <p><strong>Statut:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(paiement.statut)}`}>{paiement.statut}</span></p>
                <p><strong>Notes:</strong> {paiement.notes || 'Aucune note'}</p>
            </div>
            <div className="p-6 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-4">
                <button onClick={onEdit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Modifier
                </button>
                <button onClick={onClose} className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                    Fermer
                </button>
            </div>
        </Modal>
    );
};

const Paiements = () => {
    const [paiements, setPaiements] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('LIST');
    const [selectedPaiement, setSelectedPaiement] = useState(null);
    const [filters, setFilters] = useState({ search: '', statut: 'All', type_paiement: 'All', methode_paiement: 'All' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paiementsRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/paiements`),
                axios.get(`${API_URL}/paiements/stats`)
            ]);
            setPaiements(paiementsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatCurrency = (amount) => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount || 0);

    const getStatusBadge = (statut) => {
        const styles = {
            paye: 'bg-green-500/10 text-green-400 border-green-500/20',
            partiel: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            annule: 'bg-red-500/10 text-red-400 border-red-500/20',
            en_attente: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            default: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        };
        return styles[statut] || styles.default;
    };

    const getMethodLabel = (methode) => ({
        especes: 'Espèces', carte: 'Carte', virement: 'Virement', cheque: 'Chèque'
    }[methode] || methode);

    const handleDelete = async (id) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce paiement ?')) {
            try {
                await axios.delete(`${API_URL}/paiements/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting paiement:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const filteredPaiements = paiements.filter(p => {
        const ref = p.contrat?.numero || (p.reservation ? `Res #${p.reservation.id}` : '');
        const searchLower = filters.search.toLowerCase();
        return (
            (p.client?.nom?.toLowerCase().includes(searchLower) || ref.toLowerCase().includes(searchLower)) &&
            (filters.statut === 'All' || p.statut === filters.statut) &&
            (filters.type_paiement === 'All' || p.type_paiement === filters.type_paiement) &&
            (filters.methode_paiement === 'All' || p.methode_paiement === filters.methode_paiement)
        );
    });

    const openForm = (paiement = null) => {
        setSelectedPaiement(paiement);
        setViewMode('FORM');
    };

    const openDetails = (paiement) => {
        setSelectedPaiement(paiement);
        setViewMode('DETAILS');
    };

    const closeModals = () => {
        setViewMode('LIST');
        setSelectedPaiement(null);
    };

    const handleSave = () => {
        fetchData();
        closeModals();
    };

    const renderReference = (paiement) => {
        if (paiement.contrat) {
            return <span className="font-mono text-xs bg-slate-700 px-2 py-1 rounded">{paiement.contrat.numero}</span>;
        }
        if (paiement.reservation) {
            return <span className="font-mono text-xs bg-slate-700 px-2 py-1 rounded">Rés. #{paiement.reservation.id}</span>;
        }
        return <span className="text-slate-500">N/A</span>;
    };

    const renderVehicule = (paiement) => {
        const vehicule = paiement.contrat?.vehicule || paiement.reservation?.vehicule;
        if (vehicule) {
            return `${vehicule.marque} ${vehicule.modele}`;
        }
        return <span className="text-slate-500">N/A</span>;
    };

    if (viewMode === 'FORM') {
        return <PaiementForm paiement={selectedPaiement} onClose={closeModals} onSave={handleSave} />;
    }

    if (viewMode === 'DETAILS') {
        return <PaiementDetails
            paiement={selectedPaiement}
            onClose={closeModals}
            onEdit={() => openForm(selectedPaiement)}
            formatCurrency={formatCurrency}
            renderReference={renderReference}
            renderVehicule={renderVehicule}
            getMethodLabel={getMethodLabel}
            getStatusBadge={getStatusBadge}
        />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Gestion des Paiements</h1>
                <button onClick={() => openForm()} className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all">
                    <Plus size={20} /> Nouveau Paiement
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <StatCard title="Total Aujourd'hui" value={formatCurrency(stats.total_jour)} icon={<DollarSign className="text-green-400" />} colorClass="border-green-500/30" />
                 <StatCard title="Total Ce Mois" value={formatCurrency(stats.total_mois)} icon={<TrendingUp className="text-blue-400" />} colorClass="border-blue-500/30" />
                 <StatCard title="Total Impayés" value={formatCurrency(stats.total_impayes)} icon={<AlertCircle className="text-red-400" />} colorClass="border-red-500/30" />
                 <StatCard title="En Attente" value={stats.en_attente || 0} icon={<Clock className="text-yellow-400" />} colorClass="border-yellow-500/30" />
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="Rechercher (Client, Réf.)..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    <select value={filters.statut} onChange={(e) => setFilters({ ...filters, statut: e.target.value })} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="All">Tous les statuts</option>
                        <option value="paye">Payé</option>
                        <option value="partiel">Partiel</option>
                    </select>
                    <select value={filters.type_paiement} onChange={(e) => setFilters({ ...filters, type_paiement: e.target.value })} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="All">Tous les types</option>
                        <option value="contrat">Contrat</option>
                        <option value="reservation">Réservation</option>
                    </select>
                    <select value={filters.methode_paiement} onChange={(e) => setFilters({ ...filters, methode_paiement: e.target.value })} className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="All">Toutes les méthodes</option>
                        <option value="especes">Espèces</option>
                        <option value="carte">Carte</option>
                        <option value="virement">Virement</option>
                        <option value="cheque">Chèque</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/80"><tr className="border-b border-slate-700/50 text-slate-400 text-xs uppercase">
                            <th className="p-4 font-medium">Client</th>
                            <th className="p-4 font-medium">Référence</th>
                            <th className="p-4 font-medium">Véhicule</th>
                            <th className="p-4 font-medium">Montant Payé</th>
                            <th className="p-4 font-medium">Méthode</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Statut</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr></thead>
                        <tbody className="text-slate-300 divide-y divide-slate-700/50">
                            {loading ? <tr><td colSpan="8" className="p-8 text-center text-slate-500">Chargement...</td></tr> : 
                             filteredPaiements.length === 0 ? <tr><td colSpan="8" className="p-8 text-center text-slate-500">Aucun paiement trouvé</td></tr> : 
                             filteredPaiements.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-900/30">
                                    <td className="p-4"><div className="font-medium text-white">{p.client?.nom || 'N/A'}</div><div className="text-xs text-slate-500">{p.client?.telephone}</div></td>
                                    <td className="p-4">{renderReference(p)}</td>
                                    <td className="p-4 text-sm">{renderVehicule(p)}</td>
                                    <td className="p-4"><div className="font-semibold text-cyan-400">{formatCurrency(p.montant_paye)}</div>{p.reste_a_payer > 0 && <div className="text-xs text-red-400">Reste: {formatCurrency(p.reste_a_payer)}</div>}</td>
                                    <td className="p-4 text-sm">{getMethodLabel(p.methode_paiement)}</td>
                                    <td className="p-4 text-sm">{new Date(p.date_paiement).toLocaleDateString('fr-FR')}</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(p.statut)}`}>{p.statut}</span></td>
                                    <td className="p-4 text-right"><div className="flex justify-end gap-2">
                                        <button onClick={() => openDetails(p)} title="Voir" className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"><Eye size={18} /></button>
                                        <button onClick={() => openForm(p)} title="Modifier" className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-yellow-400 transition-colors"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(p.id)} title="Supprimer" className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                                        <button disabled className="p-2 text-slate-600 cursor-not-allowed" title="Télécharger PDF (Bientôt)"><Download size={18} /></button>
                                    </div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {viewMode === 'DETAILS' && <PaiementDetails paiement={selectedPaiement} onClose={closeModals} onEdit={() => openForm(selectedPaiement)} formatCurrency={formatCurrency} renderReference={renderReference} renderVehicule={renderVehicule} getMethodLabel={getMethodLabel} getStatusBadge={getStatusBadge} />}
        
        </div>
    );
};

export default Paiements;
