import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import UserModal from './UserModal';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ search: '', role_id: '', status: '' });
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            const params = {};
            if (filter.search) params.search = filter.search;
            if (filter.role_id) params.role_id = filter.role_id;
            if (filter.status) params.status = filter.status;

            const res = await axios.get('/api/users', { params });
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await axios.get('/api/roles');
            setRoles(res.data);
        } catch (error) {
            console.error('Erreur chargement rôles:', error);
        }
    };

    const handleStatusToggle = async (user) => {
        try {
            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            await axios.patch(`/api/users/${user.id}/status`, { status: newStatus });
            fetchUsers();
        } catch (error) {
            console.error('Erreur changement statut:', error);
            alert('Erreur lors du changement de statut');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await axios.delete(`/api/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error('Erreur suppression:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const openCreateModal = () => {
        setSelectedUser(null);
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <select
                        value={filter.role_id}
                        onChange={(e) => setFilter({ ...filter, role_id: e.target.value })}
                        className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="">Tous les rôles</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                    </select>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center justify-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                >
                    <Plus size={20} />
                    <span>Ajouter</span>
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50 border-b border-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Utilisateur</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Agence</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-900/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-white">{user.name}</div>
                                                <div className="text-sm text-slate-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Shield size={16} className="text-cyan-400" />
                                            <span className="text-white text-sm">{user.user_role?.name || 'Aucun rôle'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-slate-300 text-sm">{user.agence?.nom || 'Toutes'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleStatusToggle(user)}
                                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${user.status === 'active'
                                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                                }`}
                                        >
                                            {user.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            <span>{user.status === 'active' ? 'Actif' : 'Inactif'}</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className="p-2 hover:bg-cyan-500/10 rounded-lg text-cyan-400 transition-colors"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-slate-400">Aucun utilisateur trouvé</p>
                    </div>
                )}
            </div>

            {showModal && (
                <UserModal
                    user={selectedUser}
                    roles={roles}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
};

export default UsersList;
