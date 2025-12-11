import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calendar, MapPin, User, CheckCircle } from 'lucide-react';
import axios from 'axios';

const BookingPage = () => {
    const [searchParams] = useSearchParams();
    const vehicleId = searchParams.get('vehicle');

    const [step, setStep] = useState(1);
    const [vehicles, setVehicles] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [formData, setFormData] = useState({
        vehicle_id: vehicleId || '',
        date_debut: '',
        date_fin: '',
        agence_retrait_id: '',
        agence_retour_id: '',
        client_nom: '',
        client_email: '',
        client_telephone: '',
        client_cin: '',
        client_permis: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [bookingRef, setBookingRef] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [vehiclesRes, agenciesRes] = await Promise.all([
                axios.get('/api/vehicules'),
                axios.get('/api/agences')
            ]);
            setVehicles(vehiclesRes.data.vehicules || []);
            setAgencies(agenciesRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await axios.post('/api/public/bookings', formData);
            setBookingRef(res.data.reference);
            setStep(4);
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicle_id));

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Réserver un Véhicule
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Complétez votre réservation en quelques étapes simples
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between mb-12">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                                }`}>
                                {s}
                            </div>
                            {s < 4 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>}
                        </div>
                    ))}
                </div>

                {step < 4 ? (
                    <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
                        {/* Step 1: Vehicle Selection */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Choisissez votre véhicule</h2>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Véhicule *
                                    </label>
                                    <select
                                        name="vehicle_id"
                                        value={formData.vehicle_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="">Sélectionnez un véhicule</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>
                                                {v.marque} {v.modele} - {v.prix_jour} DH/jour
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedVehicle && (
                                    <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-4">
                                        <div className="font-semibold text-white mb-2">
                                            {selectedVehicle.marque} {selectedVehicle.modele}
                                        </div>
                                        <div className="text-slate-400 text-sm">
                                            {selectedVehicle.annee} • {selectedVehicle.boite} • {selectedVehicle.carburant}
                                        </div>
                                        <div className="text-cyan-400 font-bold mt-2">
                                            {selectedVehicle.prix_jour} DH/jour
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!formData.vehicle_id}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continuer
                                </button>
                            </div>
                        )}

                        {/* Step 2: Dates & Location */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Dates et Lieu</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Date de début *
                                        </label>
                                        <input
                                            type="date"
                                            name="date_debut"
                                            value={formData.date_debut}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Date de fin *
                                        </label>
                                        <input
                                            type="date"
                                            name="date_fin"
                                            value={formData.date_fin}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Agence de retrait *
                                        </label>
                                        <select
                                            name="agence_retrait_id"
                                            value={formData.agence_retrait_id}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        >
                                            <option value="">Sélectionnez une agence</option>
                                            {agencies.map(a => (
                                                <option key={a.id} value={a.id}>{a.nom} - {a.ville}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Agence de retour *
                                        </label>
                                        <select
                                            name="agence_retour_id"
                                            value={formData.agence_retour_id}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        >
                                            <option value="">Sélectionnez une agence</option>
                                            {agencies.map(a => (
                                                <option key={a.id} value={a.id}>{a.nom} - {a.ville}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 px-6 py-3 border-2 border-slate-600 text-white rounded-lg font-semibold hover:border-cyan-500 transition-all"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        disabled={!formData.date_debut || !formData.date_fin || !formData.agence_retrait_id || !formData.agence_retour_id}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continuer
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Customer Info */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-white mb-6">Vos Informations</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Nom complet *
                                        </label>
                                        <input
                                            type="text"
                                            name="client_nom"
                                            value={formData.client_nom}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="client_email"
                                            value={formData.client_email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Téléphone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="client_telephone"
                                            value={formData.client_telephone}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            CIN / Passeport *
                                        </label>
                                        <input
                                            type="text"
                                            name="client_cin"
                                            value={formData.client_cin}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Permis de conduire *
                                        </label>
                                        <input
                                            type="text"
                                            name="client_permis"
                                            value={formData.client_permis}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="flex-1 px-6 py-3 border-2 border-slate-600 text-white rounded-lg font-semibold hover:border-cyan-500 transition-all"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Envoi...' : 'Confirmer la réservation'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                ) : (
                    /* Step 4: Confirmation */
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Réservation Confirmée !</h2>
                        <p className="text-slate-400 text-lg mb-6">
                            Votre demande de réservation a été enregistrée avec succès.
                        </p>
                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-8">
                            <div className="text-sm text-slate-400 mb-2">Référence de réservation</div>
                            <div className="text-2xl font-bold text-cyan-400">{bookingRef}</div>
                        </div>
                        <p className="text-slate-300 mb-8">
                            Un email de confirmation a été envoyé à <strong>{formData.client_email}</strong>
                        </p>
                        <Link
                            to="/home"
                            className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
