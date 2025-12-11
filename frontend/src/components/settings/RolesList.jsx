import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Shield, Check, X } from 'lucide-react';
import RoleModal from './RoleModal';

const RolesList = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await axios.get('/api/roles');
            setRoles(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement rôles:', error);
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await axios.get('/api/roles/permissions/list');
            setPermissions(res.data);
        } catch (error) {
            console.error('Erreur chargement permissions:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
            try {
                await axios.delete(`/api/roles/${id}`);
                fetchRoles();
            } catch (error) {
                console.error('Erreur suppression:', error);
                alert(error.response?.data?.message || 'Erreur lors de la suppression');
            }
        }
    };

    const openCreateModal = () => {
        setSelectedRole(null);
        setShowModal(true);
    };

    const openEditModal = (role) => {
        setSelectedRole(role);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex justify-between items-center bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Shield className="text-cyan-400" />
                    Rôles et Permissions
                </h2>
                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                >
                    <Plus size={20} />
                    <span>Nouveau Rôle</span>
                </button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <div key={role.id} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{role.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">{role.description}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => openEditModal(role)}
                                    className="p-2 hover:bg-cyan-500/10 rounded-lg text-cyan-400 transition-colors"
                                >
                                    <Edit size={18} />
                                </button>
                                {!role.is_system && (
                                    <button
                                        onClick={() => handleDelete(role.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Permissions</h4>
                            <div className="flex flex-wrap gap-2">
                                {role.permissions && role.permissions.length > 0 ? (
                                    role.permissions.slice(0, 5).map(perm => (
                                        <span key={perm.id} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300 border border-slate-600">
                                            {perm.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-500 italic">Aucune permission</span>
                                )}
                                {role.permissions && role.permissions.length > 5 && (
                                    <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-400 border border-slate-600">
                                        +{role.permissions.length - 5} autres
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                            <span className={`text-xs px-2 py-1 rounded-full border ${role.is_system ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                                {role.is_system ? 'Système' : 'Personnalisé'}
                            </span>
                            <span className="text-xs text-slate-500">
                                ID: {role.id}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <RoleModal
                    role={selectedRole}
                    allPermissions={permissions}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchRoles();
                    }}
                />
            )}
        </div>
    );
};

export default RolesList;
