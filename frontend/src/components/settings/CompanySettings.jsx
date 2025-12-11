import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Save, Building2, Upload, AlertCircle, Image as ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const CompanySettings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/settings`);
            setSettings(res.data || {});
        } catch (error) {
            console.error('Erreur chargement paramètres:', error);
            setMessage({ type: 'error', text: 'Impossible de charger les paramètres.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('logo', file);

        try {
            const res = await axios.post(`${API_URL}/settings/upload-logo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSettings(prev => ({ ...prev, company_logo: res.data.url }));
            setMessage({ type: 'success', text: 'Logo téléversé avec succès!' });
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || "Erreur lors du téléversement." });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const settingsToSave = Object.entries(settings).map(([key, value]) => ({ key, value }));
            await axios.post(`${API_URL}/settings/bulk`, settingsToSave);
            setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès !' });
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-12 text-center">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Building2 />Informations de l'Entreprise</h2>
                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50">
                        <Save size={18} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-lg border text-sm ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Company Info */}
                        <InputField label="Nom de l'Entreprise" name="company_name" value={settings.company_name} onChange={handleChange} required />
                        <InputField label="Slogan" name="company_tagline" value={settings.company_tagline} onChange={handleChange} />
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                            <textarea name="company_description" value={settings.company_description} onChange={handleChange} rows="3" className="w-full input-field" />
                        </div>
                        
                        {/* Logo Upload */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Logo de l'entreprise</label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-slate-900 rounded-md flex items-center justify-center border border-slate-700">
                                    {settings.company_logo ? <img src={settings.company_logo} alt="Logo" className="h-full w-full object-contain rounded-md" /> : <ImageIcon className="text-slate-500" />}
                                </div>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} style={{ display: 'none' }} />
                                <button type="button" onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
                                    <Upload size={18} /> Changer le logo
                                </button>
                            </div>
                        </div>

                        <hr className="md:col-span-2 border-slate-700" />

                        {/* Contact Info */}
                        <InputField label="Email de contact" name="company_email" type="email" value={settings.company_email} onChange={handleChange} required />
                        <InputField label="Téléphone" name="company_phone" value={settings.company_phone} onChange={handleChange} required />
                        <InputField label="Adresse" name="company_address" value={settings.company_address} onChange={handleChange} />
                        <InputField label="Site Web" name="company_website" type="url" value={settings.company_website} onChange={handleChange} />
                    </div>
                </div>
            </form>
        </div>
    );
};

const InputField = ({ label, name, value, onChange, type = "text", required = false }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{label}{required && ' *'}</label>
        <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
    </div>
);

export default CompanySettings;
