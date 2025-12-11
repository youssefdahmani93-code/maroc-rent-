import { useState } from 'react';
import axios from 'axios';
import { X, Download, RefreshCw, CheckCircle, Calendar, MapPin, User, Car } from 'lucide-react';
import { generateContractPDF } from '../../utils/pdfGenerator';

const ViewContractModal = ({ contract, onClose, onUpdate }) => {
    const [converting, setConverting] = useState(false);

    const handleConvert = async () => {
        if (!window.confirm('Voulez-vous vraiment convertir ce devis en contrat ?')) return;

        setConverting(true);
        try {
            await axios.put(`/api/contracts/${contract.id}/convert`);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Erreur conversion:', error);
            alert('Erreur lors de la conversion');
        } finally {
            setConverting(false);
        }
    };

    const handleDownloadPDF = () => {
        generateContractPDF(contract, contract.type);
    };

    if (!contract) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 p-6 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-white">
                                {contract.type === 'devis' ? 'Devis' : 'Facture'} #{contract.numero}
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${contract.statut === 'signe' ? 'bg-green-500/20 text-green-400' :
                                contract.statut === 'devis' ? 'bg-slate-500/20 text-slate-400' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>
                                {contract.statut}
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">Créé le {new Date(contract.cree_le).toLocaleDateString()}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Client */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                                <User size={16} /> Client
                            </h3>
                            <p className="text-white font-medium">{contract.client?.nom}</p>
                            <p className="text-slate-400 text-sm">{contract.client?.email}</p>
                            <p className="text-slate-400 text-sm">{contract.client?.telephone}</p>
                        </div>

                        {/* Vehicle */}
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                                <Car size={16} /> Véhicule
                            </h3>
                            <p className="text-white font-medium">{contract.vehicule?.marque} {contract.vehicule?.modele}</p>
                            <p className="text-slate-400 text-sm">{contract.vehicule?.immatriculation}</p>
                            <p className="text-slate-400 text-sm capitalize">{contract.vehicule?.carburant} - {contract.vehicule?.boite}</p>
                        </div>
                    </div>

                    {/* Dates & Locations */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                            <Calendar size={16} /> Détails Location
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase mb-1">Départ</p>
                                <p className="text-white">{new Date(contract.date_debut).toLocaleString()}</p>
                                <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                                    <MapPin size={12} />
                                    {contract.lieu_remise}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase mb-1">Retour</p>
                                <p className="text-white">{new Date(contract.date_fin).toLocaleString()}</p>
                                <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                                    <MapPin size={12} />
                                    {contract.lieu_restitution}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="border-t border-slate-700 pt-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400">Prix Journalier ({contract.nombre_jours} jours)</span>
                            <span className="text-white font-medium">{contract.prix_journalier * contract.nombre_jours} DH</span>
                        </div>
                        {contract.frais_livraison > 0 && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-400">Frais Livraison</span>
                                <span className="text-white font-medium">{contract.frais_livraison} DH</span>
                            </div>
                        )}
                        {contract.reduction > 0 && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-emerald-400">Réduction</span>
                                <span className="text-emerald-400 font-medium">-{contract.reduction} DH</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700">
                            <span className="text-lg font-bold text-white">Total TTC</span>
                            <span className="text-2xl font-bold text-cyan-400">{contract.montant_total} DH</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-slate-400">Reste à payer</span>
                            <span className="text-xl font-bold text-emerald-400">{contract.reste_a_payer} DH</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-slate-900 p-6 border-t border-slate-700 flex justify-end gap-4">
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        <Download size={18} />
                        PDF
                    </button>

                    {contract.type === 'devis' && (
                        <button
                            onClick={handleConvert}
                            disabled={converting}
                            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                        >
                            {converting ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            Convertir en Facture
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewContractModal;
