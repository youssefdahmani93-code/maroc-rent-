import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Search } from 'lucide-react';
import axios from 'axios';

const VehicleCatalog = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        transmission: '',
        fuel: '',
        search: ''
    });

    useEffect(() => {
        fetchVehicles();
    }, [filters]);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('categorie', filters.category);
            if (filters.transmission) params.append('boite', filters.transmission);
            if (filters.fuel) params.append('carburant', filters.fuel);
            const res = await axios.get(`/api/vehicules?${params.toString()}`);
            // Handle both array response and object with vehicules property
            let vehicleData = Array.isArray(res.data) ? res.data : (res.data.vehicules || []);
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                vehicleData = vehicleData.filter(v =>
                    v.marque.toLowerCase().includes(searchLower) ||
                    v.modele.toLowerCase().includes(searchLower)
                );
            }
            setVehicles(vehicleData);
        } catch (error) {
            console.error('Error loading vehicles:', error);
            setVehicles([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const categories = ['economique', 'moyenne', 'suv', 'luxe'];
    const transmissions = ['manuelle', 'automatique'];
    const fuels = ['essence', 'diesel'];

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Notre Flotte de Véhicules</h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">Découvrez notre large sélection de véhicules disponibles à la location</p>
                </div>

                {/* Filters */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                        {/* Category Filter */}
                        <select
                            value={filters.category}
                            onChange={e => setFilters({ ...filters, category: e.target.value })}
                            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 capitalize"
                        >
                            <option value="">Toutes catégories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat} className="capitalize">{cat}</option>
                            ))}
                        </select>
                        {/* Transmission Filter */}
                        <select
                            value={filters.transmission}
                            onChange={e => setFilters({ ...filters, transmission: e.target.value })}
                            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 capitalize"
                        >
                            <option value="">Toutes transmissions</option>
                            {transmissions.map(trans => (
                                <option key={trans} value={trans} className="capitalize">{trans}</option>
                            ))}
                        </select>
                        {/* Fuel Filter */}
                        <select
                            value={filters.fuel}
                            onChange={e => setFilters({ ...filters, fuel: e.target.value })}
                            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 capitalize"
                        >
                            <option value="">Tous carburants</option>
                            {fuels.map(fuel => (
                                <option key={fuel} value={fuel} className="capitalize">{fuel}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-slate-400">
                        {vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''} trouvé{vehicles.length > 1 ? 's' : ''}
                    </p>
                </div>

                {/* Vehicles Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-20">
                        <Car size={64} className="text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">Aucun véhicule trouvé</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vehicles.map(vehicle => (
                            <div
                                key={vehicle.id}
                                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all cursor-pointer"
                                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                            >
                                {/* Vehicle Image */}
                                <div className="relative h-48 bg-slate-700/50 overflow-hidden">
                                    {vehicle.images && vehicle.images.length > 0 ? (
                                        <img src={vehicle.images[0]} alt={`${vehicle.marque} ${vehicle.modele}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Car size={64} className="text-slate-600" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-cyan-500 text-white text-sm font-semibold rounded-full capitalize">
                                        {vehicle.categorie}
                                    </div>
                                    {vehicle.etat === 'disponible' && (
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                                            Disponible
                                        </div>
                                    )}
                                </div>
                                {/* Vehicle Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {vehicle.marque} {vehicle.modele}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 text-sm text-slate-400 mb-4">
                                        <span>{vehicle.annee}</span>
                                        <span>•</span>
                                        <span className="capitalize">{vehicle.boite}</span>
                                        <span>•</span>
                                        <span className="capitalize">{vehicle.carburant}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-2xl font-bold text-cyan-400">{vehicle.prix_jour} DH</span>
                                            <span className="text-slate-400 text-sm">/jour</span>
                                        </div>
                                        <Link
                                            to={`/book?vehicle=${vehicle.id}`}
                                            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                                        >
                                            Réserver
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleCatalog;
