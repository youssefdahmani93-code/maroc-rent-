import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Layout, Type, Image as ImageIcon, Eye } from 'lucide-react';
import { templates } from '../../components/public/LandingPageTemplates';

const LandingPageBuilder = () => {
    const [config, setConfig] = useState({
        template: 'modern',
        heroTitle: '',
        heroSubtitle: '',
        heroDescription: '',
        ctaText: '',
        heroImage: '/range-rover-hero.png'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await axios.get('/api/agency/landing-config');
            if (res.data) {
                setConfig(prev => ({ ...prev, ...res.data }));
            }
        } catch (error) {
            console.log('Using default config');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post('/api/agency/landing-config', config);
            alert('Configuration sauvegardée avec succès !');
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // In a real app, upload to server. Here we use local object URL for preview
            const url = URL.createObjectURL(file);
            setConfig({ ...config, heroImage: url });
            // Note: You'd need to implement actual file upload to backend for persistence
        }
    };

    const SelectedTemplate = templates[config.template];

    if (loading) return <div className="p-8 text-center text-white">Chargement...</div>;

    if (previewMode) {
        return (
            <div className="fixed inset-0 z-50 bg-white overflow-auto">
                <div className="fixed top-4 right-4 z-50">
                    <button
                        onClick={() => setPreviewMode(false)}
                        className="px-6 py-3 bg-slate-900 text-white rounded-full shadow-lg font-bold"
                    >
                        Fermer l'aperçu
                    </button>
                </div>
                <SelectedTemplate config={config} vehicles={[]} />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Constructeur de Page d'Accueil</h1>
                    <p className="text-slate-400">Personnalisez l'apparence de votre site vitrine</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setPreviewMode(true)}
                        className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                    >
                        <Eye className="mr-2 h-4 w-4" /> Aperçu
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Settings Panel */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Template Selection */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <Layout className="mr-2 h-5 w-5 text-cyan-400" /> Modèle
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.keys(templates).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setConfig({ ...config, template: t })}
                                    className={`p-3 rounded-lg border text-sm capitalize transition-all ${config.template === t
                                            ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                                            : 'border-slate-600 text-slate-400 hover:border-slate-500'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Editing */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <Type className="mr-2 h-5 w-5 text-cyan-400" /> Contenu
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Titre Principal</label>
                                <input
                                    type="text"
                                    value={config.heroTitle}
                                    onChange={e => setConfig({ ...config, heroTitle: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                                    placeholder="Ex: Louez votre voiture"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Sous-titre (si applicable)</label>
                                <input
                                    type="text"
                                    value={config.heroSubtitle}
                                    onChange={e => setConfig({ ...config, heroSubtitle: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                                    placeholder="Ex: en toute simplicité"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                <textarea
                                    value={config.heroDescription}
                                    onChange={e => setConfig({ ...config, heroDescription: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none h-24"
                                    placeholder="Description courte..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Texte Bouton Action</label>
                                <input
                                    type="text"
                                    value={config.ctaText}
                                    onChange={e => setConfig({ ...config, ctaText: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-500 outline-none"
                                    placeholder="Ex: Voir les véhicules"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Settings */}
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                            <ImageIcon className="mr-2 h-5 w-5 text-cyan-400" /> Image Hero
                        </h3>
                        <div className="space-y-4">
                            <div className="relative h-40 bg-slate-900 rounded-lg overflow-hidden border border-slate-600">
                                <img src={config.heroImage} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-slate-400
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-cyan-500 file:text-white
                                    hover:file:bg-cyan-600
                                "
                            />
                            <p className="text-xs text-slate-500">Recommandé: 1920x1080px, Max 5MB</p>
                        </div>
                    </div>
                </div>

                {/* Live Preview Panel (Scaled Down) */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden h-[800px] flex flex-col">
                        <div className="bg-slate-900 p-3 border-b border-slate-700 flex justify-between items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Aperçu en direct</span>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-white relative">
                            <div className="origin-top transform scale-75 h-[133%] w-[133%] -ml-[16.5%] -mt-[10%]">
                                <SelectedTemplate config={config} vehicles={[]} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPageBuilder;
