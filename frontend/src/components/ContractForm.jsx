import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Toast from './Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ContractForm = ({ isOpen, onClose, prefill, type = 'contrat', onSuccess }) => {
    const [clients, setClients] = useState([]);
    const [vehicules, setVehicules] = useState([]);
    const [agences, setAgences] = useState([]);
    const [extras, setExtras] = useState([
        { label: 'Chauffeur', price: 200 },
        { label: 'GPS', price: 50 },
        { label: 'Siège bébé', price: 30 }
    ]);
    const [formData, setFormData] = useState({
        type: 'contrat', // default to contract, can be changed to devis via UI if needed
        client_id: '',
        vehicule_id: '',
        agence_retrait_id: '',
        agence_retour_id: '',
        date_debut: '',
        date_fin: '',
        prix_journalier: 0,
        reduction: 0,
        frais_chauffeur: 0,
        frais_livraison: 0,
        frais_carburant: 0,
        frais_depassement_km: 0,
        acompte: 0,
        extras: [],
        terms_accepted: false
    });
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => setToast({ message: msg, type });

    useEffect(() => {
        if (!isOpen) return;
        // fetch data once when modal opens
        const fetchData = async () => {
            try {
                const [cRes, vRes, aRes] = await Promise.all([
                    axios.get(`${API_URL}/clients`),
                    axios.get(`${API_URL}/vehicules`),
                    axios.get(`${API_URL}/agences`)
                ]);
                setClients(cRes.data);
                setVehicules(vRes.data);
                setAgences(aRes.data);
            } catch (e) {
                console.error(e);
                showToast('Erreur lors du chargement des données', 'error');
            }
        };
        fetchData();
    }, [isOpen]);

    // Prefill from reservation if provided
    useEffect(() => {
        if (prefill) {
            setFormData(prev => ({
                ...prev,
                client_id: prefill.client_id || '',
                vehicule_id: prefill.vehicule_id || '',
                agence_retrait_id: prefill.agence_retrait_id || '',
                agence_retour_id: prefill.agence_retour_id || '',
                date_debut: prefill.date_debut || '',
                date_fin: prefill.date_fin || '',
                prix_journalier: prefill.prix_journalier || 0
            }));
        }
    }, [prefill]);

    // Update price when vehicle changes
    useEffect(() => {
        if (formData.vehicule_id) {
            const veh = vehicules.find(v => v.id === Number(formData.vehicule_id));
            if (veh) {
                setFormData(prev => ({ ...prev, prix_journalier: veh.prix_journalier }));
            }
        }
    }, [formData.vehicule_id, vehicules]);

    const toggleExtra = (extra) => {
        setFormData(prev => {
            const exists = prev.extras.find(e => e.label === extra.label);
            let newExtras;
            if (exists) {
                newExtras = prev.extras.filter(e => e.label !== extra.label);
            } else {
                newExtras = [...prev.extras, extra];
            }
            return { ...prev, extras: newExtras };
        });
    };

    const calculateTotal = () => {
        const start = new Date(formData.date_debut);
        const end = new Date(formData.date_fin);
        const days = Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        const base = formData.prix_journalier * days;
        const fraisSup = Number(formData.frais_chauffeur) + Number(formData.frais_livraison) + Number(formData.frais_carburant) + Number(formData.frais_depassement_km);
        const extrasTotal = formData.extras.reduce((sum, e) => sum + Number(e.price), 0);
        const total = base + fraisSup + extrasTotal - Number(formData.reduction);
        return { days, total };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic front validation
        if (!formData.client_id || !formData.vehicule_id || !formData.date_debut || !formData.date_fin) {
            showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        if (!formData.terms_accepted) {
            showToast('Vous devez accepter les CGV', 'error');
            return;
        }
        const payload = {
            ...formData,
            extras: formData.extras.map(e => ({ label: e.label, prix: e.price }))
        };
        try {
            const res = await axios.post(`${API_URL}/contracts`, payload);
            showToast('Contrat créé avec succès');
            onClose();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Erreur lors de la création du contrat';
            showToast(msg, 'error');
        }
    };

    if (!isOpen) return null;

    const { days, total } = calculateTotal();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg w-full max-w-2xl overflow-y-auto max-h-screen">
                <h2 className="text-2xl font-bold text-white mb-4">Créer un {formData.type === 'devis' ? 'devis' : 'contrat'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Client */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Client *</label>
                        <select
                            required
                            value={formData.client_id}
                            onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded"
                        >
                            <option value="">Sélectionner un client</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.nom} - {c.telephone}</option>
                            ))}
                        </select>
                    </div>
                    {/* Véhicule */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Véhicule *</label>
                        <select
                            required
                            value={formData.vehicule_id}
                            onChange={e => setFormData({ ...formData, vehicule_id: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded"
                        >
                            <option value="">Sélectionner un véhicule</option>
                            {vehicules.filter(v => v.etat === 'disponible' || (prefill && v.id === Number(prefill.vehicule_id))).map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.marque} {v.modele} - {v.immatriculation} ({v.prix_journalier} MAD/jour)
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Agences */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Agence retrait *</label>
                            <select
                                required
                                value={formData.agence_retrait_id}
                                onChange={e => setFormData({ ...formData, agence_retrait_id: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded"
                            >
                                <option value="">Sélectionner une agence</option>
                                {agences.map(a => (
                                    <option key={a.id} value={a.id}>{a.nom} - {a.ville}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Agence retour *</label>
                            <select
                                required
                                value={formData.agence_retour_id}
                                onChange={e => setFormData({ ...formData, agence_retour_id: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded"
                            >
                                <option value="">Sélectionner une agence</option>
                                {agences.map(a => (
                                    <option key={a.id} value={a.id}>{a.nom} - {a.ville}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Date début *</label>
                            <input
                                type="date"
                                required
                                value={formData.date_debut}
                                onChange={e => setFormData({ ...formData, date_debut: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Date fin *</label>
                            <input
                                type="date"
                                required
                                value={formData.date_fin}
                                onChange={e => setFormData({ ...formData, date_fin: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded"
                            />
                        </div>
                    </div>
                    {/* Extras */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Extras (optionnels)</label>
                        <div className="flex flex-col space-y-2">
                            {extras.map(extra => (
                                <label key={extra.label} className="flex items-center text-slate-200">
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={!!formData.extras.find(e => e.label === extra.label)}
                                        onChange={() => toggleExtra(extra)}
                                    />
                                    {extra.label} (+{extra.price} MAD)
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Financial summary */}
                    <div className="bg-slate-700 p-3 rounded">
                        <p className="text-slate-200">Durée : {days} jour(s)</p>
                        <p className="text-slate-200">Total HT : {total.toFixed(2)} MAD</p>
                    </div>
                    {/* Acompte & Caution */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Acompte</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.acompte}
                                onChange={e => setFormData({ ...formData, acompte: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Caution</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.caution}
                                onChange={e => setFormData({ ...formData, caution: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded"
                            />
                        </div>
                    </div>
                    {/* CGV acceptance */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.terms_accepted}
                            onChange={e => setFormData({ ...formData, terms_accepted: e.target.checked })}
                            className="mr-2"
                        />
                        <span className="text-slate-200">J'accepte les conditions générales de vente</span>
                    </div>
                    {/* Actions */}
                    <div className="flex justify-end space-x-3 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-500">Enregistrer</button>
                    </div>
                </form>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        </div>
    );
};

export default ContractForm;
