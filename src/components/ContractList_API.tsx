import React, { useState, useEffect } from 'react';
import {
    Plus, Search, FileText, Printer, Download, Eye,
    Edit, Trash2, CheckCircle, XCircle, Calendar,
    User, Car, ArrowRight, PenTool, Loader2, DollarSign
} from 'lucide-react';
import { formatCurrency, AGENCIES } from '../constants';
import { Contract, ContractStatus, Client, Vehicle } from '../types';
import { contractsAPI, clientsAPI, vehiclesAPI } from '../lib/api';

type ViewMode = 'LIST' | 'FORM' | 'DETAILS';

export const ContractList: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('LIST');

    // Data States
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    const [loading, setLoading] = useState(true);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Empty form state
    const initialFormState: any = {
        id: '',
        type: 'contrat',
        client_id: '',
        vehicule_id: '',
        date_debut: new Date().toISOString().split('T')[0],
        date_fin: '',
        lieu_depart: AGENCIES[0],
        lieu_retour: AGENCIES[0],
        prix_journalier: 0,
        nombre_jours: 1,
        reduction: 0,
        montant_total: 0,
        caution: 0,
        acompte: 0,
        statut: 'brouillon',
        notes: ''
    };

    const [formData, setFormData] = useState<any>(initialFormState);

    // --- 1. Fetch Data (Contracts, Clients, Vehicles) ---
    const fetchData = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching contracts data from Backend API...');

            // 1. Get Contracts
            const contractsRes = await contractsAPI.getAll();
            console.log('📊 Contracts Data:', contractsRes.data);

            // 2. Get Clients
            const clientsRes = await clientsAPI.getAll();
            console.log('👥 Clients Data:', clientsRes.data?.length, 'clients');

            // 3. Get Vehicles
            const vehiclesRes = await vehiclesAPI.getAll();
            console.log('🚗 Vehicles Data:', vehiclesRes.data?.length, 'vehicles');

            if (contractsRes.data) {
                // Map Backend data to Frontend format
                const formattedContracts = contractsRes.data.map((c: any) => ({
                    id: c.id,
                    type: c.type,
                    status: c.statut,
                    contractNumber: c.numero,
                    startDate: c.date_debut?.split('T')[0],
                    endDate: c.date_fin?.split('T')[0],
                    pickupLocation: c.lieu_depart,
                    returnLocation: c.lieu_retour,
                    dailyRate: c.prix_journalier,
                    totalDays: c.nombre_jours,
                    totalAmount: c.montant_total,
                    paidAmount: c.acompte,
                    deposit: c.caution,
                    // Relations
                    client: {
                        id: c.client?.id,
                        fullName: c.client?.nom || 'Inconnu',
                        phone: c.client?.telephone,
                        docNumber: c.client?.cin,
                        licenseNumber: c.client?.permis,
                        address: c.client?.adresse
                    },
                    vehicle: {
                        id: c.vehicule?.id,
                        brand: c.vehicule?.marque,
                        model: c.vehicule?.modele,
                        plate: c.vehicule?.immatriculation
                    },
                    // Flat IDs for editing
                    clientId: c.client_id,
                    vehicleId: c.vehicule_id
                }));
                setContracts(formattedContracts);
                console.log('✅ Formatted contracts:', formattedContracts.length);
            }

            if (clientsRes.data) {
                setClients(clientsRes.data.map((c: any) => ({
                    ...c,
                    id: c.id,
                    fullName: c.nom
                })));
            }

            if (vehiclesRes.data) {
                setVehicles(vehiclesRes.data.map((v: any) => ({
                    ...v,
                    id: v.id,
                    dailyRate: v.prix_journalier
                })));
            }

        } catch (error) {
            console.error('❌ Error fetching data:', error);
            alert('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Calculations ---
    const calculateTotal = (days: number, rate: number, discount: number = 0) => {
        return (days * rate) - discount;
    };

    // --- 2. Handle Save ---
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        console.log('🔵 Starting handleSave...');
        console.log('📝 Form Data:', formData);

        const total = calculateTotal(formData.nombre_jours, formData.prix_journalier, formData.reduction);

        const contractPayload = {
            type: formData.type,
            statut: formData.statut,
            client_id: formData.client_id,
            vehicule_id: formData.vehicule_id,
            date_debut: formData.date_debut,
            date_fin: formData.date_fin,
            lieu_depart: formData.lieu_depart,
            lieu_retour: formData.lieu_retour,
            prix_journalier: formData.prix_journalier,
            nombre_jours: formData.nombre_jours,
            reduction: formData.reduction,
            montant_total: total,
            caution: formData.caution,
            acompte: formData.acompte,
            notes: formData.notes
        };

        console.log('📦 Contract Payload:', contractPayload);

        try {
            if (formData.id) {
                // Update
                console.log('🔄 Updating contract with ID:', formData.id);
                const { data } = await contractsAPI.update(formData.id, contractPayload);
                console.log('✅ Update Success:', data);
            } else {
                // Create
                console.log('➕ Creating new contract...');
                const { data } = await contractsAPI.create(contractPayload);
                console.log('✅ Insert Success:', data);
            }

            console.log('🔄 Refreshing data...');
            await fetchData();
            setViewMode('LIST');
            setFormData(initialFormState);
            console.log('✅ Contract saved successfully!');
        } catch (error: any) {
            console.error('❌ Error saving contract:', error);
            console.error('Error message:', error.response?.data?.message || error.message);
            alert('Erreur: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // --- 3. Handle Delete ---
    const handleDelete = async (id: string) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce contrat ?')) {
            try {
                await contractsAPI.delete(id);
                setContracts(contracts.filter(c => c.id !== id));
            } catch (error) {
                console.error(error);
                alert('Erreur de suppression');
            }
        }
    };

    // --- Helper to Auto-fill Vehicle Price ---
    const handleVehicleChange = (vehicleId: string) => {
        const v = vehicles.find(v => v.id === vehicleId);
        if (v) {
            setFormData({
                ...formData,
                vehicule_id: vehicleId,
                prix_journalier: v.dailyRate
            });
        }
    };

    // --- Render Helpers ---
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'actif': return 'bg-green-100 text-green-800';
            case 'termine': return 'bg-blue-100 text-blue-800';
            case 'annule': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

// Continue with the rest of the component...
// (renderList, renderForm, renderDetails functions remain the same)
