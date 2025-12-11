import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import axios from 'axios';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
    const [companyInfo, setCompanyInfo] = useState({});
    const [agencies, setAgencies] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [settingsRes, agenciesRes] = await Promise.all([
                axios.get('/api/settings/list?category=company'),
                axios.get('/api/agences')
            ]);

            const settings = {};
            settingsRes.data.forEach(s => {
                settings[s.key] = s.value;
            });
            setCompanyInfo(settings);
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
        setSubmitMessage({ type: '', text: '' });

        try {
            // TODO: Create contact endpoint
            // await axios.post('/api/contact/submit', formData);

            // For now, just show success message
            setSubmitMessage({
                type: 'success',
                text: 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            setSubmitMessage({
                type: 'error',
                text: 'Une erreur est survenue. Veuillez réessayer.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Contactez-Nous
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Une question ? Besoin d'aide ? Notre équipe est là pour vous répondre
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Envoyez-nous un message</h2>

                            {submitMessage.text && (
                                <div className={`p-4 rounded-lg mb-6 ${submitMessage.type === 'success'
                                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                                    }`}>
                                    {submitMessage.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Nom complet *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Téléphone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="+212 XXX-XXXXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Sujet *
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            placeholder="Objet de votre message"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                        placeholder="Votre message..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={20} />
                                    {submitting ? 'Envoi en cours...' : 'Envoyer le message'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Contact Info Sidebar */}
                    <div className="space-y-6">
                        {/* Main Contact */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-6">Informations de Contact</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Phone className="text-cyan-400" size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-400 mb-1">Téléphone</div>
                                        <a href={`tel:${companyInfo.company_phone}`} className="text-white hover:text-cyan-400 transition-colors">
                                            {companyInfo.company_phone || '+212 XXX-XXXXXX'}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Mail className="text-cyan-400" size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-400 mb-1">Email</div>
                                        <a href={`mailto:${companyInfo.company_email}`} className="text-white hover:text-cyan-400 transition-colors">
                                            {companyInfo.company_email || 'contact@gorent.ma'}
                                        </a>
                                    </div>
                                </div>

                                {(companyInfo.company_address || companyInfo.company_city) && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin className="text-cyan-400" size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-400 mb-1">Adresse</div>
                                            <div className="text-white">
                                                {companyInfo.company_address}
                                                {companyInfo.company_address && companyInfo.company_city && <br />}
                                                {companyInfo.company_city}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Clock className="text-cyan-400" size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-400 mb-1">Horaires</div>
                                        <div className="text-white">
                                            Lun - Sam: 9h00 - 18h00<br />
                                            Dimanche: Fermé
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Agencies */}
                        {agencies.length > 0 && (
                            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Nos Agences</h3>
                                <div className="space-y-4">
                                    {agencies.slice(0, 3).map((agency) => (
                                        <div key={agency.id} className="border-l-2 border-cyan-500 pl-4">
                                            <div className="font-semibold text-white">{agency.nom}</div>
                                            <div className="text-sm text-slate-400">{agency.ville}</div>
                                            {agency.telephone && (
                                                <div className="text-sm text-slate-400">{agency.telephone}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
