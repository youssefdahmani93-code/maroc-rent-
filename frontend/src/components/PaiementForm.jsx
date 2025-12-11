import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function PaiementForm({ paiement, onClose, onSave }) {
    const [clients, setClients] = useState([]);
    const [contrats, setContrats] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        client_id: '',
        type_paiement: 'contrat',
        reference_id: '',
        montant_total: 0,
        montant_paye: 0,
        reste_a_payer: 0,
        methode_paiement: 'especes',
        reference_paiement: '',
        date_paiement: new Date().toISOString().split('T')[0],
        remise: 0,
        tva: 0,
        banque_nom: '',
        virement_reference: '',
        notes: ''
    });

    useEffect(() => {
        fetchClients();
        fetchContrats();

        if (paiement) {
            setFormData({
                ...paiement,
                date_paiement: paiement.date_paiement?.split('T')[0] || new Date().toISOString().split('T')[0]
            });
        }
    }, [paiement]);

    const fetchClients = async () => {
        try {
            const response = await axios.get(`${API_URL}/clients`);
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchContrats = async () => {
        try {
            const response = await axios.get(`${API_URL}/contracts`);
            setContrats(response.data);
        } catch (error) {
            console.error('Error fetching contrats:', error);
        }
    };

    // Calcul automatique
    useEffect(() => {
        const total = parseFloat(formData.montant_total) || 0;
        const paye = parseFloat(formData.montant_paye) || 0;
        const reste = total - paye;

        setFormData(prev => ({
            ...prev,
            reste_a_payer: reste
        }));
    }, [formData.montant_total, formData.montant_paye]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dataToSend = {
                ...formData,
                reference_id: formData.reference_id || null,
                client_id: parseInt(formData.client_id),
                montant_total: parseFloat(formData.montant_total),
                montant_paye: parseFloat(formData.montant_paye),
                remise: parseFloat(formData.remise || 0),
                tva: parseFloat(formData.tva || 0)
            };

            if (paiement?.id) {
                await axios.put(`${API_URL}/paiements/${paiement.id}`, dataToSend);
            } else {
                await axios.post(`${API_URL}/paiements`, dataToSend);
            }
            onSave();
        } catch (error) {
            console.error('Error saving paiement:', error);
            alert('Erreur: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-xl p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {paiement ? 'Modifier Paiement' : 'Nouveau Paiement'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Client */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Client *
                            </label>
                            <select
                                required
                                value={formData.client_id}
                                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Sélectionner un client</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.nom}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Type de Paiement *
                            </label>
                            <select
                                required
                                value={formData.type_paiement}
                                onChange={(e) => setFormData({ ...formData, type_paiement: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="contrat">Contrat</option>
                                <option value="reservation">Réservation</option>
                                <option value="facture">Facture</option>
                                <option value="amende">Amende</option>
                                <option value="service">Service</option>
                            </select>
                        </div>
                    </div>

                    {/* Référence */}
                    {formData.type_paiement === 'contrat' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Contrat
                            </label>
                            <select
                                value={formData.reference_id}
                                onChange={(e) => setFormData({ ...formData, reference_id: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Sélectionner un contrat</option>
                                {contrats.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.numero} - {c.client?.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Montants */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-slate-700 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Montant Total (DH) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.montant_total}
                                onChange={(e) => setFormData({ ...formData, montant_total: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Montant Payé (DH) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.montant_paye}
                                onChange={(e) => setFormData({ ...formData, montant_paye: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Reste à Payer (DH)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                readOnly
                                value={formData.reste_a_payer}
                                className="w-full px-4 py-2 bg-slate-600 text-gray-400 rounded-lg border border-slate-500"
                            />
                        </div>
                    </div>

                    {/* Méthode de paiement */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Méthode de Paiement *
                            </label>
                            <select
                                required
                                value={formData.methode_paiement}
                                onChange={(e) => setFormData({ ...formData, methode_paiement: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="especes">Espèces</option>
                                <option value="carte">Carte Bancaire</option>
                                <option value="virement">Virement</option>
                                <option value="tpe">TPE</option>
                                <option value="en_ligne">Paiement en ligne</option>
                                <option value="cheque">Chèque</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Date de Paiement *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.date_paiement}
                                onChange={(e) => setFormData({ ...formData, date_paiement: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Référence paiement */}
                    {(formData.methode_paiement === 'tpe' || formData.methode_paiement === 'virement') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Référence {formData.methode_paiement === 'tpe' ? 'TPE' : 'Virement'}
                            </label>
                            <input
                                type="text"
                                value={formData.reference_paiement}
                                onChange={(e) => setFormData({ ...formData, reference_paiement: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {/* Détails virement */}
                    {formData.methode_paiement === 'virement' && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nom de la Banque
                                </label>
                                <input
                                    type="text"
                                    value={formData.banque_nom}
                                    onChange={(e) => setFormData({ ...formData, banque_nom: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Référence Virement
                                </label>
                                <input
                                    type="text"
                                    value={formData.virement_reference}
                                    onChange={(e) => setFormData({ ...formData, virement_reference: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg border border-slate-500 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Notes
                        </label>
                        <textarea
                            rows="3"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Placeholder for PaiementDetails
function PaiementDetails({ paiement, onClose, onEdit }) {
    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto bg-slate-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Détails du Paiement</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="text-white">
                    <p>Paiement #{paiement?.id}</p>
                    <p>Client: {paiement?.client?.nom}</p>
                    <p>Montant: {paiement?.montant_paye} DH</p>
                    {/* Add more details here */}
                </div>
                <div className="mt-6">
                    <button
                        onClick={onEdit}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Modifier
                    </button>
                </div>
            </div>
        </div>
    );
}
