import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Car, ShieldCheck, Clock, MapPin, Star, Check, Phone, Mail, Wind, Zap, Battery, Users } from 'lucide-react';

// --- SHARED COMPONENTS ---

const Section = ({ children, className = '' }) => (
    <section className={`py-12 md:py-20 ${className}`}>{children}</section>
);

const Container = ({ children, className = '' }) => (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

const SectionTitle = ({ children, className = '' }) => (
    <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 ${className}`}>{children}</h2>
);

const VehicleCard = ({ vehicle }) => (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
        <div className="relative h-56 overflow-hidden">
            <img
                src={vehicle.images?.[0] || '/placeholder.png'}
                alt={`${vehicle.marque} ${vehicle.modele}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent"></div>
            <div className="absolute bottom-4 left-4">
                <h3 className="text-2xl font-bold text-white leading-tight">{vehicle.marque}</h3>
                <p className="text-lg text-slate-200 font-light">{vehicle.modele}</p>
            </div>
        </div>
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <div className="text-2xl font-bold text-cyan-500 dark:text-cyan-400">{vehicle.prix_jour}<span className="text-sm font-normal text-slate-500 dark:text-slate-400">/jour</span></div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Star size={16} className="text-yellow-500" />
                    <span>4.8 (25)</span>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-600 dark:text-slate-400 mb-6">
                <div className="bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg"><Users size={16} className="mx-auto mb-1" /> {vehicle.places || 5} Places</div>
                <div className="bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg"><Wind size={16} className="mx-auto mb-1" /> {vehicle.boite || 'Auto'}</div>
                <div className="bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg"><Zap size={16} className="mx-auto mb-1" /> {vehicle.carburant || 'Essence'}</div>
            </div>
            <Link to={`/book?vehicle=${vehicle.id}`} className="block w-full text-center px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors shadow-md hover:shadow-lg">
                Réserver Maintenant
            </Link>
        </div>
    </div>
);

// --- TEMPLATE 1: MODERN (Refreshed) ---
export const TemplateModern = ({ config, vehicles }) => (
    <div className="bg-slate-900 text-white font-sans">
        <header className="absolute top-0 left-0 w-full z-30 p-4">
            <Container className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">GoRent</h1>
                <nav className="hidden md:flex gap-6 items-center">
                    <Link to="/vehicles" className="text-slate-300 hover:text-white transition-colors">Véhicules</Link>
                    <Link to="/about" className="text-slate-300 hover:text-white transition-colors">À Propos</Link>
                    <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link>
                    <Link to="/admin/dashboard" className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors">Mon Compte</Link>
                </nav>
            </Container>
        </header>
        <Section className="relative min-h-screen flex items-center pt-20 md:pt-0">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 opacity-80"></div>
            <img src={config.heroImage || '/range-rover-hero.png'} alt="Hero car" className="absolute inset-0 w-full h-full object-cover opacity-20" />
            <Container className="relative z-10 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tighter leading-tight">
                    {config.heroTitle || "Location de voiture, simplifiée."}
                </h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8">
                    {config.heroDescription || "Découvrez une expérience de location premium avec notre flotte de véhicules modernes et un service client inégalé."}
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/vehicles" className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full hover:shadow-xl hover:shadow-cyan-500/30 transition-all transform hover:scale-105">
                        {config.ctaText || "Explorer la flotte"}
                    </Link>
                </div>
            </Container>
        </Section>

        <Section className="bg-slate-800/50">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    <div className="p-4">
                        <ShieldCheck size={40} className="mx-auto mb-4 text-cyan-400" />
                        <h3 className="text-xl font-semibold mb-2">Assurance Complète</h3>
                        <p className="text-slate-400">Conduisez en toute tranquillité, tous nos véhicules sont assurés tous risques.</p>
                    </div>
                    <div className="p-4">
                        <Clock size={40} className="mx-auto mb-4 text-cyan-400" />
                        <h3 className="text-xl font-semibold mb-2">Service 24/7</h3>
                        <p className="text-slate-400">Notre équipe est disponible à tout moment pour répondre à vos besoins.</p>
                    </div>
                    <div className="p-4">
                        <Car size={40} className="mx-auto mb-4 text-cyan-400" />
                        <h3 className="text-xl font-semibold mb-2">Flotte de Qualité</h3>
                        <p className="text-slate-400">Une large sélection de véhicules neufs et parfaitement entretenus.</p>
                    </div>
                    <div className="p-4">
                        <MapPin size={40} className="mx-auto mb-4 text-cyan-400" />
                        <h3 className="text-xl font-semibold mb-2">Agences Multiples</h3>
                        <p className="text-slate-400">Retirez et déposez votre voiture dans nos agences idéalement situées.</p>
                    </div>
                </div>
            </Container>
        </Section>

        <Section>
            <Container>
                <SectionTitle className="text-white">Nos Véhicules Populaires</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(vehicles.length > 0 ? vehicles : Array(3).fill({ marque: 'Dummy', modele: 'Car', images: ['/placeholder.png'], prix_jour: '999' })).map((v, i) => (
                        <VehicleCard key={i} vehicle={v} />
                    ))}
                </div>
            </Container>
        </Section>
    </div>
);


