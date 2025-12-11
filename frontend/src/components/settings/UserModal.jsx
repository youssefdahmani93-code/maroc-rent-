import { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const UserModal = ({ user, roles, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role_id: '',
        agence_id: '',
        status: 'active'
    });
    const [agences, setAgences] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAgences();
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                password: '', // Don't populate password
                confirmPassword: '',
                role_id: user.role_id || '',
                agence_id: user.agence_id || '',
                status: user.status || 'active'
            });
        }
    }, [user]);

    const fetchAgences = async () => {
        try {
            const res = await axios.get('/api/agences');
            setAgences(res.data);
        } catch (error) {
            console.error('Erreur chargement agences:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!user && !formData.password) {
            setError('Le mot de passe est requis pour un nouvel utilisateur');
            return;
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            const payload = { ...formData };
            if (!payload.password) delete payload.password;
            delete payload.confirmPassword;

            if (user) {
                await axios.put(`/api/users/${user.id}`, payload);
            } else {
                await axios.post('/api/users', payload);
            }
            onSuccess();
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.response?.data?.message || 'Une erreur est survenue');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">
                        {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-white mb-4">Informations de base</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Nom complet *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Téléphone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Statut</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Rôle et Accès</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Rôle *</label>
                            <select
                                required
                                value={formData.role_id}
                                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="">Sélectionner un rôle</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Agence (Optionnel)</label>
                            <select
                                value={formData.agence_id}
                                onChange={(e) => setFormData({ ...formData, agence_id: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="">Toutes les agences</option>
                                {agences.map(agence => (
                                    <option key={agence.id} value={agence.id}>{agence.nom}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Sécurité</h3>
                            <p className="text-sm text-slate-400 mb-4">Laissez vide pour ne pas modifier le mot de passe</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe {user ? '(Optionnel)' : '*'}</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                        >
                            {user ? 'Mettre à jour' : 'Créer l\'utilisateur'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
