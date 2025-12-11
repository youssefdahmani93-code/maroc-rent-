import { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, Edit, Trash2, X } from 'lucide-react';

const API_URL = '/api';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ search: '', statut: '', ville: '' });
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'create', 'edit', 'view'
    const [selectedClient, setSelectedClient] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        telephone: '',
        email: '',
        adresse: '',
        ville: '',
        date_naissance: '',
        type_document: 'cin',
        cni_passport: '',
        date_expiration_document: '',
        permis_conduire: '',
        statut: 'normal',
        notes_internes: ''
    });

    useEffect(() => {
        fetchClients();
    }, [filter]);

    const fetchClients = async () => {
        try {
            const params = {};
            if (filter.search) params.search = filter.search;
            if (filter.statut) params.statut = filter.statut;
            if (filter.ville) params.ville = filter.ville;

            const res = await axios.get(`${API_URL}/clients`, { params });
            setClients(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des clients:', error);
            setLoading(false);
        }
    };

    const getStatutBadge = (statut) => {
        const badges = {
            normal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            vip: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            blacklist: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
        return badges[statut] || badges.normal;
    };

    const getStatutLabel = (statut) => {
        const labels = {
            normal: 'Normal',
            vip: 'VIP',
            blacklist: 'Blacklist'
        };
        return labels[statut] || statut;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            // Convert empty strings to null for dates and optional fields
            if (!payload.date_naissance) payload.date_naissance = null;
            if (!payload.date_expiration_document) payload.date_expiration_document = null;
            if (!payload.email) payload.email = null;
            if (!payload.adresse) payload.adresse = null;
            if (!payload.ville) payload.ville = null;
            if (!payload.permis_conduire) payload.permis_conduire = null;

            if (modalType === 'create') {
                await axios.post(`${API_URL}/clients`, payload);
            } else if (modalType === 'edit') {
                await axios.put(`${API_URL}/clients/${selectedClient.id}`, payload);
            }
            setShowModal(false);
            fetchClients();
            resetForm();
        } catch (error) {
            console.error('Erreur détaillée:', error);
            let errorMessage = 'Une erreur est survenue';

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                errorMessage = error.response.data?.message || `Erreur serveur (${error.response.status})`;
                console.error('Response data:', error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion ou si le serveur est démarré.';
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = error.message;
            }

            alert(errorMessage);
        }
    };

    const handleDeleteClick = (client) => {
        setClientToDelete(client);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!clientToDelete) return;

        try {
            await axios.delete(`${API_URL}/clients/${clientToDelete.id}`);
            setDeleteDialogOpen(false);
            setClientToDelete(null);
            fetchClients();
            alert('Client supprimé avec succès');
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            const message = error.response?.data?.message || 'Erreur lors de la suppression';
            alert(message);
        }
    };

    const handleView = (client) => {
        setSelectedClient(client);
        setModalType('view');
        setShowModal(true);
    };

    const openCreateModal = () => {
        resetForm();
        setModalType('create');
        setShowModal(true);
    };

    const openEditModal = (client) => {
        setSelectedClient(client);
        setFormData({
            nom: client.nom,
            telephone: client.telephone,
            email: client.email || '',
            adresse: client.adresse || '',
            ville: client.ville || '',
            date_naissance: client.date_naissance ? client.date_naissance.split('T')[0] : '',
            type_document: client.type_document,
            cni_passport: client.cni_passport,
            date_expiration_document: client.date_expiration_document ? client.date_expiration_document.split('T')[0] : '',
            permis_conduire: client.permis_conduire || '',
            statut: client.statut,
            notes_internes: client.notes_internes || ''
        });
        setModalType('edit');
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            nom: '',
            telephone: '',
            email: '',
            adresse: '',
            ville: '',
            date_naissance: '',
            type_document: 'cin',
            cni_passport: '',
            date_expiration_document: '',
            permis_conduire: '',
            statut: 'normal',
            notes_internes: ''
        });
        setSelectedClient(null);
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
                    <h1 className="text-3xl font-bold text-white mb-2">Gestion des Clients</h1>
                    <p className="text-slate-400">Liste complète des clients de l'agence</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                    >
                        + Ajouter un client
                    </button>
                    <button className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                        Exporter Excel
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Recherche</label>
                        <input
                            type="text"
                            placeholder="Nom, téléphone, CIN/Passeport, email..."
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Statut</label>
                        <select
                            value={filter.statut}
                            onChange={(e) => setFilter({ ...filter, statut: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">Tous</option>
                            <option value="normal">Normal</option>
                            <option value="vip">VIP</option>
                            <option value="blacklist">Blacklist</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Ville</label>
                        <input
                            type="text"
                            placeholder="Filtrer par ville"
                            value={filter.ville}
                            onChange={(e) => setFilter({ ...filter, ville: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50 border-b border-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Document</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Ville</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Réservations</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {clients.map((client) => (
                                <tr key={client.id} className="hover:bg-slate-900/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-white font-medium">{client.nom}</div>
                                            <div className="text-sm text-slate-400">
                                                Ajouté le {new Date(client.cree_le).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-white">{client.telephone}</div>
                                            {client.email && <div className="text-sm text-slate-400">{client.email}</div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-white text-sm">{client.type_document.toUpperCase()}</div>
                                            <div className="text-sm text-slate-400">{client.cni_passport}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white">{client.ville || '-'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-cyan-400 font-bold">{client.nombre_reservations}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatutBadge(client.statut)}`}>
                                            {getStatutLabel(client.statut)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {/* Voir */}
                                            <button type="button"
                                                onClick={() => handleView(client)}
                                                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 group"
                                                aria-label={`Voir le client ${client.nom}`}
                                                title="Voir la fiche"
                                            >
                                                <Eye className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
                                            </button>

                                            {/* Modifier */}
                                            <button type="button"
                                                onClick={() => openEditModal(client)}
                                                className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 group"
                                                aria-label={`Modifier le client ${client.nom}`}
                                                title="Modifier"
                                            >
                                                <Edit className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                                            </button>

                                            {/* Supprimer */}
                                            <button type="button"
                                                onClick={() => handleDeleteClick(client)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 group"
                                                aria-label={`Supprimer le client ${client.nom}`}
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {clients.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-400">Aucun client trouvé</p>
                </div>
            )}

            {/* Modal */}
            {showModal && modalType !== 'view' && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700">
                            <h2 className="text-2xl font-bold text-white">
                                {modalType === 'create' ? 'Ajouter un client' : 'Modifier le client'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Informations personnelles */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Informations personnelles</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Nom complet *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nom}
                                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Téléphone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.telephone}
                                            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Date de naissance</label>
                                        <input
                                            type="date"
                                            value={formData.date_naissance}
                                            onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Ville</label>
                                        <input
                                            type="text"
                                            value={formData.ville}
                                            onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Adresse</label>
                                        <input
                                            type="text"
                                            value={formData.adresse}
                                            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Informations documentaires */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Informations documentaires</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Type de document *</label>
                                        <select
                                            required
                                            value={formData.type_document}
                                            onChange={(e) => setFormData({ ...formData, type_document: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        >
                                            <option value="cin">CIN</option>
                                            <option value="passeport">Passeport</option>
                                            <option value="permis_etranger">Permis étranger</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Numéro du document *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.cni_passport}
                                            onChange={(e) => setFormData({ ...formData, cni_passport: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Date d'expiration</label>
                                        <input
                                            type="date"
                                            value={formData.date_expiration_document}
                                            onChange={(e) => setFormData({ ...formData, date_expiration_document: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Permis de conduire</label>
                                        <input
                                            type="text"
                                            value={formData.permis_conduire}
                                            onChange={(e) => setFormData({ ...formData, permis_conduire: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Informations supplémentaires */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Informations supplémentaires</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Statut client</label>
                                        <select
                                            value={formData.statut}
                                            onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="vip">VIP</option>
                                            <option value="blacklist">Blacklist</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Notes internes</label>
                                        <textarea
                                            rows="3"
                                            value={formData.notes_internes}
                                            onChange={(e) => setFormData({ ...formData, notes_internes: e.target.value })}
                                            placeholder="Notes visibles uniquement par l'agence..."
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                                >
                                    {modalType === 'create' ? 'Enregistrer' : 'Mettre à jour'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Visualisation */}
            {showModal && modalType === 'view' && selectedClient && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Fiche Client - {selectedClient.nom}</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                aria-label="Fermer"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Informations principales */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Informations personnelles</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-400">Nom complet</span>
                                        <p className="text-white font-medium">{selectedClient.nom}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Téléphone</span>
                                        <p className="text-white font-medium">{selectedClient.telephone}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Email</span>
                                        <p className="text-white font-medium">{selectedClient.email || '-'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Ville</span>
                                        <p className="text-white font-medium">{selectedClient.ville || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-400">Adresse</span>
                                        <p className="text-white font-medium">{selectedClient.adresse || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="border-t border-slate-700 pt-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Documents</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-400">Type de document</span>
                                        <p className="text-white font-medium">{selectedClient.type_document.toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Numéro</span>
                                        <p className="text-white font-medium">{selectedClient.cni_passport}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Date d'expiration</span>
                                        <p className="text-white font-medium">
                                            {selectedClient.date_expiration_document
                                                ? new Date(selectedClient.date_expiration_document).toLocaleDateString('fr-FR')
                                                : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Permis de conduire</span>
                                        <p className="text-white font-medium">{selectedClient.permis_conduire || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Historique */}
                            <div className="border-t border-slate-700 pt-6">
                                <h3 className="text-lg font-semibold text-white mb-3">Historique</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-400">Nombre de réservations</span>
                                        <p className="text-cyan-400 font-bold text-xl">{selectedClient.nombre_reservations || 0}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Statut client</span>
                                        <p className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatutBadge(selectedClient.statut)}`}>
                                            {getStatutLabel(selectedClient.statut)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Notes internes */}
                            {selectedClient.notes_internes && (
                                <div className="border-t border-slate-700 pt-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">Notes internes</h3>
                                    <p className="text-slate-300 text-sm bg-slate-900/50 p-4 rounded-lg">
                                        {selectedClient.notes_internes}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-700 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog Confirmation Suppression */}
            {deleteDialogOpen && clientToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Confirmer la suppression</h3>
                        <p className="text-slate-300 mb-6">
                            Êtes-vous sûr de vouloir supprimer définitivement le client{' '}
                            <strong className="text-white">{clientToDelete.nom}</strong> ?
                            <br />
                            <span className="text-red-400 text-sm block mt-2">
                                ⚠️ Cette action est irréversible.
                            </span>
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setDeleteDialogOpen(false);
                                    setClientToDelete(null);
                                }}
                                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Confirmer la suppression
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
