import { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, Edit, Trash2, Plus, AlertTriangle, Wrench, Calendar, DollarSign, FileText } from 'lucide-react';

const Maintenance = () => {
    const [maintenances, setMaintenances] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ statut: '', type: '', vehicule_id: '' });
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'create', 'edit', 'view'
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [formData, setFormData] = useState({
        vehicule_id: '',
        type: 'vidange',
        description: '',
        garage: '',
        date_entree: '',
        date_sortie_prevue: '',
        km_actuel: '',
        cout_pieces: 0,
        cout_main_oeuvre: 0,
        statut: 'a_faire',
        prochaine_vidange_km: '',
        prochaine_visite_technique: '',
        prochaine_assurance: '',
        notes_internes: ''
    });

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        try {
            const params = {};
            if (filter.statut) params.statut = filter.statut;
            if (filter.type) params.type = filter.type;
            if (filter.vehicule_id) params.vehicule_id = filter.vehicule_id;

            const [maintenancesRes, vehiclesRes, alertsRes] = await Promise.all([
                axios.get('/api/maintenance', { params }),
                axios.get('/api/vehicules'),
                axios.get('/api/maintenance/alerts')
            ]);

            setMaintenances(maintenancesRes.data);
            setVehicles(vehiclesRes.data.vehicules || vehiclesRes.data);
            setAlerts(alertsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            setLoading(false);
        }
    };

    const getStatutBadge = (statut) => {
        const badges = {
            a_faire: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            en_cours: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            termine: 'bg-green-500/20 text-green-400 border-green-500/30',
            urgent: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
        return badges[statut] || badges.a_faire;
    };

    const getStatutLabel = (statut) => {
        const labels = {
            a_faire: 'À faire',
            en_cours: 'En cours',
            termine: 'Terminé',
            urgent: 'Urgent'
        };
        return labels[statut] || statut;
    };

    const getTypeLabel = (type) => {
        const labels = {
            vidange: 'Vidange',
            pneus: 'Pneus',
            freins: 'Freins',
            batterie: 'Batterie',
            mecanique: 'Mécanique',
            carrosserie: 'Carrosserie',
            assurance: 'Assurance',
            controle_technique: 'Contrôle technique',
            nettoyage: 'Nettoyage',
            autre: 'Autre'
        };
        return labels[type] || type;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Nettoyage des données avant envoi
            const dataToSend = {
                ...formData,
                date_sortie_prevue: formData.date_sortie_prevue || null,
                km_actuel: formData.km_actuel || null,
                prochaine_vidange_km: formData.prochaine_vidange_km || null,
                prochaine_visite_technique: formData.prochaine_visite_technique || null,
                prochaine_assurance: formData.prochaine_assurance || null,
                cout_pieces: parseFloat(formData.cout_pieces) || 0,
                cout_main_oeuvre: parseFloat(formData.cout_main_oeuvre) || 0,
                garage: formData.garage || null,
                description: formData.description || null,
                notes_internes: formData.notes_internes || null
            };

            if (modalType === 'create') {
                await axios.post('/api/maintenance', dataToSend);
            } else if (modalType === 'edit') {
                await axios.put(`/api/maintenance/${selectedMaintenance.id}`, dataToSend);
            }
            setShowModal(false);
            fetchData();
            resetForm();
        } catch (error) {
            console.error('Erreur:', error);
            alert(error.response?.data?.message || 'Une erreur est survenue');
            if (error.response?.data?.errors) {
                console.log('Validation errors:', error.response.data.errors);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette maintenance ?')) {
            try {
                await axios.delete(`/api/maintenance/${id}`);
                fetchData();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert(error.response?.data?.message || 'Erreur lors de la suppression');
            }
        }
    };

    const openCreateModal = () => {
        resetForm();
        setModalType('create');
        setShowModal(true);
    };

    const openEditModal = (maintenance) => {
        setSelectedMaintenance(maintenance);
        setFormData({
            vehicule_id: maintenance.vehicule_id,
            type: maintenance.type,
            description: maintenance.description || '',
            garage: maintenance.garage || '',
            date_entree: maintenance.date_entree ? maintenance.date_entree.split('T')[0] : '',
            date_sortie_prevue: maintenance.date_sortie_prevue ? maintenance.date_sortie_prevue.split('T')[0] : '',
            km_actuel: maintenance.km_actuel || '',
            cout_pieces: maintenance.cout_pieces,
            cout_main_oeuvre: maintenance.cout_main_oeuvre,
            statut: maintenance.statut,
            prochaine_vidange_km: maintenance.prochaine_vidange_km || '',
            prochaine_visite_technique: maintenance.prochaine_visite_technique ? maintenance.prochaine_visite_technique.split('T')[0] : '',
            prochaine_assurance: maintenance.prochaine_assurance ? maintenance.prochaine_assurance.split('T')[0] : '',
            notes_internes: maintenance.notes_internes || ''
        });
        setModalType('edit');
        setShowModal(true);
    };

    const openViewModal = (maintenance) => {
        openEditModal(maintenance);
        setModalType('view');
    };

    const resetForm = () => {
        setFormData({
            vehicule_id: '',
            type: 'vidange',
            description: '',
            garage: '',
            date_entree: '',
            date_sortie_prevue: '',
            km_actuel: '',
            cout_pieces: 0,
            cout_main_oeuvre: 0,
            statut: 'a_faire',
            prochaine_vidange_km: '',
            prochaine_visite_technique: '',
            prochaine_assurance: '',
            notes_internes: ''
        });
        setSelectedMaintenance(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Maintenance</h1>
                    <p className="text-slate-400">Gestion de l'entretien de la flotte</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                    >
                        <Plus size={20} />
                        Ajouter une maintenance
                    </button>
                    <button
                        onClick={() => setFilter({ ...filter, statut: 'urgent' })}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                        <AlertTriangle size={20} />
                        Alertes urgentes ({alerts.filter(a => a.urgent).length})
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <h3 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Alertes de maintenance
                    </h3>
                    <div className="space-y-2">
                        {alerts.slice(0, 5).map((alert, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${alert.urgent ? 'bg-red-500/10 border border-red-500/30' : 'bg-orange-500/10'}`}>
                                <div>
                                    <span className="text-white font-medium">{alert.vehicule}</span>
                                    <span className="text-slate-400 text-sm ml-2">• {alert.message}</span>
                                </div>
                                {alert.urgent && <span className="text-red-400 text-xs font-bold">URGENT</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Véhicule</label>
                        <select
                            value={filter.vehicule_id}
                            onChange={(e) => setFilter({ ...filter, vehicule_id: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">Tous</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.marque} {v.modele} - {v.immatriculation}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                        <select
                            value={filter.type}
                            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">Tous</option>
                            <option value="vidange">Vidange</option>
                            <option value="pneus">Pneus</option>
                            <option value="freins">Freins</option>
                            <option value="batterie">Batterie</option>
                            <option value="mecanique">Mécanique</option>
                            <option value="carrosserie">Carrosserie</option>
                            <option value="assurance">Assurance</option>
                            <option value="controle_technique">Contrôle technique</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Statut</label>
                        <select
                            value={filter.statut}
                            onChange={(e) => setFilter({ ...filter, statut: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">Tous</option>
                            <option value="a_faire">À faire</option>
                            <option value="en_cours">En cours</option>
                            <option value="termine">Terminé</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilter({ statut: '', type: '', vehicule_id: '' })}
                            className="w-full px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50 border-b border-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Véhicule</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Kilométrage</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Coût</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {maintenances.map((maintenance) => (
                                <tr key={maintenance.id} className="hover:bg-slate-900/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-white font-medium">{maintenance.vehicule?.marque} {maintenance.vehicule?.modele}</div>
                                            <div className="text-sm text-slate-400">{maintenance.vehicule?.immatriculation}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Wrench size={16} className="text-slate-400" />
                                            <span className="text-white">{getTypeLabel(maintenance.type)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <div className="text-white">{new Date(maintenance.date_entree).toLocaleDateString('fr-FR')}</div>
                                            {maintenance.date_sortie_prevue && (
                                                <div className="text-slate-400">→ {new Date(maintenance.date_sortie_prevue).toLocaleDateString('fr-FR')}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white">{maintenance.km_actuel ? `${maintenance.km_actuel.toLocaleString()} km` : '-'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-cyan-400 font-bold">{parseFloat(maintenance.cout_total).toLocaleString()} MAD</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatutBadge(maintenance.statut)}`}>
                                            {getStatutLabel(maintenance.statut)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openViewModal(maintenance)}
                                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                                title="Voir les détails"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(maintenance)}
                                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(maintenance.id)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {maintenances.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-400">Aucune maintenance trouvée</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">
                                {modalType === 'create' ? 'Ajouter une maintenance' :
                                    modalType === 'edit' ? 'Modifier la maintenance' :
                                        'Détails de la maintenance'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Informations véhicule */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Wrench size={20} className="text-cyan-400" />
                                    Informations sur le véhicule
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Véhicule *</label>
                                        <select
                                            required
                                            disabled={modalType === 'view'}
                                            value={formData.vehicule_id}
                                            onChange={(e) => setFormData({ ...formData, vehicule_id: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Sélectionner un véhicule</option>
                                            {vehicles.map(v => (
                                                <option key={v.id} value={v.id}>{v.marque} {v.modele} - {v.immatriculation}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Kilométrage actuel</label>
                                        <input
                                            type="number"
                                            disabled={modalType === 'view'}
                                            value={formData.km_actuel}
                                            onChange={(e) => setFormData({ ...formData, km_actuel: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Type de maintenance */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <FileText size={20} className="text-cyan-400" />
                                    Détails de l'intervention
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Type *</label>
                                        <select
                                            required
                                            disabled={modalType === 'view'}
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="vidange">Vidange</option>
                                            <option value="pneus">Changement de pneus</option>
                                            <option value="freins">Freins</option>
                                            <option value="batterie">Batterie</option>
                                            <option value="mecanique">Problème mécanique</option>
                                            <option value="carrosserie">Carrosserie</option>
                                            <option value="assurance">Assurance</option>
                                            <option value="controle_technique">Contrôle technique</option>
                                            <option value="nettoyage">Nettoyage profond</option>
                                            <option value="autre">Autre</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Garage/Technicien</label>
                                        <input
                                            type="text"
                                            disabled={modalType === 'view'}
                                            value={formData.garage}
                                            onChange={(e) => setFormData({ ...formData, garage: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                                        <textarea
                                            rows="3"
                                            disabled={modalType === 'view'}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Calendar size={20} className="text-cyan-400" />
                                    Dates
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Date d'entrée *</label>
                                        <input
                                            type="date"
                                            required
                                            disabled={modalType === 'view'}
                                            value={formData.date_entree}
                                            onChange={(e) => setFormData({ ...formData, date_entree: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Date sortie prévue</label>
                                        <input
                                            type="date"
                                            disabled={modalType === 'view'}
                                            value={formData.date_sortie_prevue}
                                            onChange={(e) => setFormData({ ...formData, date_sortie_prevue: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Coûts */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <DollarSign size={20} className="text-cyan-400" />
                                    Coûts
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Coût pièces (MAD)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            disabled={modalType === 'view'}
                                            value={formData.cout_pieces}
                                            onChange={(e) => setFormData({ ...formData, cout_pieces: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Coût main d'œuvre (MAD)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            disabled={modalType === 'view'}
                                            value={formData.cout_main_oeuvre}
                                            onChange={(e) => setFormData({ ...formData, cout_main_oeuvre: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Coût total (MAD)</label>
                                        <input
                                            type="text"
                                            disabled
                                            value={(parseFloat(formData.cout_pieces || 0) + parseFloat(formData.cout_main_oeuvre || 0)).toFixed(2)}
                                            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-700 rounded-lg text-cyan-400 font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Statut et notes */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Statut et notes</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Statut *</label>
                                        <select
                                            required
                                            disabled={modalType === 'view'}
                                            value={formData.statut}
                                            onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="a_faire">À faire</option>
                                            <option value="en_cours">En cours</option>
                                            <option value="termine">Terminé</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Notes internes</label>
                                        <textarea
                                            rows="3"
                                            disabled={modalType === 'view'}
                                            value={formData.notes_internes}
                                            onChange={(e) => setFormData({ ...formData, notes_internes: e.target.value })}
                                            placeholder="Notes visibles uniquement par l'agence..."
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    {modalType === 'view' ? 'Fermer' : 'Annuler'}
                                </button>
                                {modalType !== 'view' && (
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                                    >
                                        {modalType === 'create' ? 'Enregistrer' : 'Mettre à jour'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