// --- TEMPLATE 2: LUXURY (Refreshed) ---
export const TemplateLuxury = ({ config, vehicles }) => (
    <div className="bg-[#111] text-neutral-200 font-serif">
        <Section className="min-h-screen flex items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/50 z-10"></div>
            <video autoPlay loop muted className="absolute z-0 w-auto min-w-full min-h-full max-w-none">
                <source src="https://cdn.pixabay.com/video/2020/03/03/33379-400563428_large.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la vidéo.
            </video>
            <Container className="relative z-20 text-center">
                <p className="text-amber-400 uppercase tracking-widest text-sm mb-4">Expérience Exclusive</p>
                <h1 className="text-5xl md:text-7xl font-thin text-white uppercase tracking-wider mb-6">
                    {config.heroTitle || "Le Luxe à l'état pur"}
                </h1>
                <p className="text-lg text-neutral-300 max-w-2xl mx-auto mb-10 font-sans">
                    {config.heroDescription || "Prenez le volant de l'exception. Une collection de véhicules de prestige pour une expérience inoubliable."}
                </p>
                <Link to="/vehicles" className="font-sans px-12 py-4 border-2 border-amber-400 text-amber-400 font-bold uppercase tracking-wider hover:bg-amber-400 hover:text-black transition-all duration-300">
                    {config.ctaText || "Découvrir la Collection"}
                </Link>
            </Container>
        </Section>
    </div>
);

// --- TEMPLATE 3: MINIMAL (Refreshed) ---
export const TemplateMinimal = ({ config, vehicles }) => (
    <div className="bg-white text-slate-800 font-sans">
        <Section className="pt-32 pb-16">
            <Container className="text-center">
                <h1 className="text-6xl md:text-8xl font-light tracking-tighter mb-8">
                    {config.heroTitle || "Conduire. Simplement."}
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-12">
                    {config.heroDescription || "Votre prochaine voiture, à quelques clics. Sans tracas, sans complications."}
                </p>
                <Link to="/vehicles" className="inline-flex items-center text-xl font-medium group">
                    {config.ctaText || "Voir les voitures"}
                    <ArrowRight size={24} className="ml-2 transition-transform duration-300 group-hover:translate-x-2" />
                </Link>
            </Container>
        </Section>
        <Container>
            <div className="rounded-3xl overflow-hidden aspect-video shadow-2xl">
                <img src={config.heroImage || '/range-rover-hero.png'} alt="Hero car" className="w-full h-full object-cover" />
            </div>
        </Container>
        <Section>
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div>
                        <Check size={32} className="mx-auto mb-4 text-cyan-600" />
                        <h3 className="text-xl font-semibold mb-2">Réservation facile</h3>
                        <p>Notre processus de réservation est simple et rapide.</p>
                    </div>
                    <div>
                        <Check size={32} className="mx-auto mb-4 text-cyan-600" />
                        <h3 className="text-xl font-semibold mb-2">Prix Transparents</h3>
                        <p>Pas de frais cachés. Ce que vous voyez est ce que vous payez.</p>
                    </div>
                    <div>
                        <Check size={32} className="mx-auto mb-4 text-cyan-600" />
                        <h3 className="text-xl font-semibold mb-2">Support Fiable</h3>
                        <p>Notre équipe est là pour vous aider à chaque étape.</p>
                    </div>
                </div>
            </Container>
        </Section>
    </div>
);

// --- Add other templates here as needed ---

export const templates = {
    modern: TemplateModern,
    luxury: TemplateLuxury,
    minimal: TemplateMinimal,
    // Keep old templates for compatibility, or remove if you want a clean slate
    // bold: TemplateBold, 
    // classic: TemplateClassic,
    // dynamic: TemplateDynamic,
    // elegant: TemplateElegant
};
