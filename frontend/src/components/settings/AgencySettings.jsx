import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Building, MapPin, Phone, FileText, X } from 'lucide-react';

const AgencySettings = () => {
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        ville: '',
        adresse: '',
        telephone: '',
        email: '',
        ice: '',
        patente: '',
        rc: '',
        cnss: '',
        if_fiscal: ''
    });

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        try {
            const res = await axios.get('/api/agences');
            setAgencies(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement agences:', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) {
            try {
                await axios.delete(`/api/agences/${id}`);
                fetchAgencies();
            } catch (error) {
                console.error('Erreur suppression:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const openCreateModal = () => {
        setSelectedAgency(null);
        setFormData({
            nom: '',
            ville: '',
            adresse: '',
            telephone: '',
            email: '',
            ice: '',
            patente: '',
            rc: '',
            cnss: '',
            if_fiscal: ''
        });
        setShowModal(true);
    };

    const openEditModal = (agency) => {
        setSelectedAgency(agency);
        setFormData({
            nom: agency.nom,
            ville: agency.ville || '',
            adresse: agency.adresse || '',
            telephone: agency.telephone || '',
            email: agency.email || '',
            ice: agency.ice || '',
            patente: agency.patente || '',
            rc: agency.rc || '',
            cnss: agency.cnss || '',
            if_fiscal: agency.if_fiscal || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedAgency) {
                await axios.put(`/api/agences/${selectedAgency.id}`, formData);
            } else {
                await axios.post('/api/agences', formData);
            }
            setShowModal(false);
            fetchAgencies();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Description */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                    <MapPin className="text-cyan-400" size={28} />
                    <h2 className="text-2xl font-bold text-white">Agences (Branches)</h2>
                </div>
                <p className="text-slate-400">
                    Gérez les différentes agences (branches) de votre entreprise dans les différentes villes.
                    Ces agences servent de points de retrait et de retour pour les véhicules.
                </p>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white">Liste des Agences</h3>
                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                >
                    <Plus size={20} />
                    <span>Nouvelle Agence</span>
                </button>
            </div>

            {/* Agencies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agencies.map((agency) => (
                    <div key={agency.id} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 flex flex-col h-full hover:border-cyan-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400">
                                    <Building size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{agency.nom}</h3>
                                    <div className="flex items-center text-sm text-slate-400">
                                        <MapPin size={14} className="mr-1" />
                                        {agency.ville}
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => openEditModal(agency)}
                                    className="p-2 hover:bg-cyan-500/10 rounded-lg text-cyan-400 transition-colors"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(agency.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 flex-1">
                            {agency.adresse && (
                                <p className="text-sm text-slate-300 flex items-start">
                                    <span className="text-slate-500 min-w-[80px]">Adresse:</span>
                                    {agency.adresse}
                                </p>
                            )}
                            {agency.telephone && (
                                <p className="text-sm text-slate-300 flex items-center">
                                    <span className="text-slate-500 min-w-[80px]">Tél:</span>
                                    {agency.telephone}
                                </p>
                            )}
                            {agency.email && (
                                <p className="text-sm text-slate-300 flex items-center">
                                    <span className="text-slate-500 min-w-[80px]">Email:</span>
                                    {agency.email}
                                </p>
                            )}

                            <div className="pt-3 mt-3 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-xs">
                                {agency.ice && (
                                    <div className="text-slate-400">
                                        <span className="block text-slate-600 uppercase">ICE</span>
                                        {agency.ice}
                                    </div>
                                )}
                                {agency.patente && (
                                    <div className="text-slate-400">
                                        <span className="block text-slate-600 uppercase">Patente</span>
                                        {agency.patente}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">
                                {selectedAgency ? 'Modifier l\'agence' : 'Nouvelle agence'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-semibold text-white mb-4">Informations générales</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Nom de l'agence *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Ville *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.ville}
                                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Adresse</label>
                                    <input
                                        type="text"
                                        value={formData.adresse}
                                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Téléphone</label>
                                    <input
                                        type="tel"
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

                                <div className="md:col-span-2 mt-4">
                                    <h3 className="text-lg font-semibold text-white mb-4">Informations légales</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">ICE</label>
                                    <input
                                        type="text"
                                        value={formData.ice}
                                        onChange={(e) => setFormData({ ...formData, ice: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Patente</label>
                                    <input
                                        type="text"
                                        value={formData.patente}
                                        onChange={(e) => setFormData({ ...formData, patente: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">RC</label>
                                    <input
                                        type="text"
                                        value={formData.rc}
                                        onChange={(e) => setFormData({ ...formData, rc: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">CNSS</label>
                                    <input
                                        type="text"
                                        value={formData.cnss}
                                        onChange={(e) => setFormData({ ...formData, cnss: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">IF Fiscal</label>
                                    <input
                                        type="text"
                                        value={formData.if_fiscal}
                                        onChange={(e) => setFormData({ ...formData, if_fiscal: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                                >
                                    {selectedAgency ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgencySettings;
