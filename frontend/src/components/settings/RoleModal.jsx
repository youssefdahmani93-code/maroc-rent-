import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Check } from 'lucide-react';

const RoleModal = ({ role, allPermissions, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [] // Now stores permission *names*
    });
    const [error, setError] = useState('');

    const allPermissionsFlat = Object.values(allPermissions).flat();

    useEffect(() => {
        if (role) {
            setFormData({
                name: role.name,
                description: role.description || '',
                permissions: role.permissions ? role.permissions.map(p => p.name) : []
            });
        }
    }, [role]);

    const handlePermissionToggle = (permName) => {
        setFormData(prev => {
            const newPermissions = prev.permissions.includes(permName)
                ? prev.permissions.filter(name => name !== permName)
                : [...prev.permissions, permName];
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleCategoryToggle = (categoryPermissions) => {
        const categoryPermNames = categoryPermissions.map(p => p.name);
        const allSelected = categoryPermNames.every(name => formData.permissions.includes(name));

        setFormData(prev => {
            let newPermissions = [...prev.permissions];
            if (allSelected) {
                // Unselect all in this category
                newPermissions = newPermissions.filter(name => !categoryPermNames.includes(name));
            } else {
                // Select all in this category
                const namesToAdd = categoryPermNames.filter(name => !newPermissions.includes(name));
                newPermissions = [...newPermissions, ...namesToAdd];
            }
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const payload = { ...formData };
            if (role) {
                await axios.put(`/api/roles/${role.id}`, payload);
            } else {
                await axios.post('/api/roles', payload);
            }
            onSuccess();
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.response?.data?.message || 'Une erreur est survenue');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">
                        {role ? 'Modifier le rôle' : 'Nouveau rôle'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 space-y-6 overflow-y-auto flex-1">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Nom du rôle *</label>
                                <input
                                    type="text"
                                    required
                                    disabled={role?.is_system}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                {role?.is_system && <p className="text-xs text-slate-500 mt-1">Le nom des rôles système ne peut pas être modifié.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Permissions</h3>
                            <div className="space-y-6">
                                {Object.entries(allPermissions).map(([category, perms]) => (
                                    <div key={category} className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/50">
                                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-700/50">
                                            <h4 className="text-cyan-400 font-medium uppercase text-sm tracking-wider">{category}</h4>
                                            <button
                                                type="button"
                                                onClick={() => handleCategoryToggle(perms)}
                                                className="text-xs text-slate-400 hover:text-white underline"
                                            >
                                                Tout sélectionner
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {perms.map(perm => (
                                                <label key={perm.id} className="flex items-start space-x-3 cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.permissions.includes(perm.name)}
                                                            onChange={() => handlePermissionToggle(perm.name)}
                                                            className="peer h-5 w-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-0 transition-all"
                                                        />
                                                        <div className="absolute inset-0 hidden peer-checked:block pointer-events-none text-cyan-500">
                                                            <Check size={14} className="ml-0.5 mt-0.5" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm text-slate-300 group-hover:text-white transition-colors">{perm.name}</span>
                                                        {perm.description && (
                                                            <span className="block text-xs text-slate-500">{perm.description}</span>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-700 flex justify-end space-x-3 bg-slate-800 flex-shrink-0">
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
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoleModal;
