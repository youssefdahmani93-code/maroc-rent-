import { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const API_URL = '/api';

const Rapports = () => {
    const [reportType, setReportType] = useState('contracts');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 });
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        client_id: '',
        vehicle_id: '',
        agency_id: '',
        status: '',
        type: ''
    });
    const [clients, setClients] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [agences, setAgences] = useState([]);
    const [totals, setTotals] = useState(null);

    useEffect(() => {
        fetchClients();
        fetchVehicles();
        fetchAgences();
    }, []);

    useEffect(() => {
        fetchReportData();
    }, [reportType, filters, pagination.page]);

    const fetchClients = async () => {
        try {
            const res = await axios.get(`${API_URL}/clients`);
            setClients(res.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchVehicles = async () => {
        try {
            const res = await axios.get(`${API_URL}/vehicules`);
            setVehicles(res.data.vehicules || res.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        }
    };

    const fetchAgences = async () => {
        try {
            const res = await axios.get(`${API_URL}/agences`);
            setAgences(res.data);
        } catch (error) {
            console.error('Error fetching agences:', error);
        }
    };

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const res = await axios.get(`${API_URL}/reports/${reportType}`, { params });

            // Handle different response structures
            if (reportType === 'contracts') {
                setData(res.data.contracts || []);
            } else if (reportType === 'quotes') {
                setData(res.data.quotes || []);
            } else if (reportType === 'clients') {
                setData(res.data.clients || []);
            } else if (reportType === 'vehicles') {
                setData(res.data.vehicles || []);
            } else if (reportType === 'payments') {
                setData(res.data.payments || []);
                setTotals(res.data.totals || null);
            }

            setPagination(res.data.pagination || { total: 0, page: 1, limit: 50, totalPages: 0 });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching report data:', error);
            setLoading(false);
            if (error.response?.status === 403) {
                alert('Vous n\'avez pas la permission de voir ce rapport');
            }
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const resetFilters = () => {
        setFilters({
            start_date: '',
            end_date: '',
            client_id: '',
            vehicle_id: '',
            agency_id: '',
            status: '',
            type: ''
        });
    };

    const exportToPDF = () => {
        try {
            if (data.length === 0) {
                alert('Aucune donnée à exporter');
                return;
            }

            const doc = new jsPDF();
            const title = getReportTitle();

            doc.setFontSize(16);
            doc.text(title, 14, 15);

            doc.setFontSize(10);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 25);

            const columns = getTableColumns();
            const rows = data.map(item => columns.map(col => {
                const value = col.field.split('.').reduce((obj, key) => obj?.[key], item);
                // Format dates
                if (col.field.includes('date') && value) {
                    return new Date(value).toLocaleDateString();
                }
                // Format currency
                if (col.field.includes('montant') || col.field.includes('revenue')) {
                    return `${parseFloat(value || 0).toFixed(2)} DH`;
                }
                return value !== null && value !== undefined ? String(value) : '-';
            }));

            autoTable(doc, {
                head: [columns.map(col => col.label)],
                body: rows,
                startY: 30,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [6, 182, 212] }
            });

            doc.save(`${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
            alert('PDF téléchargé avec succès!');
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            alert('Erreur lors de l\'export PDF: ' + error.message);
        }
    };

    const exportToExcel = () => {
        const columns = getTableColumns();
        const exportData = data.map(item => {
            const row = {};
            columns.forEach(col => {
                const value = col.field.split('.').reduce((obj, key) => obj?.[key], item);
                row[col.label] = value !== null && value !== undefined ? value : '-';
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, getReportTitle());
        XLSX.writeFile(workbook, `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const getReportTitle = () => {
        const titles = {
            contracts: 'Rapport des Contrats',
            quotes: 'Rapport des Devis',
            clients: 'Rapport des Clients',
            vehicles: 'Rapport des Véhicules',
            payments: 'Rapport des Paiements'
        };
        return titles[reportType] || 'Rapport';
    };

    const getTableColumns = () => {
        const columnSets = {
            contracts: [
                { label: 'ID', field: 'id' },
                { label: 'Client', field: 'client.nom' },
                { label: 'Véhicule', field: 'vehicule.marque' },
                { label: 'Immatriculation', field: 'vehicule.immatriculation' },
                { label: 'Date Début', field: 'date_debut' },
                { label: 'Date Fin', field: 'date_fin' },
                { label: 'Montant', field: 'montant_total' },
                { label: 'Statut', field: 'statut' },
                { label: 'Agence', field: 'agence.nom' }
            ],
            quotes: [
                { label: 'ID', field: 'id' },
                { label: 'Client', field: 'client.nom' },
                { label: 'Véhicule', field: 'vehicule.marque' },
                { label: 'Date Début', field: 'date_debut' },
                { label: 'Date Fin', field: 'date_fin' },
                { label: 'Montant', field: 'montant_total' },
                { label: 'Statut', field: 'statut' },
                { label: 'Agence', field: 'agence.nom' }
            ],
            clients: [
                { label: 'ID', field: 'id' },
                { label: 'Nom', field: 'nom' },
                { label: 'Prénom', field: 'prenom' },
                { label: 'Email', field: 'email' },
                { label: 'Téléphone', field: 'telephone' },
                { label: 'Ville', field: 'ville' },
                { label: 'Total Contrats', field: 'total_contracts' },
                { label: 'Revenu Total', field: 'total_revenue' }
            ],
            vehicles: [
                { label: 'ID', field: 'id' },
                { label: 'Immatriculation', field: 'immatriculation' },
                { label: 'Marque', field: 'marque' },
                { label: 'Modèle', field: 'modele' },
                { label: 'Année', field: 'annee' },
                { label: 'État', field: 'etat' },
                { label: 'Catégorie', field: 'categorie' },
                { label: 'Total Contrats', field: 'total_contracts' },
                { label: 'Revenu Total', field: 'total_revenue' }
            ],
            payments: [
                { label: 'ID', field: 'id' },
                { label: 'Client', field: 'client.nom' },
                { label: 'Montant', field: 'montant' },
                { label: 'Méthode', field: 'methode' },
                { label: 'Date', field: 'date_paiement' },
                { label: 'Statut', field: 'statut' },
                { label: 'Référence', field: 'reference' }
            ]
        };
        return columnSets[reportType] || [];
    };

    const renderTable = () => {
        const columns = getTableColumns();

        if (data.length === 0) {
            return (
                <div className="text-center py-12 text-slate-400">
                    Aucune donnée trouvée
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-900/50 border-b border-slate-700">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {data.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                                {columns.map((col, colIdx) => {
                                    const value = col.field.split('.').reduce((obj, key) => obj?.[key], item);
                                    let displayValue = value !== null && value !== undefined ? value : '-';

                                    // Format dates
                                    if (col.field.includes('date') && value) {
                                        displayValue = new Date(value).toLocaleDateString();
                                    }

                                    // Format currency
                                    if (col.field.includes('montant') || col.field.includes('revenue')) {
                                        displayValue = `${parseFloat(displayValue || 0).toFixed(2)} DH`;
                                    }

                                    return (
                                        <td key={colIdx} className="px-6 py-4 text-sm text-slate-300">
                                            {displayValue}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Rapports</h1>
                    <p className="text-slate-400">Génération et export de rapports détaillés</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={exportToPDF}
                        disabled={data.length === 0}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        📄 Exporter PDF
                    </button>
                    <button
                        onClick={exportToExcel}
                        disabled={data.length === 0}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        📊 Exporter Excel
                    </button>
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">Type de Rapport</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { value: 'contracts', label: 'Contrats', icon: '📋' },
                        { value: 'quotes', label: 'Devis', icon: '📝' },
                        { value: 'clients', label: 'Clients', icon: '👥' },
                        { value: 'vehicles', label: 'Véhicules', icon: '🚗' },
                        { value: 'payments', label: 'Paiements', icon: '💰' }
                    ].map(type => (
                        <button
                            key={type.value}
                            onClick={() => {
                                setReportType(type.value);
                                resetFilters();
                            }}
                            className={`p-4 rounded-lg border-2 transition-all ${reportType === type.value
                                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                                : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                                }`}
                        >
                            <div className="text-2xl mb-2">{type.icon}</div>
                            <div className="font-medium">{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters Panel */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Date Début</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Date Fin</label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Client Filter */}
                    {['contracts', 'quotes', 'payments'].includes(reportType) && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Client</label>
                            <select
                                value={filters.client_id}
                                onChange={(e) => handleFilterChange('client_id', e.target.value)}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="">Tous</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.nom} {client.prenom}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Vehicle Filter */}
                    {['contracts', 'quotes'].includes(reportType) && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Véhicule</label>
                            <select
                                value={filters.vehicle_id}
                                onChange={(e) => handleFilterChange('vehicle_id', e.target.value)}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="">Tous</option>
                                {vehicles.map(vehicle => (
                                    <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.marque} {vehicle.modele} ({vehicle.immatriculation})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Agency Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Agence</label>
                        <select
                            value={filters.agency_id}
                            onChange={(e) => handleFilterChange('agency_id', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">Toutes</option>
                            {agences.map(agence => (
                                <option key={agence.id} value={agence.id}>{agence.nom}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    {['contracts', 'quotes', 'payments'].includes(reportType) && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Statut</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="">Tous</option>
                                <option value="actif">Actif</option>
                                <option value="termine">Terminé</option>
                                <option value="annule">Annulé</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                        Réinitialiser les filtres
                    </button>
                </div>
            </div>

            {/* Totals (for payments) */}
            {reportType === 'payments' && totals && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
                        <div className="text-sm text-green-400 mb-1">Montant Total</div>
                        <div className="text-3xl font-bold text-white">{totals.total_amount.toFixed(2)} DH</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
                        <div className="text-sm text-blue-400 mb-1">Nombre de Paiements</div>
                        <div className="text-3xl font-bold text-white">{totals.total_count}</div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                    </div>
                ) : (
                    renderTable()
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-slate-900/50 px-6 py-4 flex items-center justify-between border-t border-slate-700">
                        <div className="text-sm text-slate-400">
                            Affichage {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} résultats
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
        </div>
    );
};

export default Rapports;
