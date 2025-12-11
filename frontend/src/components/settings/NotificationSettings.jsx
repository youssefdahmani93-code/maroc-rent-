import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Mail, MessageSquare, Save, AlertCircle, CheckCircle, Phone } from 'lucide-react';
import Toast from '../components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const NotificationSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [settings, setSettings] = useState({
        // Email notifications
        email_enabled: true,
        email_new_reservation: true,
        email_reservation_confirmed: true,
        email_payment_received: true,
        email_contract_expiring: true,
        email_maintenance_due: true,

        // SMS notifications
        sms_enabled: false,
        sms_provider: 'twilio', // twilio, vonage, etc.
        sms_api_key: '',
        sms_api_secret: '',
        sms_sender_id: '',
        sms_new_reservation: true,
        sms_reservation_confirmed: true,
        sms_payment_reminder: true,
        sms_contract_expiring: true,

        // WhatsApp notifications
        whatsapp_enabled: false,
        whatsapp_provider: 'twilio', // twilio, whatsapp-business-api
        whatsapp_api_key: '',
        whatsapp_api_secret: '',
        whatsapp_phone_number: '',
        whatsapp_new_reservation: true,
        whatsapp_reservation_confirmed: true,
        whatsapp_payment_reminder: true,
        whatsapp_contract_expiring: true,

        // Notification timing
        payment_reminder_days: 3,
        contract_expiry_days: 7,
        maintenance_reminder_days: 7
    });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_URL}/settings/notifications`);
            if (res.data) {
                setSettings(prev => ({ ...prev, ...res.data }));
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading settings:', error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(`${API_URL}/settings/notifications`, settings);
            showToast('Paramètres de notifications enregistrés avec succès');
        } catch (error) {
            console.error('Error saving settings:', error);
            showToast('Erreur lors de l\'enregistrement', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleTestNotification = async (type) => {
        try {
            await axios.post(`${API_URL}/notifications/test`, { type });
            showToast(`Test ${type} envoyé avec succès`);
        } catch (error) {
            console.error('Error sending test:', error);
            showToast(`Erreur lors de l'envoi du test ${type}`, 'error');
        }
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
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Paramètres de Notifications</h1>
                    <p className="text-slate-400">Configurez les notifications par email, SMS et WhatsApp</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>

            {/* Email Notifications */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Mail className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Notifications Email</h2>
                        <p className="text-sm text-slate-400">Envoi automatique d'emails aux clients</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900/70 transition-colors">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-400" size={20} />
                            <span className="text-white font-medium">Activer les notifications email</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.email_enabled}
                            onChange={(e) => setSettings({ ...settings, email_enabled: e.target.checked })}
                            className="w-5 h-5 text-cyan-500 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                        />
                    </label>

                    {settings.email_enabled && (
                        <div className="ml-8 space-y-3 border-l-2 border-slate-700 pl-4">
                            <label className="flex items-center justify-between">
                                <span className="text-slate-300">Nouvelle réservation</span>
                                <input
                                    type="checkbox"
                                    checked={settings.email_new_reservation}
                                    onChange={(e) => setSettings({ ...settings, email_new_reservation: e.target.checked })}
                                    className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded"
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-slate-300">Réservation confirmée</span>
                                <input
                                    type="checkbox"
                                    checked={settings.email_reservation_confirmed}
                                    onChange={(e) => setSettings({ ...settings, email_reservation_confirmed: e.target.checked })}
                                    className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded"
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-slate-300">Paiement reçu</span>
                                <input
                                    type="checkbox"
                                    checked={settings.email_payment_received}
                                    onChange={(e) => setSettings({ ...settings, email_payment_received: e.target.checked })}
                                    className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded"
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span className="text-slate-300">Contrat expirant bientôt</span>
                                <input
                                    type="checkbox"
                                    checked={settings.email_contract_expiring}
                                    onChange={(e) => setSettings({ ...settings, email_contract_expiring: e.target.checked })}
                                    className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded"
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* SMS Notifications */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                        <Phone className="text-green-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Notifications SMS</h2>
                        <p className="text-sm text-slate-400">Envoi de SMS via Twilio ou autre fournisseur</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900/70 transition-colors">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-400" size={20} />
                            <span className="text-white font-medium">Activer les notifications SMS</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.sms_enabled}
                            onChange={(e) => setSettings({ ...settings, sms_enabled: e.target.checked })}
                            className="w-5 h-5 text-cyan-500 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                        />
                    </label>

                    {settings.sms_enabled && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Fournisseur SMS</label>
                                    <select
                                        value={settings.sms_provider}
                                        onChange={(e) => setSettings({ ...settings, sms_provider: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="twilio">Twilio</option>
                                        <option value="vonage">Vonage (Nexmo)</option>
                                        <option value="messagebird">MessageBird</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">ID Expéditeur</label>
                                    <input
                                        type="text"
                                        value={settings.sms_sender_id}
                                        onChange={(e) => setSettings({ ...settings, sms_sender_id: e.target.value })}
                                        placeholder="GoRent"
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Clé API</label>
                                    <input
                                        type="password"
                                        value={settings.sms_api_key}
                                        onChange={(e) => setSettings({ ...settings, sms_api_key: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Secret API</label>
                                    <input
                                        type="password"
                                        value={settings.sms_api_secret}
                                        onChange={(e) => setSettings({ ...settings, sms_api_secret: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>

                            <div className="ml-8 space-y-3 border-l-2 border-slate-700 pl-4">
                                <label className="flex items-center justify-between">
                                    <span className="text-slate-300">Nouvelle réservation</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.sms_new_reservation}
                                        onChange={(e) => setSettings({ ...settings, sms_new_reservation: e.target.checked })}
                                        className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded"
                                    />
                                </label>
                                <label className="flex items-center justify-between">
                                    <span className="text-slate-300">Réservation confirmée</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.sms_reservation_confirmed}
                                        onChange={(e) => setSettings({ ...settings, sms_reservation_confirmed: e.target.checked })}
                                        className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded"
                                    />
                                </label>
                                <label className="flex items-center justify-between">
                                    <span className="text-slate-300">Rappel de paiement</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.sms_payment_reminder}
                                        onChange={(e) => setSettings({ ...settings, sms_payment_reminder: e.target.checked })}
                                        className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded"
                                    />
                                </label>
                            </div>

                            <button
                                onClick={() => handleTestNotification('sms')}
                                className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Envoyer un SMS de test
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* WhatsApp Notifications */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-emerald-500/20 rounded-lg">
                        <MessageSquare className="text-emerald-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Notifications WhatsApp</h2>
                        <p className="text-sm text-slate-400">Envoi de messages via WhatsApp Business API</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900/70 transition-colors">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-400" size={20} />
                            <span className="text-white font-medium">Activer les notifications WhatsApp</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.whatsapp_enabled}
                            onChange={(e) => setSettings({ ...settings, whatsapp_enabled: e.target.checked })}
                            className="w-5 h-5 text-cyan-500 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                        />
                    </label>

                    {settings.whatsapp_enabled && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Fournisseur WhatsApp</label>
                                    <select
                                        value={settings.whatsapp_provider}
                                        onChange={(e) => setSettings({ ...settings, whatsapp_provider: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="twilio">Twilio WhatsApp</option>
                                        <option value="whatsapp-business">WhatsApp Business API</option>
                                        <option value="messagebird">MessageBird</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Numéro WhatsApp</label>
                                    <input
                                        type="text"
                                        value={settings.whatsapp_phone_number}
                                        onChange={(e) => setSettings({ ...settings, whatsapp_phone_number: e.target.value })}
                                        placeholder="+212XXXXXXXXX"
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Clé API</label>
                                    <input
                                        type="password"
                                        value={settings.whatsapp_api_key}
                                        onChange={(e) => setSettings({ ...settings, whatsapp_api_key: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Secret API</label>
                                    <input
                                        type="password"
                                        value={settings.whatsapp_api_secret}
                                        onChange={(e) => setSettings({ ...settings, whatsapp_api_secret: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>

                            <div className="ml-8 space-y-3 border-l-2 border-slate-700 pl-4">
                                <label className="flex items-center justify-between">
                                    <span className="text-slate-300">Nouvelle réservation</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.whatsapp_new_reservation}
                                        onChange={(e) => setSettings({ ...settings, whatsapp_new_reservation: e.target.checked })}
                                        className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded"
                                    />
                                </label>
                                <label className="flex items-center justify-between">
                                    <span className="text-slate-300">Réservation confirmée</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.whatsapp_reservation_confirmed}
                                        onChange={(e) => setSettings({ ...settings, whatsapp_reservation_confirmed: e.target.checked })}
                                        className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded"
                                    />
                                </label>
                                <label className="flex items-center justify-between">
                                    <span className="text-slate-300">Rappel de paiement</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.whatsapp_payment_reminder}
                                        onChange={(e) => setSettings({ ...settings, whatsapp_payment_reminder: e.target.checked })}
                                        className="w-4 h-4 text-cyan-500 bg-slate-900 border-slate-700 rounded"
                                    />
                                </label>
                            </div>

                            <button
                                onClick={() => handleTestNotification('whatsapp')}
                                className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Envoyer un message WhatsApp de test
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Timing Settings */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Bell className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Délais de Notification</h2>
                        <p className="text-sm text-slate-400">Configurez quand envoyer les rappels automatiques</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Rappel de paiement (jours avant échéance)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={settings.payment_reminder_days}
                            onChange={(e) => setSettings({ ...settings, payment_reminder_days: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Alerte expiration contrat (jours avant)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={settings.contract_expiry_days}
                            onChange={(e) => setSettings({ ...settings, contract_expiry_days: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Rappel maintenance (jours avant)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={settings.maintenance_reminder_days}
                            onChange={(e) => setSettings({ ...settings, maintenance_reminder_days: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex gap-3">
                    <AlertCircle className="text-blue-400 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="text-white font-semibold mb-1">Configuration des fournisseurs</h3>
                        <p className="text-sm text-slate-300">
                            Pour utiliser SMS et WhatsApp, vous devez créer un compte chez un fournisseur (Twilio, Vonage, etc.)
                            et obtenir vos clés API. Les notifications seront envoyées automatiquement selon les événements configurés.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
