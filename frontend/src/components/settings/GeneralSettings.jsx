import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Wrench, MapPin, Database, AlertCircle } from 'lucide-react';

const GeneralSettings = ({ category }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Configuration definitions for each category
    const configs = {
        maintenance: {
            title: 'Maintenance',
            icon: <Wrench size={24} />,
            description: 'Intervalles de maintenance par défaut',
            fields: [
                { key: 'oil_change_interval', label: 'Vidange (km)', type: 'number', default: '10000', description: 'Intervalle par défaut pour les vidanges' },
                { key: 'technical_visit_interval', label: 'Visite Technique (mois)', type: 'number', default: '12', description: 'Fréquence des visites techniques' },
                { key: 'tires_change_interval', label: 'Changement Pneus (km)', type: 'number', default: '50000', description: 'Estimation de durée de vie des pneus' },
                { key: 'insurance_alert_days', label: 'Alerte Assurance (jours)', type: 'number', default: '15', description: 'Jours avant expiration pour l\'alerte' }
            ]
        },
        gps: {
            title: 'GPS & Tracking',
            icon: <MapPin size={24} />,
            description: 'Configuration du service de géolocalisation',
            fields: [
                { key: 'gps_provider', label: 'Fournisseur', type: 'select', options: ['Traccar', 'GpsGate', 'Wialon'], default: 'Traccar' },
                { key: 'gps_api_url', label: 'URL de l\'API', type: 'text', default: 'http://demo.traccar.org/api' },
                { key: 'gps_api_key', label: 'Clé API / Token', type: 'password', default: '' },
                { key: 'gps_refresh_rate', label: 'Taux de rafraîchissement (sec)', type: 'number', default: '30' }
            ]
        },
        system: {
            title: 'Système',
            icon: <Database size={24} />,
            description: 'Préférences générales de l\'application',
            fields: [
                { key: 'app_language', label: 'Langue par défaut', type: 'select', options: ['Français', 'Arabe', 'Anglais'], default: 'Français' },
                { key: 'date_format', label: 'Format de date', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], default: 'DD/MM/YYYY' },
                { key: 'items_per_page', label: 'Éléments par page', type: 'number', default: '10' },
                { key: 'working_hours', label: 'Horaires de travail', type: 'text', default: '09:00 - 18:00', description: 'Ex: 09:00 - 18:00' },
                { key: 'enable_notifications', label: 'Activer les notifications', type: 'boolean', default: 'true' }
            ]
        }
    };

    const currentConfig = configs[category] || configs.system;

    useEffect(() => {
        fetchSettings();
    }, [category]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/settings/list?category=${category}`);
            const fetchedSettings = {};
            res.data.forEach(s => {
                fetchedSettings[s.key] = s.value;
            });

            // Initialize with defaults if not found
            const initializedSettings = {};
            currentConfig.fields.forEach(field => {
                initializedSettings[field.key] = fetchedSettings[field.key] !== undefined
                    ? fetchedSettings[field.key]
                    : field.default;
            });

            setSettings(initializedSettings);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement paramètres:', error);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? String(checked) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const settingsToSave = Object.entries(settings).map(([key, value]) => {
                const fieldConfig = currentConfig.fields.find(f => f.key === key);
                return {
                    key,
                    value,
                    category,
                    type: fieldConfig?.type === 'number' ? 'number' : fieldConfig?.type === 'boolean' ? 'boolean' : 'string'
                };
            });

            await axios.post('/api/settings/bulk', settingsToSave);

            setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-slate-400">Chargement...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl text-cyan-400 border border-slate-600">
                    {currentConfig.icon}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">{currentConfig.title}</h2>
                    <p className="text-slate-400 text-sm">{currentConfig.description}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 space-y-6">
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
                    {currentConfig.fields.map((field) => (
                        <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {field.label}
                            </label>

                            {field.type === 'select' ? (
                                <select
                                    name={field.key}
                                    value={settings[field.key]}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    {field.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            ) : field.type === 'boolean' ? (
                                <div className="flex items-center space-x-3">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name={field.key}
                                            checked={settings[field.key] === 'true'}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                    </label>
                                    <span className="text-sm text-slate-400">{settings[field.key] === 'true' ? 'Activé' : 'Désactivé'}</span>
                                </div>
                            ) : (
                                <input
                                    type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                                    name={field.key}
                                    value={settings[field.key]}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            )}

                            {field.description && (
                                <p className="text-xs text-slate-500 mt-1">{field.description}</p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-700/50">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GeneralSettings;
