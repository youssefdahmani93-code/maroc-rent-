import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GPS = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const [positions, setPositions] = useState([]);
    const [alertes, setAlertes] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // Centre de la carte (Casablanca par défaut)
    const mapCenter = [33.5731, -7.5898];

    useEffect(() => {
        // Initialiser la carte
        if (mapRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView(mapCenter, 12);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(mapInstanceRef.current);
        }

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => {
            clearInterval(interval);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (mapInstanceRef.current && positions.length > 0) {
            updateMarkers();
        }
    }, [positions]);

    const fetchData = async () => {
        try {
            const [positionsRes, alertesRes, statsRes] = await Promise.all([
                axios.get('/api/gps/positions'),
                axios.get('/api/gps/alertes', { params: { statut: 'en_attente,critique' } }),
                axios.get('/api/gps/stats')
            ]);

            setPositions(positionsRes.data);
            setAlertes(alertesRes.data);
            setStats(statsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des données GPS:', error);
            setLoading(false);
        }
    };

    const getMarkerColor = (etat) => {
        const colors = {
            disponible: '#10b981',
            reserve: '#3b82f6',
            en_maintenance: '#f59e0b',
            hors_service: '#ef4444'
        };
        return colors[etat] || '#6b7280';
    };

    const createCustomIcon = (color) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    };

    const updateMarkers = () => {
        // Supprimer les anciens marqueurs
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Ajouter les nouveaux marqueurs
        positions.forEach(pos => {
            if (pos.gps) {
                const marker = L.marker(
                    [parseFloat(pos.gps.latitude), parseFloat(pos.gps.longitude)],
                    { icon: createCustomIcon(getMarkerColor(pos.etat)) }
                ).addTo(mapInstanceRef.current);

                const popupContent = `
                    <div style="padding: 10px; min-width: 200px;">
                        <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${pos.marque} ${pos.modele}</h3>
                        <p style="font-size: 14px; color: #666; margin: 4px 0;">📍 ${pos.immatriculation}</p>
                        <p style="font-size: 14px; color: #666; margin: 4px 0;">🏢 ${pos.agence?.nom || 'N/A'}</p>
                        <p style="font-size: 14px; color: #666; margin: 4px 0;">⚡ ${parseFloat(pos.gps.vitesse).toFixed(0)} km/h</p>
                        <p style="font-size: 14px; color: #666; margin: 4px 0;">📍 ${pos.gps.adresse || 'Adresse non disponible'}</p>
                    </div>
                `;

                marker.bindPopup(popupContent);
                markersRef.current.push(marker);
            }
        });
    };

    const handleResolveAlerte = async (alerteId) => {
        try {
            await axios.post(`/api/gps/alertes/${alerteId}/resolve`);
            fetchData();
        } catch (error) {
            console.error('Erreur lors de la résolution de l\'alerte:', error);
        }
    };

    const getTypeAlerteLabel = (type) => {
        const labels = {
            exces_vitesse: 'Excès de vitesse',
            sortie_zone: 'Sortie de zone',
            arret_prolonge: 'Arrêt prolongé',
            gps_deconnecte: 'GPS déconnecté',
            suspicion_vol: 'Suspicion de vol'
        };
        return labels[type] || type;
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Suivi GPS</h1>
                    <p className="text-slate-400">Localisation en temps réel de la flotte</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchData}
                        className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        🔄 Actualiser
                    </button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                        <div className="text-slate-400 text-sm mb-1">Total véhicules</div>
                        <div className="text-2xl font-bold text-white">{stats.total_vehicules}</div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                        <div className="text-slate-400 text-sm mb-1">GPS actifs</div>
                        <div className="text-2xl font-bold text-green-400">{stats.vehicules_actifs}</div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                        <div className="text-slate-400 text-sm mb-1">Alertes en attente</div>
                        <div className="text-2xl font-bold text-orange-400">{stats.alertes_en_attente}</div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                        <div className="text-slate-400 text-sm mb-1">Distance aujourd'hui</div>
                        <div className="text-2xl font-bold text-cyan-400">{stats.distance_totale_aujourd_hui} km</div>
                    </div>
                </div>
            )}

            {/* Alertes */}
            {alertes.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <h3 className="text-orange-400 font-semibold mb-3">⚠️ Alertes GPS ({alertes.length})</h3>
                    <div className="space-y-2">
                        {alertes.slice(0, 5).map((alerte) => (
                            <div key={alerte.id} className={`flex items-center justify-between p-3 rounded-lg ${alerte.statut === 'critique' ? 'bg-red-500/10 border border-red-500/30' : 'bg-orange-500/10'}`}>
                                <div className="flex-1">
                                    <span className="text-white font-medium">{alerte.vehicule?.marque} {alerte.vehicule?.modele}</span>
                                    <span className="text-slate-400 text-sm ml-2">• {getTypeAlerteLabel(alerte.type)}</span>
                                    {alerte.valeur && <span className="text-slate-400 text-sm ml-2">({alerte.valeur})</span>}
                                </div>
                                <button
                                    onClick={() => handleResolveAlerte(alerte.id)}
                                    className="text-green-400 hover:text-green-300 text-sm font-medium"
                                >
                                    Résoudre
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Carte */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden" style={{ height: '600px' }}>
                <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
            </div>

            {/* Info */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-slate-300 text-sm">Disponible</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-slate-300 text-sm">Réservé</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        <span className="text-slate-300 text-sm">En maintenance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-slate-300 text-sm">Hors service</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GPS;
