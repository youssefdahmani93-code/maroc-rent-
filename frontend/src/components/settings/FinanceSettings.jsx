import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, CreditCard, DollarSign, Percent, AlertCircle } from 'lucide-react';

const FinanceSettings = () => {
    const [settings, setSettings] = useState({
        tva: '20',
        currency: 'MAD',
        currency_symbol: 'DH',
        deposit_percentage: '30',
        caution_fixe: '5000',
        tax_registration: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/api/settings/list?category=finance');
            const fetchedSettings = {};
            res.data.forEach(s => {
                fetchedSettings[s.key] = s.value;
            });

            // Merge with defaults
            setSettings(prev => ({ ...prev, ...fetchedSettings }));
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement paramètres:', error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const settingsToSave = Object.entries(settings).map(([key, value]) => ({
                key,
                value,
                category: 'finance',
                type: key === 'tva' || key === 'deposit_percentage' || key === 'caution_fixe' ? 'number' : 'string'
            }));

            await axios.post('/api/settings/bulk', settingsToSave);

            setMessage({ type: 'success', text: 'Paramètres financiers enregistrés avec succès' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-slate-400">Chargement des paramètres...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-xl text-emerald-400">
                    <CreditCard size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Paramètres Financiers</h2>
                    <p className="text-slate-400 text-sm">Configuration de la facturation et des devises</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {message.text && (
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}>
                        {message.type === 'error' && <AlertCircle size={18} />}
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tax Settings */}
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Percent size={18} className="text-cyan-400" />
                            Taxes et TVA
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Taux de TVA (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="tva"
                                        value={settings.tva}
                                        onChange={handleChange}
                                        className="w-full pl-4 pr-8 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Appliqué sur toutes les factures</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Identifiant Fiscal</label>
                                <input
                                    type="text"
                                    name="tax_registration"
                                    value={settings.tax_registration}
                                    onChange={handleChange}
                                    placeholder="Ex: 12345678"
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Currency Settings */}
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <DollarSign size={18} className="text-cyan-400" />
                            Devise
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Code Devise</label>
                                <input
                                    type="text"
                                    name="currency"
                                    value={settings.currency}
                                    onChange={handleChange}
                                    placeholder="MAD, EUR, USD..."
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Symbole</label>
                                <input
                                    type="text"
                                    name="currency_symbol"
                                    value={settings.currency_symbol}
                                    onChange={handleChange}
                                    placeholder="DH, €, $..."
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Settings */}
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 md:col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CreditCard size={18} className="text-cyan-400" />
                            Paiements
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Caution Fixe (DH)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="caution_fixe"
                                        value={settings.caution_fixe}
                                        onChange={handleChange}
                                        className="w-full pl-4 pr-8 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">DH</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Montant de la caution par défaut</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Acompte par défaut (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="deposit_percentage"
                                        value={settings.deposit_percentage}
                                        onChange={handleChange}
                                        className="w-full pl-4 pr-8 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Montant minimum requis à la réservation</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FinanceSettings;
