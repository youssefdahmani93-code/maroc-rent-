import { useState, useEffect } from 'react';
import { MapPin, Users, Award, Shield } from 'lucide-react';
import axios from 'axios';

const AboutPage = () => {
    const [agencies, setAgencies] = useState([]);
    const [companyInfo, setCompanyInfo] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [agenciesRes, settingsRes] = await Promise.all([
                axios.get('/api/agences'),
                axios.get('/api/settings/list?category=company')
            ]);

            setAgencies(agenciesRes.data);

            const settings = {};
            settingsRes.data.forEach(s => {
                settings[s.key] = s.value;
            });
            setCompanyInfo(settings);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const values = [
        {
            icon: Users,
            title: 'Satisfaction Client',
            description: 'Votre satisfaction est notre priorité absolue'
        },
        {
            icon: Award,
            title: 'Excellence',
            description: 'Des véhicules de qualité et un service irréprochable'
        },
        {
            icon: Shield,
            title: 'Confiance',
            description: 'Transparence et honnêteté dans toutes nos transactions'
        },
        {
            icon: MapPin,
            title: 'Proximité',
            description: 'Présents dans les principales villes du Maroc'
        }
    ];

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        À Propos de {companyInfo.company_name || 'GoRent'}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-3xl mx-auto">
                        {companyInfo.company_description || 'Votre partenaire de confiance pour la location de véhicules au Maroc'}
                    </p>
                </div>

                {/* Company Story */}
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 md:p-12 mb-12">
                    <h2 className="text-3xl font-bold text-white mb-6">Notre Histoire</h2>
                    <div className="text-slate-300 space-y-4 text-lg leading-relaxed">
                        <p>
                            Depuis notre création, nous nous sommes engagés à fournir un service de location de véhicules
                            de qualité supérieure à nos clients à travers le Maroc. Notre mission est de rendre la location
                            de voitures simple, transparente et accessible à tous.
                        </p>
                        <p>
                            Avec une flotte moderne et diversifiée, nous offrons des solutions adaptées à tous les besoins,
                            que ce soit pour un voyage d'affaires, des vacances en famille ou une escapade entre amis.
                        </p>
                        <p>
                            Notre équipe dévouée travaille sans relâche pour garantir que chaque expérience de location
                            soit mémorable et sans tracas.
                        </p>
                    </div>
                </div>

                {/* Values */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Nos Valeurs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, idx) => (
                            <div key={idx} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 text-center hover:border-cyan-500/30 transition-all">
                                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <value.icon className="text-cyan-400" size={32} />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                                <p className="text-slate-400">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Our Locations */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">Nos Agences</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {agencies.map((agency) => (
                            <div key={agency.id} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
                                <h3 className="text-xl font-bold text-white mb-3">{agency.nom}</h3>
                                <div className="space-y-2 text-slate-300">
                                    {agency.ville && (
                                        <p className="flex items-start gap-2">
                                            <MapPin size={18} className="mt-0.5 flex-shrink-0 text-cyan-400" />
                                            <span>{agency.ville}</span>
                                        </p>
                                    )}
                                    {agency.adresse && (
                                        <p className="text-slate-400 text-sm pl-6">{agency.adresse}</p>
                                    )}
                                    {agency.telephone && (
                                        <p className="text-slate-400 text-sm pl-6">{agency.telephone}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Pourquoi Nous Choisir ?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                        <div>
                            <div className="text-4xl font-bold mb-2">100+</div>
                            <div className="text-white/90">Véhicules Disponibles</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">24/7</div>
                            <div className="text-white/90">Service Client</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">100%</div>
                            <div className="text-white/90">Assurance Tous Risques</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
