import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = '/api';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
    const [filters, setFilters] = useState({
        etat: '',
        categorie: '',
        marque: '',
        modele: '',
        annee: '',
        agence_id: '',
        carburant: '',
        boite: '',
        search: ''
    });
    const [sorting, setSorting] = useState({ sortBy: 'cree_le', order: 'DESC' });
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        marque: '',
        modele: '',
        annee: '',
        immatriculation: '',
        vin: '',
        km: '0',
        carburant: '',
        boite: '',
        prix_journalier: '',
        categorie: '',
        etat: 'disponible',
        agence_id: ''
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    const [agences, setAgences] = useState([]);

    useEffect(() => {
        fetchAgences();
    }, []);

    useEffect(() => {
        fetchVehicles();
    }, [filters, sorting, pagination.page, pagination.limit]);

    const fetchAgences = async () => {
        try {
            const res = await axios.get(`${API_URL}/agences`);
            setAgences(res.data);
        } catch (error) {
            console.error('Erreur lors du chargement des agences:', error);
        }
    };

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                ...sorting,
                page: pagination.page,
                limit: pagination.limit
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const res = await axios.get(`${API_URL}/vehicules`, { params });
            setVehicles(res.data.vehicules || []);
            setPagination(res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 });
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des véhicules:', error);
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        setSorting(prev => ({
            sortBy: field,
            order: prev.sortBy === field && prev.order === 'ASC' ? 'DESC' : 'ASC'
        }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
    };

    const resetFilters = () => {
        setFilters({
            etat: '',
            categorie: '',
            marque: '',
            modele: '',
            annee: '',
            agence_id: '',
            carburant: '',
            boite: '',
            search: ''
        });
    };

    const resetForm = () => {
        setFormData({
            marque: '',
            modele: '',
            annee: '',
            immatriculation: '',
            vin: '',
            km: '0',
            carburant: '',
            boite: '',
            prix_journalier: '',
            categorie: '',
            etat: 'disponible',
            agence_id: ''
        });
        setSelectedImages([]);
        setImagePreviewUrls([]);
    };

    const openCreateModal = () => {
        resetForm();
        setIsEditMode(false);
        setShowModal(true);
    };

    const openEditModal = (vehicle) => {
        setFormData({
            marque: vehicle.marque,
            modele: vehicle.modele,
            annee: vehicle.annee.toString(),
            immatriculation: vehicle.immatriculation,
            vin: vehicle.vin || '',
            km: vehicle.km.toString(),
            carburant: vehicle.carburant,
            boite: vehicle.boite,
            prix_journalier: vehicle.prix_jour.toString(),
            categorie: vehicle.categorie,
            etat: vehicle.etat,
            agence_id: vehicle.agence_id.toString()
        });
        setSelectedVehicle(vehicle);
        setIsEditMode(true);
        setShowModal(true);
        // Load existing images as preview URLs
        if (vehicle.images && vehicle.images.length > 0) {
            setImagePreviewUrls(vehicle.images);
        }
    };

    const openViewModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowViewModal(true);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Validate number of images
        if (files.length > 5) {
            alert('Vous ne pouvez télécharger que 5 images maximum');
            return;
        }

        // Validate file sizes (max 5MB each)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const invalidFiles = files.filter(file => file.size > maxSize);
        if (invalidFiles.length > 0) {
            alert('Chaque image ne doit pas dépasser 5MB');
            return;
        }

        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const invalidTypes = files.filter(file => !validTypes.includes(file.type));
        if (invalidTypes.length > 0) {
            alert('Seuls les fichiers JPG, PNG et WebP sont acceptés');
            return;
        }

        setSelectedImages(files);

        // Generate preview URLs
        const urls = files.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(urls);
    };

    const removeImage = (index) => {
        const newImages = selectedImages.filter((_, i) => i !== index);
        const newUrls = imagePreviewUrls.filter((_, i) => i !== index);
        setSelectedImages(newImages);
        setImagePreviewUrls(newUrls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create FormData for multipart/form-data submission
            const formDataToSend = new FormData();

            // Append all form fields
            formDataToSend.append('marque', formData.marque);
            formDataToSend.append('modele', formData.modele);
            formDataToSend.append('annee', parseInt(formData.annee));
            formDataToSend.append('immatriculation', formData.immatriculation);
            formDataToSend.append('vin', formData.vin || '');
            formDataToSend.append('km', parseInt(formData.km));
            formDataToSend.append('carburant', formData.carburant);
            formDataToSend.append('boite', formData.boite);
            formDataToSend.append('prix_jour', formData.prix_journalier);
            formDataToSend.append('categorie', formData.categorie);
            formDataToSend.append('etat', formData.etat);
            formDataToSend.append('agence_id', parseInt(formData.agence_id));

            // Append images if any
            if (selectedImages.length > 0) {
                selectedImages.forEach((image) => {
                    formDataToSend.append('images', image);
                });
            }

            if (isEditMode) {
                await axios.put(`${API_URL}/vehicules/${selectedVehicle.id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert('Véhicule modifié avec succès!');
            } else {
                await axios.post(`${API_URL}/vehicules`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                // Reset to page 1 to see the newly created vehicle
                setPagination(prev => ({ ...prev, page: 1 }));
                alert('Véhicule créé avec succès!');
            }

            setShowModal(false);
            resetForm();
            setIsEditMode(false);
            // Wait a bit for state to update, then fetch
            setTimeout(() => fetchVehicles(), 100);
        } catch (error) {
            console.error('Erreur lors de la création/modification du véhicule:', error);
            let errorMessage = isEditMode ? 'Erreur lors de la modification' : 'Erreur lors de la création';

            if (error.response?.data?.errors) {
                errorMessage = 'Erreurs de validation:\n' +
                    error.response.data.errors.map(e => `- ${e.field}: ${e.message}`).join('\n');
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            alert(errorMessage);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule?')) return;

        try {
            await axios.delete(`${API_URL}/vehicules/${id}`);
            fetchVehicles();
            alert('Véhicule supprimé avec succès!');
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert(error.response?.data?.message || 'Erreur lors de la suppression');
        }
    };

    const getEtatBadge = (etat) => {
        const badges = {
            disponible: 'bg-green-500/20 text-green-400 border-green-500/30',
            reserve: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            en_maintenance: 'bg-red-500/20 text-red-400 border-red-500/30',
            hors_service: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
        return badges[etat] || badges.disponible;
    };

    const getEtatLabel = (etat) => {
        const labels = {
            disponible: 'Disponible',
            reserve: 'Réservé',
            en_maintenance: 'En maintenance',
            hors_service: 'Hors service'
        };
        return labels[etat] || etat;
    };

    const SortIcon = ({ field }) => {
        if (sorting.sortBy !== field) return <span className="text-slate-600">⇅</span>;
        return sorting.order === 'ASC' ? <span className="text-cyan-400">↑</span> : <span className="text-cyan-400">↓</span>;
    };

    if (loading && vehicles.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Véhicules</h1>
                    <p className="text-slate-400">Gestion de la flotte de véhicules ({pagination.total} véhicules)</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-200"
                >
                    + Ajouter un véhicule
                </button>
            </div>

            {/* Filters Panel */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Recherche</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Immatriculation, marque, modèle..."
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* État */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">État</label>
                        <select
                            value={filters.etat}
                            onChange={(e) => handleFilterChange('etat', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">Tous</option>
                            <option value="disponible">Disponible</option>
                            <option value="reserve">Réservé</option>
                            <option value="en_maintenance">En maintenance</option>
                            <option value="hors_service">Hors service</option>
                        </select>
                    </div>

                    {/* Catégorie */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Catégorie</label>
                        <select
                            value={filters.categorie}
                            onChange={(e) => handleFilterChange('categorie', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">Toutes</option>
                            <option value="economique">Économique</option>
                            <option value="moyenne">Moyenne</option>
                            <option value="luxe">Luxe</option>
                            <option value="suv">SUV</option>
                            <option value="utilitaire">Utilitaire</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Marque */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Marque</label>
                        <input
                            type="text"
                            value={filters.marque}
                            onChange={(e) => handleFilterChange('marque', e.target.value)}
                            placeholder="Ex: Renault"
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Modèle */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Modèle</label>
                        <input
                            type="text"
                            value={filters.modele}
                            onChange={(e) => handleFilterChange('modele', e.target.value)}
                            placeholder="Ex: Clio"
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Année */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Année</label>
                        <input
                            type="number"
                            value={filters.annee}
                            onChange={(e) => handleFilterChange('annee', e.target.value)}
                            placeholder="Ex: 2023"
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Agence */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Agence</label>
                        <select
                            value={filters.agence_id}
                            onChange={(e) => handleFilterChange('agence_id', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">Toutes</option>
                            {agences.map(agence => (
                                <option key={agence.id} value={agence.id}>{agence.nom}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                        Réinitialiser les filtres
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 cursor-pointer hover:text-cyan-400" onClick={() => handleSort('immatriculation')}>
                                    Immatriculation <SortIcon field="immatriculation" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 cursor-pointer hover:text-cyan-400" onClick={() => handleSort('marque')}>
                                    Marque <SortIcon field="marque" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 cursor-pointer hover:text-cyan-400" onClick={() => handleSort('modele')}>
                                    Modèle <SortIcon field="modele" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 cursor-pointer hover:text-cyan-400" onClick={() => handleSort('annee')}>
                                    Année <SortIcon field="annee" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Carburant</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 cursor-pointer hover:text-cyan-400" onClick={() => handleSort('km')}>
                                    Kilométrage <SortIcon field="km" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 cursor-pointer hover:text-cyan-400" onClick={() => handleSort('etat')}>
                                    État <SortIcon field="etat" />
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Agence</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300 cursor-pointer hover:text-cyan-400" onClick={() => handleSort('prix_jour')}>
                                    Prix/Jour <SortIcon field="prix_jour" />
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-white font-medium">{vehicle.immatriculation}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{vehicle.marque}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{vehicle.modele}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{vehicle.annee}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300 capitalize">{vehicle.carburant}</td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{vehicle.km?.toLocaleString()} km</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEtatBadge(vehicle.etat)}`}>
                                            {getEtatLabel(vehicle.etat)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">{vehicle.agence?.nom || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-white font-semibold">{vehicle.prix_jour} DH</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openViewModal(vehicle)}
                                                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                title="Voir"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                onClick={() => openEditModal(vehicle)}
                                                className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(vehicle.id)}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {vehicles.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            Aucun véhicule trouvé
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-slate-900/50 px-6 py-4 flex items-center justify-between border-t border-slate-700">
                        <div className="text-sm text-slate-400">
                            Affichage {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} véhicules
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Précédent
                            </button>
                            <span className="px-4 py-2 text-slate-300">
                                Page {pagination.page} sur {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page >= pagination.totalPages}
                                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700">
                            <h2 className="text-2xl font-bold text-white">
                                {isEditMode ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Immatriculation */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Immatriculation *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.immatriculation}
                                        onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>

                                {/* VIN */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">VIN</label>
                                    <input
                                        type="text"
                                        value={formData.vin}
                                        onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>

                                {/* Marque */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Marque *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.marque}
                                        onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>

                                {/* Modèle */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Modèle *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.modele}
                                        onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>

                                {/* Année */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Année *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.annee}
                                        onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>

                                {/* Kilométrage */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Kilométrage</label>
                                    <input
                                        type="number"
                                        value={formData.km}
                                        onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>

                                {/* Carburant */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Carburant *</label>
                                    <select
                                        required
                                        value={formData.carburant}
                                        onChange={(e) => setFormData({ ...formData, carburant: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="essence">Essence</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="electrique">Électrique</option>
                                        <option value="hybride">Hybride</option>
                                    </select>
                                </div>

                                {/* Boîte */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Boîte *</label>
                                    <select
                                        required
                                        value={formData.boite}
                                        onChange={(e) => setFormData({ ...formData, boite: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="manuelle">Manuelle</option>
                                        <option value="automatique">Automatique</option>
                                    </select>
                                </div>

                                {/* Catégorie */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Catégorie *</label>
                                    <select
                                        required
                                        value={formData.categorie}
                                        onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="economique">Économique</option>
                                        <option value="moyenne">Moyenne</option>
                                        <option value="luxe">Luxe</option>
                                        <option value="suv">SUV</option>
                                        <option value="utilitaire">Utilitaire</option>
                                    </select>
                                </div>

                                {/* Prix journalier */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Prix journalier (DH) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.prix_journalier}
                                        onChange={(e) => setFormData({ ...formData, prix_journalier: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>

                                {/* État */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">État *</label>
                                    <select
                                        required
                                        value={formData.etat}
                                        onChange={(e) => setFormData({ ...formData, etat: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="disponible">Disponible</option>
                                        <option value="reserve">Réservé</option>
                                        <option value="en_maintenance">En maintenance</option>
                                        <option value="hors_service">Hors service</option>
                                    </select>
                                </div>

                                {/* Agence */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Agence *</label>
                                    <select
                                        required
                                        value={formData.agence_id}
                                        onChange={(e) => setFormData({ ...formData, agence_id: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="">Sélectionner</option>
                                        {agences.map(agence => (
                                            <option key={agence.id} value={agence.id}>{agence.nom}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Images Upload Section */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Images du véhicule (max 5 images, 5MB chacune)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />

                                {/* Image Preview Gallery */}
                                {imagePreviewUrls.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {imagePreviewUrls.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={url}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border border-slate-700"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Supprimer"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                                >
                                    {isEditMode ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedVehicle && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700">
                            <h2 className="text-2xl font-bold text-white">Détails du véhicule</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-400">Immatriculation</p>
                                    <p className="text-white font-semibold">{selectedVehicle.immatriculation}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">VIN</p>
                                    <p className="text-white">{selectedVehicle.vin || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Marque</p>
                                    <p className="text-white">{selectedVehicle.marque}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Modèle</p>
                                    <p className="text-white">{selectedVehicle.modele}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Année</p>
                                    <p className="text-white">{selectedVehicle.annee}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Kilométrage</p>
                                    <p className="text-white">{selectedVehicle.km?.toLocaleString()} km</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Carburant</p>
                                    <p className="text-white capitalize">{selectedVehicle.carburant}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Boîte</p>
                                    <p className="text-white capitalize">{selectedVehicle.boite}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Catégorie</p>
                                    <p className="text-white capitalize">{selectedVehicle.categorie}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Prix journalier</p>
                                    <p className="text-white font-semibold">{selectedVehicle.prix_jour} DH</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">État</p>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getEtatBadge(selectedVehicle.etat)}`}>
                                        {getEtatLabel(selectedVehicle.etat)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Agence</p>
                                    <p className="text-white">{selectedVehicle.agence?.nom || '-'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-700 flex justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;
