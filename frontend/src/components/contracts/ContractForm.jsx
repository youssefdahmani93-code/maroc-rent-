import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Calculator } from 'lucide-react';
import SearchableSelect from '../SearchableSelect';

const ContractForm = ({ contract, initialData, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        type: 'devis',
        client_id: '',
        vehicule_id: '',
        agence_retrait_id: '',
        agence_retour_id: '',
        date_debut: '',
        date_fin: '',
        heure_debut: '10:00',
        heure_fin: '10:00',
        prix_journalier: 0,
        frais_chauffeur: 0,
        frais_livraison: 0,
        reduction: 0,
        acompte: 0,
    });

    const [clients, setClients] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({ days: 0, total: 0, remaining: 0 });

    useEffect(() => {
        fetchData();
        if (contract) {
            const startDate = new Date(contract.date_debut);
            const endDate = new Date(contract.date_fin);
            setFormData({
                ...contract,
                date_debut: startDate.toISOString().split('T')[0],
                heure_debut: startDate.toTimeString().slice(0, 5),
                date_fin: endDate.toISOString().split('T')[0],
                heure_fin: endDate.toTimeString().slice(0, 5),
            });
        } else if (initialData) {
            const startDate = new Date(initialData.date_debut);
            const endDate = new Date(initialData.date_fin);
            setFormData(prev => ({
                ...prev,
                client_id: initialData.client_id,
                vehicule_id: initialData.vehicule_id,
                agence_retrait_id: initialData.agence_retrait_id,
                agence_retour_id: initialData.agence_retour_id,
                date_debut: startDate.toISOString().split('T')[0],
                heure_debut: startDate.toTimeString().slice(0, 5),
                date_fin: endDate.toISOString().split('T')[0],
                heure_fin: endDate.toTimeString().slice(0, 5),
                prix_journalier: initialData.vehicule?.prix_jour || 0,
                acompte: initialData.acompte || 0,
            }));
        }
    }, [contract, initialData]);

    useEffect(() => {
        calculateTotals();
    }, [formData.date_debut, formData.date_fin, formData.prix_journalier, formData.frais_chauffeur, formData.frais_livraison, formData.reduction, formData.acompte]);

    const fetchData = async () => {
        try {
            const [clientsRes, vehiclesRes, agenciesRes] = await Promise.all([
                axios.get('/api/clients'),
                axios.get('/api/vehicules'),
                axios.get('/api/agences')
            ]);
            setClients(clientsRes.data);
            setVehicles(vehiclesRes.data.vehicules || vehiclesRes.data);
            setAgencies(agenciesRes.data);
        } catch (error) {
            console.error('Erreur chargement données:', error);
        }
    };

    const calculateTotals = () => {
        if (!formData.date_debut || !formData.date_fin) return;
        const start = new Date(`${formData.date_debut}T${formData.heure_debut}`);
        const end = new Date(`${formData.date_fin}T${formData.heure_fin}`);
        const diffTime = Math.abs(end - start);
        const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const basePrice = days * Number(formData.prix_journalier);
        const fees = Number(formData.frais_chauffeur) + Number(formData.frais_livraison);
        const total = basePrice + fees - Number(formData.reduction);
        const remaining = total - Number(formData.acompte);
        setSummary({ days, total, remaining });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const isNew = !contract?.id;

        try {
            const payload = {
                ...formData,
                date_debut: `${formData.date_debut}T${formData.heure_debut}:00`,
                date_fin: `${formData.date_fin}T${formData.heure_fin}:00`,
            };

            if (isNew) {
                await axios.post('/api/contracts', payload);
            } else {
                await axios.put(`/api/contracts/${contract.id}`, payload);
            }
            onSave();
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 p-6 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-white">
                        {contract ? 'Modifier le document' : 'Nouveau Devis / Facture'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Type & Client */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Type de document</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                <option value="devis">Devis</option>
                                <option value="contrat">Facture</option>
                            </select>
                        </div>
                        <div>
                            <SearchableSelect
                                label="Client"
                                required
                                options={clients.map(c => ({ value: c.id, label: `${c.nom} - ${c.telephone}` }))}
                                value={formData.client_id}
                                onChange={(val) => setFormData(prev => ({ ...prev, client_id: val }))}
                                placeholder="Sélectionner un client..."
                            />
                        </div>
                        <div>
                            <SearchableSelect
                                label="Véhicule"
                                required
                                options={vehicles.map(v => ({ value: v.id, label: `${v.marque} ${v.modele} - ${v.immatriculation}` }))}
                                value={formData.vehicule_id}
                                onChange={(val) => {
                                    const vehicle = vehicles.find(v => v.id === parseInt(val));
                                    setFormData(prev => ({ ...prev, vehicule_id: val, prix_journalier: vehicle ? vehicle.prix_jour : 0 }));
                                }}
                                placeholder="Sélectionner un véhicule..."
                            />
                        </div>
                    </div>

                    {/* Dates & Agencies */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Calculator size={20} className="text-cyan-400" />Période et Lieux</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Date Départ</label>
                                        <input type="date" name="date_debut" value={formData.date_debut} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Heure</label>
                                        <input type="time" name="heure_debut" value={formData.heure_debut} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Agence Départ</label>
                                    <select name="agence_retrait_id" value={formData.agence_retrait_id} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white">
                                        <option value="">Choisir agence</option>
                                        {agencies.map(a => (<option key={a.id} value={a.id}>{a.nom}</option>))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Date Retour</label>
                                        <input type="date" name="date_fin" value={formData.date_fin} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Heure</label>
                                        <input type="time" name="heure_fin" value={formData.heure_fin} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Agence Retour</label>
                                    <select name="agence_retour_id" value={formData.agence_retour_id} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white">
                                        <option value="">Choisir agence</option>
                                        {agencies.map(a => (<option key={a.id} value={a.id}>{a.nom}</option>))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Prix Journalier (DH)</label>
                            <input type="number" name="prix_journalier" value={formData.prix_journalier} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Frais Livraison (DH)</label>
                            <input type="number" name="frais_livraison" value={formData.frais_livraison} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Frais Chauffeur (DH)</label>
                            <input type="number" name="frais_chauffeur" value={formData.frais_chauffeur} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Réduction (DH)</label>
                            <input type="number" name="reduction" value={formData.reduction} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Acompte (DH)</label>
                            <input type="number" name="acompte" value={formData.acompte} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                        </div>
                    </div>

                    {/* Summary Footer */}
                    <div className="bg-slate-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-700">
                        <div className="text-center md:text-left"><p className="text-slate-400 text-sm">Durée</p><p className="text-2xl font-bold text-white">{summary.days} Jours</p></div>
                        <div className="text-center md:text-left"><p className="text-slate-400 text-sm">Total TTC</p><p className="text-2xl font-bold text-cyan-400">{summary.total.toFixed(2)} DH</p></div>
                        <div className="text-center md:text-left"><p className="text-slate-400 text-sm">Reste à payer</p><p className="text-2xl font-bold text-emerald-400">{summary.remaining.toFixed(2)} DH</p></div>
                        <button type="submit" disabled={loading} className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50">
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContractForm;
