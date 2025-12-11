import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Linkedin, User } from 'lucide-react';
import axios from 'axios';

const PublicLayout = ({ children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [companyInfo, setCompanyInfo] = useState({
        company_name: 'GoRent',
        company_tagline: 'Louez votre voiture en toute simplicité',
        company_logo: '',
        company_phone: '+212 XXX-XXXXXX',
        company_email: 'contact@gorent.ma',
        company_address: '',
        company_city: '',
        social_facebook: '',
        social_instagram: '',
        social_twitter: '',
        social_linkedin: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCompanyInfo();
    }, []);

    const fetchCompanyInfo = async () => {
        try {
            const res = await axios.get('/api/settings/list?category=company');
            const settings = {};
            res.data.forEach(s => {
                settings[s.key] = s.value;
            });
            setCompanyInfo(prev => ({ ...prev, ...settings }));
        } catch (error) {
            console.error('Error loading company info:', error);
        }
    };

    const navLinks = [
        { to: '/home', label: 'Accueil' },
        { to: '/vehicles', label: 'Véhicules' },
        { to: '/about', label: 'À Propos' },
        { to: '/contact', label: 'Contact' },
    ];

    const socialLinks = [
        { icon: Facebook, url: companyInfo.social_facebook, label: 'Facebook' },
        { icon: Instagram, url: companyInfo.social_instagram, label: 'Instagram' },
        { icon: Twitter, url: companyInfo.social_twitter, label: 'Twitter' },
        { icon: Linkedin, url: companyInfo.social_linkedin, label: 'LinkedIn' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50">
                <div className="container mx-auto px-4">
                    {/* Top Bar */}
                    <div className="hidden md:flex items-center justify-between py-2 text-sm border-b border-slate-700/30">
                        <div className="flex items-center gap-6 text-slate-400">
                            <a href={`tel:${companyInfo.company_phone}`} className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                                <Phone size={14} />
                                <span>{companyInfo.company_phone}</span>
                            </a>
                            <a href={`mailto:${companyInfo.company_email}`} className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                                <Mail size={14} />
                                <span>{companyInfo.company_email}</span>
                            </a>
                        </div>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social, idx) => (
                                social.url && (
                                    <a
                                        key={idx}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-400 hover:text-cyan-400 transition-colors"
                                        aria-label={social.label}
                                    >
                                        <social.icon size={16} />
                                    </a>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Main Navigation */}
                    <div className="flex items-center justify-between py-4">
                        {/* Logo */}
                        <Link to="/home" className="flex items-center gap-3">
                            {companyInfo.company_logo ? (
                                <img
                                    src={companyInfo.company_logo}
                                    alt={companyInfo.company_name}
                                    className="h-10 object-contain"
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-xl">G</span>
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-xl">{companyInfo.company_name}</div>
                                        {companyInfo.company_tagline && (
                                            <div className="text-slate-400 text-xs">{companyInfo.company_tagline}</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                to="/book"
                                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                            >
                                Réserver
                            </Link>
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:border-cyan-500 hover:text-cyan-400 transition-all"
                            >
                                <User size={18} />
                                <span>Connexion</span>
                            </Link>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-white p-2"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-slate-700/30">
                            <nav className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-slate-300 hover:text-cyan-400 font-medium transition-colors py-2"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <Link
                                    to="/book"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium text-center"
                                >
                                    Réserver
                                </Link>
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg"
                                >
                                    <User size={18} />
                                    <span>Connexion</span>
                                </Link>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 border-t border-slate-700/50 mt-auto">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div className="col-span-1 md:col-span-2">
                            <Link to="/home" className="flex items-center gap-2 mb-4">
                                {companyInfo.company_logo ? (
                                    <img
                                        src={companyInfo.company_logo}
                                        alt={companyInfo.company_name}
                                        className="h-8 object-contain"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold">G</span>
                                        </div>
                                        <span className="text-white font-bold text-lg">{companyInfo.company_name}</span>
                                    </div>
                                )}
                            </Link>
                            {companyInfo.company_tagline && (
                                <p className="text-slate-400 mb-4">{companyInfo.company_tagline}</p>
                            )}
                            <div className="flex gap-4">
                                {socialLinks.map((social, idx) => (
                                    social.url && (
                                        <a
                                            key={idx}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-all"
                                            aria-label={social.label}
                                        >
                                            <social.icon size={18} />
                                        </a>
                                    )
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Liens Rapides</h3>
                            <ul className="space-y-2">
                                {navLinks.map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to} className="text-slate-400 hover:text-cyan-400 transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link to="/login" className="text-slate-400 hover:text-cyan-400 transition-colors">
                                        Espace Client
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Contact</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-slate-400">
                                    <Phone size={18} className="mt-0.5 flex-shrink-0" />
                                    <a href={`tel:${companyInfo.company_phone}`} className="hover:text-cyan-400 transition-colors">
                                        {companyInfo.company_phone}
                                    </a>
                                </li>
                                <li className="flex items-start gap-2 text-slate-400">
                                    <Mail size={18} className="mt-0.5 flex-shrink-0" />
                                    <a href={`mailto:${companyInfo.company_email}`} className="hover:text-cyan-400 transition-colors">
                                        {companyInfo.company_email}
                                    </a>
                                </li>
                                {(companyInfo.company_address || companyInfo.company_city) && (
                                    <li className="flex items-start gap-2 text-slate-400">
                                        <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                                        <span>
                                            {companyInfo.company_address}
                                            {companyInfo.company_address && companyInfo.company_city && ', '}
                                            {companyInfo.company_city}
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-8 pt-8 border-t border-slate-700/50 text-center text-slate-400 text-sm">
                        <p>&copy; {new Date().getFullYear()} {companyInfo.company_name}. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
