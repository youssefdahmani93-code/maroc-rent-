import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Filter, FileText, FileCheck, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import ContractForm from '../components/contracts/ContractForm';
import ViewContractModal from '../components/contracts/ViewContractModal';

const Contracts = () => {
    const location = useLocation();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, contrat, devis
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        fetchContracts();
        if (location.state && location.state.fromReservation) {
            setInitialData(location.state.fromReservation);
            setShowForm(true);
        }
    }, [location.state]);

    const fetchContracts = async () => {
        try {
            const res = await axios.get('/api/contrats');
            setContracts(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement contrats:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            try {
                await axios.delete(`/api/contrats/${id}`);
                fetchContracts();
            } catch (error) {
                console.error('Erreur suppression:', error);
            }
        }
    };

    const filteredContracts = contracts.filter(c => {
        const matchesType = filter === 'all' || c.type === filter;
        const matchesSearch = c.client?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.vehicule?.immatriculation.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Devis & Factures</h1>
                    <p className="text-slate-400">Gérez vos devis et factures clients</p>
                </div>
                <button
                    onClick={() => { setSelectedContract(null); setInitialData(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                >
                    <Plus size={20} />
                    Nouveau Document
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par client, numéro ou véhicule..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Tout
                    </button>
                    <button
                        onClick={() => setFilter('contrat')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${filter === 'contrat' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white'}`}
                    >
                        <FileCheck size={18} /> Factures
                    </button>
                    <button
                        onClick={() => setFilter('devis')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${filter === 'devis' ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30' : 'text-slate-400 hover:text-white'}`}
                    >
                        <FileText size={18} /> Devis
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-700/50 text-slate-400 text-sm uppercase">
                                <th className="p-4 font-medium">Numéro</th>
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium">Client</th>
                                <th className="p-4 font-medium">Véhicule</th>
                                <th className="p-4 font-medium">Dates</th>
                                <th className="p-4 font-medium">Montant</th>
                                <th className="p-4 font-medium">Statut</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-300 divide-y divide-slate-700/50">
                            {loading ? (
                                <tr><td colSpan="8" className="p-8 text-center text-slate-500">Chargement...</td></tr>
                            ) : filteredContracts.length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center text-slate-500">Aucun document trouvé</td></tr>
                            ) : (
                                filteredContracts.map((contract) => (
                                    <tr key={contract.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 font-medium text-white">{contract.numero}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${contract.type === 'contrat' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-400'
                                                }`}>
                                                {contract.type === 'contrat' ? 'Facture' : 'Devis'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-white">{contract.client?.nom}</div>
                                            <div className="text-xs text-slate-500">{contract.client?.telephone}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-white">{contract.vehicule?.marque} {contract.vehicule?.modele}</div>
                                            <div className="text-xs text-slate-500">{contract.vehicule?.immatriculation}</div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div>Du {new Date(contract.date_debut).toLocaleDateString()}</div>
                                            <div>Au {new Date(contract.date_fin).toLocaleDateString()}</div>
                                        </td>
                                        <td className="p-4 font-bold text-cyan-400">{contract.montant_total} DH</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${contract.statut === 'signe' ? 'bg-green-500/20 text-green-400' :
                                                contract.statut === 'en_cours' ? 'bg-blue-500/20 text-blue-400' :
                                                    contract.statut === 'devis' ? 'bg-slate-500/20 text-slate-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                {contract.statut}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedContract(contract); setShowViewModal(true); }}
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                                                    title="Voir détails"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedContract(contract); setInitialData(null); setShowForm(true); }}
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-yellow-400 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(contract.id)}
                                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {showForm && (
                <ContractForm
                    contract={selectedContract}
                    initialData={initialData}
                    onClose={() => setShowForm(false)}
                    onSave={() => { setShowForm(false); fetchContracts(); }}
                />
            )}

            {showViewModal && (
                <ViewContractModal
                    contract={selectedContract}
                    onClose={() => setShowViewModal(false)}
                    onUpdate={() => { fetchContracts(); setShowViewModal(false); }}
                />
            )}
        </div>
    );
};

export default Contracts;
