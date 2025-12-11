import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import SearchableSelect from '../components/SearchableSelect';
import { Eye, Pencil, Trash2, CheckCircle, FilePlus, Calendar, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Reservations = () => {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [clients, setClients] = useState([]);
    const [vehicules, setVehicules] = useState([]);
    const [agences, setAgences] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ statut: '', search: '' });
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'create', 'edit', 'view'
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [formData, setFormData] = useState({
        client_id: '',
        vehicule_id: '',
        agence_retrait_id: '',
        agence_retour_id: '',
        date_debut: '',
        date_fin: '',
        prix_total: 0,
        caution: 0,
        avec_chauffeur: false,
        notes: '',
        statut: 'en_attente',
        acompte: 0,
        methode_paiement: 'especes',
    });
    const [availabilityMessage, setAvailabilityMessage] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const [settings, setSettings] = useState({});

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        try {
            const params = {};
            if (filter.statut) params.statut = filter.statut;

            // Fetch data with individual error handling
            const [reservationsRes, clientsRes, vehiculesRes, agencesRes, maintenancesRes, settingsRes] = await Promise.allSettled([
                axios.get(`${API_URL}/reservations`, { params }),
                axios.get(`${API_URL}/clients`),
                axios.get(`${API_URL}/vehicules`, { params: { limit: 1000 } }),
                axios.get(`${API_URL}/agences`),
                axios.get(`${API_URL}/maintenance`),
                axios.get(`${API_URL}/settings`),
            ]);

            // Set data only if successful
            if (reservationsRes.status === 'fulfilled') setReservations(reservationsRes.value.data);
            if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data);
            if (vehiculesRes.status === 'fulfilled') setVehicules(vehiculesRes.value.data.vehicules || vehiculesRes.value.data);
            if (agencesRes.status === 'fulfilled') setAgences(agencesRes.value.data);
            if (maintenancesRes.status === 'fulfilled') setMaintenances(maintenancesRes.value.data);
            if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value.data);

            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            setLoading(false);
        }
    };

    const getStatutBadge = (statut) => {
        const badges = {
            en_attente: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            confirmee: 'bg-green-500/10 text-green-400 border-green-500/20',
            en_cours: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            terminee: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
            annulee: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return badges[statut] || badges.en_attente;
    };

    const getStatutLabel = (statut) => {
        const labels = {
            en_attente: 'En attente',
            confirmee: 'Confirmée',
            en_cours: 'En cours',
            terminee: 'Terminée',
            annulee: 'Annulée',
        };
        return labels[statut] || statut;
    };

    const checkAvailability = async (data = formData) => {
        if (!data.vehicule_id || !data.date_debut || !data.date_fin) return;
        try {
            const params = {
                vehicule_id: data.vehicule_id,
                date_debut: data.date_debut,
                date_fin: data.date_fin,
            };
            if (selectedReservation) {
                params.exclude_reservation_id = selectedReservation.id;
            }
            const res = await axios.get(`${API_URL}/reservations/check-availability`, { params });
            setAvailabilityMessage(res.data.message);
        } catch (error) {
            console.error('Erreur lors de la vérification:', error);
        }
    };

    const calculateTotal = (data = formData) => {
        if (!data.vehicule_id || !data.date_debut || !data.date_fin) return;
        const vehicule = vehicules.find(v => v.id === parseInt(data.vehicule_id));
        if (!vehicule) return;

        const dateDebut = new Date(data.date_debut);
        const dateFin = new Date(data.date_fin);

        if (dateFin < dateDebut) return;

        let jours = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24));
        if (jours === 0) jours = 1; // Minimum 1 day

        const total = vehicule.prix_jour * jours;
        // Use fixed caution from settings, default to 5000 if not set
        const caution = settings.caution_fixe ? parseFloat(settings.caution_fixe) : 5000;

        setFormData(prev => ({ ...prev, prix_total: total, caution: caution }));
    };

    // Handle field changes that affect price/availability
    const handleFieldChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);

        if (['vehicule_id', 'date_debut', 'date_fin'].includes(field)) {
            if (newData.vehicule_id && newData.date_debut && newData.date_fin) {
                checkAvailability(newData);
                calculateTotal(newData);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields before parsing
        if (!formData.client_id) {
            showToast('Veuillez sélectionner un client', 'error');
            return;
        }
        if (!formData.vehicule_id) {
            showToast('Veuillez sélectionner un véhicule', 'error');
            return;
        }
        if (!formData.agence_retrait_id) {
            showToast('Veuillez sélectionner une agence de retrait', 'error');
            return;
        }
        if (!formData.agence_retour_id) {
            showToast('Veuillez sélectionner une agence de retour', 'error');
            return;
        }
        if (!formData.date_debut || !formData.date_fin) {
            showToast('Veuillez sélectionner les dates', 'error');
            return;
        }

        const dataToSend = {
            ...formData,
            client_id: parseInt(formData.client_id),
            vehicule_id: parseInt(formData.vehicule_id),
            agence_retrait_id: parseInt(formData.agence_retrait_id),
            agence_retour_id: parseInt(formData.agence_retour_id),
            prix_total: parseFloat(formData.prix_total || 0),
            caution: parseFloat(formData.caution || 0),
            acompte: parseFloat(formData.acompte || 0),
        };

        try {
            if (modalType === 'create') {
                await axios.post(`${API_URL}/reservations`, dataToSend);
            } else if (modalType === 'edit') {
                await axios.put(`${API_URL}/reservations/${selectedReservation.id}`, dataToSend);
            }
            setShowModal(false);
            fetchData();
            resetForm();
            showToast(modalType === 'create' ? 'Réservation créée avec succès' : 'Réservation mise à jour avec succès');
        } catch (error) {
            console.error('Erreur:', error);
            const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
            const validationErrors = error.response?.data?.errors;

            if (validationErrors && Array.isArray(validationErrors)) {
                showToast(`${errorMessage}: ${validationErrors.join(', ')}`, 'error');
            } else {
                showToast(errorMessage, 'error');
            }
        }
    };

    const handleChangeStatus = async (id, newStatut) => {
        try {
            await axios.put(`${API_URL}/reservations/${id}/status`, { statut: newStatut });
            fetchData();
            showToast('Statut mis à jour avec succès');
        } catch (error) {
            console.error('Erreur:', error);
            showToast(error.response?.data?.message || 'Erreur lors du changement de statut', 'error');
        }
    };

    const handleCreateContractFromReservation = (reservation) => {
        navigate('/admin/contracts', { state: { fromReservation: reservation } });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.')) {
            try {
                await axios.delete(`${API_URL}/reservations/${id}`);
                fetchData();
                showToast('Réservation supprimée avec succès');
            } catch (error) {
                console.error("Erreur lors de la suppression:", error);
                showToast('Erreur lors de la suppression', 'error');
            }
        }
    };

    const openCreateModal = () => {
        resetForm();
        setModalType('create');
        setShowModal(true);
    };

    const openEditModal = (reservation) => {
        setSelectedReservation(reservation);
        setFormData({
            client_id: reservation.client_id,
            vehicule_id: reservation.vehicule_id,
            agence_retrait_id: reservation.agence_retrait_id,
            agence_retour_id: reservation.agence_retour_id,
            date_debut: reservation.date_debut ? reservation.date_debut.split('T')[0] : '',
            date_fin: reservation.date_fin ? reservation.date_fin.split('T')[0] : '',
            prix_total: reservation.prix_total,
            caution: reservation.caution,
            avec_chauffeur: reservation.avec_chauffeur,
            notes: reservation.notes || '',
            statut: reservation.statut,
            acompte: reservation.acompte || 0,
            methode_paiement: reservation.methode_paiement || 'especes',
        });
        setModalType('edit');
        setShowModal(true);
    };

    const openViewModal = (reservation) => {
        setSelectedReservation(reservation);
        setFormData({
            client_id: reservation.client_id,
            vehicule_id: reservation.vehicule_id,
            agence_retrait_id: reservation.agence_retrait_id,
            agence_retour_id: reservation.agence_retour_id,
            date_debut: reservation.date_debut ? reservation.date_debut.split('T')[0] : '',
            date_fin: reservation.date_fin ? reservation.date_fin.split('T')[0] : '',
            prix_total: reservation.prix_total,
            caution: reservation.caution,
            avec_chauffeur: reservation.avec_chauffeur,
            notes: reservation.notes || '',
            statut: reservation.statut,
            acompte: reservation.acompte || 0,
            methode_paiement: reservation.methode_paiement || 'especes',
        });
        setModalType('view');
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            client_id: '',
            vehicule_id: '',
            agence_retrait_id: '',
            agence_retour_id: '',
            date_debut: '',
            date_fin: '',
            prix_total: 0,
            caution: 0,
            avec_chauffeur: false,
            notes: '',
            statut: 'en_attente',
            acompte: 0,
            methode_paiement: 'especes',
        });
        setSelectedReservation(null);
        setAvailabilityMessage('');
    };

    // Prepare options for Selects
    const clientOptions = clients.map(c => ({ value: c.id, label: `${c.nom} - ${c.telephone}` }));
    const vehicleOptions = vehicules.map(v => ({
        value: v.id,
        label: `${v.marque} ${v.modele} - ${v.immatriculation}`,
        ...v
    }));
    const agencyOptions = agences.map(a => ({ value: a.id, label: `${a.nom} - ${a.ville}` }));

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Réservations</h1>
                    <p className="text-slate-400">Gestion complète des réservations de véhicules</p>
                </div>
                <div className="flex space-x-3">
                    <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            Liste
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            Calendrier
                        </button>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-2"
                    >
                        <Calendar className="w-5 h-5" />
                        <span>Nouvelle réservation</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Statut</label>
                        <select
                            value={filter.statut}
                            onChange={(e) => setFilter({ ...filter, statut: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">Tous</option>
                            <option value="en_attente">En attente</option>
                            <option value="confirmee">Confirmée</option>
                            <option value="en_cours">En cours</option>
                            <option value="terminee">Terminée</option>
                            <option value="annulee">Annulée</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Recherche</label>
                        <input
                            type="text"
                            placeholder="Client, véhicule..."
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => setFilter({ statut: '', search: '' })}
                            className="w-full px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                            Réinitialiser
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar View */}
            {viewMode === 'calendar' && (
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">
                            {currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                            >
                                ←
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-3 py-1 text-sm bg-slate-700 text-white rounded-lg"
                            >
                                Aujourd'hui
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                            >
                                →
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-px bg-slate-700/50 rounded-lg overflow-hidden border border-slate-700">
                        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                            <div key={day} className="bg-slate-800 p-2 text-center text-sm font-medium text-slate-400">
                                {day}
                            </div>
                        ))}

                        {(() => {
                            const days = [];
                            const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                            const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                            const startPadding = firstDay.getDay();
                            const endPadding = 6 - lastDay.getDay();

                            // Previous month padding
                            for (let i = 0; i < startPadding; i++) {
                                days.push(<div key={`pad-start-${i}`} className="bg-slate-900/50 h-32"></div>);
                            }

                            // Days of current month
                            for (let i = 1; i <= lastDay.getDate(); i++) {
                                const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
                                const dayReservations = reservations.filter(r => {
                                    const start = new Date(r.date_debut);
                                    const end = new Date(r.date_fin);
                                    return currentDayDate >= new Date(start.setHours(0, 0, 0, 0)) &&
                                        currentDayDate <= new Date(end.setHours(23, 59, 59, 999));
                                });

                                days.push(
                                    <div key={i} className="bg-slate-800 hover:bg-slate-700/50 transition-colors h-32 p-2 border-t border-slate-700/30 relative group">
                                        <span className={`text-sm font-medium ${new Date().toDateString() === currentDayDate.toDateString()
                                            ? 'bg-cyan-500 text-white w-6 h-6 flex items-center justify-center rounded-full'
                                            : 'text-slate-300'
                                            }`}>
                                            {i}
                                        </span>
                                        <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                            {dayReservations.map(res => (
                                                <div
                                                    key={res.id}
                                                    onClick={() => openViewModal(res)}
                                                    className={`text-xs p-1 rounded cursor-pointer truncate ${res.statut === 'confirmee' ? 'bg-green-500/20 text-green-300' :
                                                        res.statut === 'en_cours' ? 'bg-blue-500/20 text-blue-300' :
                                                            res.statut === 'terminee' ? 'bg-slate-500/20 text-slate-400' :
                                                                'bg-yellow-500/20 text-yellow-300'
                                                        }`}
                                                    title={`${res.client?.nom} - ${res.vehicule?.marque} ${res.vehicule?.modele}`}
                                                >
                                                    {res.client?.nom}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            // Next month padding
                            for (let i = 0; i < endPadding; i++) {
                                days.push(<div key={`pad-end-${i}`} className="bg-slate-900/50 h-32"></div>);
                            }

                            return days;
                        })()}
                    </div>
                </div>
            )}

            {/* Table View */}
            {viewMode === 'list' && (
                <>
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-900/80 border-b border-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Véhicule</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Dates</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Prix</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {reservations.map((reservation) => (
                                        <tr key={reservation.id} className="hover:bg-slate-900/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-white font-medium">{reservation.client?.nom}</div>
                                                    <div className="text-sm text-slate-400">{reservation.client?.telephone}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-white font-medium">{reservation.vehicule?.marque} {reservation.vehicule?.modele}</div>
                                                    <div className="text-sm text-slate-400">{reservation.vehicule?.immatriculation}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="text-white">{new Date(reservation.date_debut).toLocaleDateString('fr-FR')}</div>
                                                    <div className="text-slate-400">→ {new Date(reservation.date_fin).toLocaleDateString('fr-FR')}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-cyan-400 font-bold">{parseFloat(reservation.prix_total).toLocaleString()} MAD</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatutBadge(reservation.statut)}`}>
                                                    {getStatutLabel(reservation.statut)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    {reservation.statut === 'en_attente' && (
                                                        <button
                                                            onClick={() => handleChangeStatus(reservation.id, 'confirmee')}
                                                            title="Confirmer"
                                                            className="p-1.5 hover:bg-green-500/10 rounded-lg text-green-400 hover:text-green-300 transition-colors"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    {reservation.statut === 'confirmee' && (
                                                        <button
                                                            onClick={() => handleCreateContractFromReservation(reservation)}
                                                            title="Créer une facture/devis"
                                                            className="p-1.5 hover:bg-blue-500/10 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                                                        >
                                                            <FilePlus size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openViewModal(reservation)}
                                                        title="Voir"
                                                        className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(reservation)}
                                                        title="Modifier"
                                                        className="p-1.5 hover:bg-cyan-500/10 rounded-lg text-cyan-400 hover:text-cyan-300 transition-colors"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(reservation.id)}
                                                        title="Supprimer"
                                                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-colors"
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
                    {reservations.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-400">Aucune réservation trouvée</p>
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
                            <h2 className="text-2xl font-bold text-white">
                                {modalType === 'create' ? 'Nouvelle réservation' : modalType === 'edit' ? 'Modifier la réservation' : 'Détails de la réservation'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Client Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-cyan-400 border-b border-slate-700 pb-2">Informations Client</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <SearchableSelect
                                            label="Client"
                                            required
                                            options={clientOptions}
                                            value={formData.client_id}
                                            onChange={(val) => setFormData({ ...formData, client_id: val })}
                                            disabled={modalType === 'view'}
                                            placeholder="Rechercher un client..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-cyan-400 border-b border-slate-700 pb-2">Véhicule</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <SearchableSelect
                                            label="Véhicule"
                                            required
                                            options={vehicleOptions}
                                            value={formData.vehicule_id}
                                            onChange={(val) => handleFieldChange('vehicule_id', val)}
                                            disabled={modalType === 'view'}
                                            placeholder="Rechercher un véhicule..."
                                            renderOption={(opt) => (
                                                <div className="flex justify-between items-center w-full">
                                                    <span>{opt.marque} {opt.modele} - {opt.immatriculation}</span>
                                                    <span className="text-xs bg-slate-700 px-2 py-1 rounded text-cyan-400">{opt.prix_jour} MAD/j</span>
                                                </div>
                                            )}
                                        />
                                        {availabilityMessage && (
                                            <p className={`text-sm mt-2 font-medium ${availabilityMessage.includes('disponible') ? 'text-green-400' : 'text-red-400'}`}>
                                                {availabilityMessage}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Dates & Locations */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-cyan-400 border-b border-slate-700 pb-2">Dates et Lieux</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Date de début *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date_debut}
                                            onChange={(e) => handleFieldChange('date_debut', e.target.value)}
                                            disabled={modalType === 'view'}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Date de fin *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date_fin}
                                            onChange={(e) => handleFieldChange('date_fin', e.target.value)}
                                            disabled={modalType === 'view'}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <SearchableSelect
                                            label="Agence de retrait"
                                            required
                                            options={agencyOptions}
                                            value={formData.agence_retrait_id}
                                            onChange={(val) => setFormData({ ...formData, agence_retrait_id: val })}
                                            disabled={modalType === 'view'}
                                            placeholder="Sélectionner une agence..."
                                        />
                                    </div>
                                    <div>
                                        <SearchableSelect
                                            label="Agence de retour"
                                            required
                                            options={agencyOptions}
                                            value={formData.agence_retour_id}
                                            onChange={(val) => setFormData({ ...formData, agence_retour_id: val })}
                                            disabled={modalType === 'view'}
                                            placeholder="Sélectionner une agence..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-cyan-400 border-b border-slate-700 pb-2">Détails Financiers</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Prix Total (Calculé)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.prix_total}
                                                readOnly
                                                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none cursor-not-allowed"
                                            />
                                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500">MAD</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Caution (Fixe)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.caution}
                                                readOnly
                                                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none cursor-not-allowed"
                                            />
                                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500">MAD</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Acompte</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.acompte}
                                                onChange={(e) => setFormData({ ...formData, acompte: e.target.value })}
                                                disabled={modalType === 'view'}
                                                className="w-full bg-transparent text-2xl font-bold text-cyan-400 focus:outline-none disabled:cursor-not-allowed"
                                            />
                                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500">MAD</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Méthode de paiement</label>
                                        <select
                                            value={formData.methode_paiement}
                                            onChange={(e) => setFormData({ ...formData, methode_paiement: e.target.value })}
                                            disabled={modalType === 'view'}
                                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="especes">Espèces</option>
                                            <option value="carte">Carte Bancaire</option>
                                            <option value="virement">Virement</option>
                                            <option value="cheque">Chèque</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center h-full pt-6">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.avec_chauffeur}
                                                onChange={(e) => setFormData({ ...formData, avec_chauffeur: e.target.checked })}
                                                disabled={modalType === 'view'}
                                                className="w-5 h-5 text-cyan-500 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                            <span className="text-white font-medium">Avec chauffeur</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                                <textarea
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    disabled={modalType === 'view'}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Observations supplémentaires..."
                                />
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700 sticky bottom-0 bg-slate-800 pb-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
                                >
                                    {modalType === 'view' ? 'Fermer' : 'Annuler'}
                                </button>
                                {modalType !== 'view' && (
                                    <button
                                        type="submit"
                                        className="px-8 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
                                    >
                                        {modalType === 'create' ? 'Créer la réservation' : 'Mettre à jour'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default Reservations;
