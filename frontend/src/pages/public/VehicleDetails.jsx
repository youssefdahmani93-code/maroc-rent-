import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Fuel, Gauge, Settings, Star, MapPin, Shield, CheckCircle } from 'lucide-react';
import axios from 'axios';

const VehicleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchVehicleDetails();
    }, [id]);

    const fetchVehicleDetails = async () => {
        try {
            const res = await axios.get(`/api/vehicules/${id}`);
            setVehicle(res.data);
            setSelectedImage(0);

            // Mock reviews - replace with actual API call when available
            setReviews([
                {
                    id: 1,
                    client_name: 'Ahmed M.',
                    rating: 5,
                    comment: 'Excellent véhicule, très confortable et en parfait état.',
                    date: '2024-01-15'
                },
                {
                    id: 2,
                    client_name: 'Fatima K.',
                    rating: 4,
                    comment: 'Très bon service, voiture propre et bien entretenue.',
                    date: '2024-01-10'
                },
                {
                    id: 3,
                    client_name: 'Youssef B.',
                    rating: 5,
                    comment: 'Parfait pour un voyage en famille. Je recommande!',
                    date: '2024-01-05'
                }
            ]);

            setLoading(false);
        } catch (error) {
            console.error('Error loading vehicle:', error);
            setLoading(false);
        }
    };

    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Véhicule non trouvé</h2>
                    <Link to="/vehicles" className="text-cyan-400 hover:text-cyan-300">
                        Retour à la liste
                    </Link>
                </div>
            </div>
        );
    }

    const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : ['/placeholder-car.jpg'];
    const averageRating = calculateAverageRating();

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/vehicles')}
                    className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Retour aux véhicules</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Images & Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Main Image */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
                            <div className="relative h-96 bg-slate-700/50">
                                <img
                                    src={images[selectedImage]}
                                    alt={`${vehicle.marque} ${vehicle.modele}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop';
                                    }}
                                />
                                {vehicle.etat === 'disponible' && (
                                    <div className="absolute top-4 left-4 px-4 py-2 bg-green-500 text-white font-semibold rounded-full flex items-center gap-2">
                                        <CheckCircle size={18} />
                                        Disponible
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 px-4 py-2 bg-cyan-500 text-white font-semibold rounded-full capitalize">
                                    {vehicle.categorie}
                                </div>
                            </div>

                            {/* Thumbnail Gallery */}
                            {images.length > 1 && (
                                <div className="p-4 grid grid-cols-4 gap-4">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx
                                                    ? 'border-cyan-500 scale-105'
                                                    : 'border-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`Thumbnail ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=150&fit=crop';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Vehicle Details */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {vehicle.marque} {vehicle.modele}
                            </h1>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            className={i < Math.floor(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}
                                        />
                                    ))}
                                    <span className="text-white font-semibold ml-2">{averageRating}</span>
                                    <span className="text-slate-400">({reviews.length} avis)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                    <Calendar className="text-cyan-400" size={24} />
                                    <div>
                                        <p className="text-xs text-slate-400">Année</p>
                                        <p className="text-white font-semibold">{vehicle.annee}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                    <Settings className="text-cyan-400" size={24} />
                                    <div>
                                        <p className="text-xs text-slate-400">Transmission</p>
                                        <p className="text-white font-semibold capitalize">{vehicle.boite}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                    <Fuel className="text-cyan-400" size={24} />
                                    <div>
                                        <p className="text-xs text-slate-400">Carburant</p>
                                        <p className="text-white font-semibold capitalize">{vehicle.carburant}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                                    <Users className="text-cyan-400" size={24} />
                                    <div>
                                        <p className="text-xs text-slate-400">Places</p>
                                        <p className="text-white font-semibold">{vehicle.nombre_places || 5}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="border-t border-slate-700 pt-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Équipements</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <CheckCircle size={18} className="text-green-400" />
                                        <span>Climatisation</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <CheckCircle size={18} className="text-green-400" />
                                        <span>GPS</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <CheckCircle size={18} className="text-green-400" />
                                        <span>Bluetooth</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <CheckCircle size={18} className="text-green-400" />
                                        <span>Airbags</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Reviews */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-white mb-6">Avis des clients</h3>
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="border-b border-slate-700 pb-4 last:border-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-white">{review.client_name}</p>
                                                <p className="text-sm text-slate-400">
                                                    {new Date(review.date).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-300">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 sticky top-6">
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-bold text-cyan-400">{vehicle.prix_jour} DH</span>
                                    <span className="text-slate-400">/jour</span>
                                </div>
                                <p className="text-sm text-slate-400">Prix tout compris</p>
                            </div>

                            {vehicle.etat === 'disponible' ? (
                                <Link
                                    to={`/book?vehicle=${vehicle.id}`}
                                    className="block w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-center rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all mb-4"
                                >
                                    Réserver maintenant
                                </Link>
                            ) : (
                                <button
                                    disabled
                                    className="block w-full py-4 bg-slate-700 text-slate-400 text-center rounded-lg font-semibold cursor-not-allowed mb-4"
                                >
                                    Non disponible
                                </button>
                            )}

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Shield size={18} className="text-green-400" />
                                    <span>Assurance tous risques incluse</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <MapPin size={18} className="text-green-400" />
                                    <span>Livraison possible</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <CheckCircle size={18} className="text-green-400" />
                                    <span>Annulation gratuite 24h avant</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <p className="text-sm text-slate-400 mb-2">Besoin d'aide?</p>
                                <Link
                                    to="/contact"
                                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                                >
                                    Contactez-nous
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetails;
