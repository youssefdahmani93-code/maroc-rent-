const express = require('express');
const router = express.Router();
const { Contrat, Client, Vehicule, Agence, User, Devis, Paiement } = require('../models');
const { Op } = require('sequelize');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const sequelize = require('../config/database');

// Apply authentication middleware to all report routes
router.use(authMiddleware);

// GET /api/reports/contracts - Contracts report with filters
router.get('/contracts', authorize('reports.view_contracts'), async (req, res) => {
    try {
        const {
            start_date,
            end_date,
            client_id,
            vehicle_id,
            agency_id,
            status,
            type,
            page = 1,
            limit = 50
        } = req.query;

        const where = {};

        // Date filters
        if (start_date && end_date) {
            where.date_debut = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        } else if (start_date) {
            where.date_debut = { [Op.gte]: new Date(start_date) };
        } else if (end_date) {
            where.date_debut = { [Op.lte]: new Date(end_date) };
        }

        // Other filters
        if (client_id) where.client_id = client_id;
        if (vehicle_id) where.vehicule_id = vehicle_id;
        if (agency_id) where.agence_id = agency_id;
        if (status) where.statut = status;
        if (type) where.type = type;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: contracts } = await Contrat.findAndCountAll({
            where,
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'nom', 'email', 'telephone']
                },
                {
                    model: Vehicule,
                    as: 'vehicule',
                    attributes: ['id', 'marque', 'modele', 'immatriculation']
                },
                {
                    model: Agence,
                    as: 'agence',
                    attributes: ['id', 'nom', 'ville']
                }
            ],
            order: [['date_debut', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            contracts,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching contracts report:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/reports/quotes - Quotes/Devis report with filters
router.get('/quotes', authorize('reports.view_quotes'), async (req, res) => {
    try {
        const {
            start_date,
            end_date,
            client_id,
            vehicle_id,
            agency_id,
            status,
            page = 1,
            limit = 50
        } = req.query;

        const where = {};

        // Date filters
        if (start_date && end_date) {
            where.date_debut = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        } else if (start_date) {
            where.date_debut = { [Op.gte]: new Date(start_date) };
        } else if (end_date) {
            where.date_debut = { [Op.lte]: new Date(end_date) };
        }

        // Other filters
        if (client_id) where.client_id = client_id;
        if (vehicle_id) where.vehicule_id = vehicle_id;
        if (agency_id) where.agence_id = agency_id;
        if (status) where.statut = status;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: quotes } = await Devis.findAndCountAll({
            where,
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'nom', 'email', 'telephone']
                },
                {
                    model: Vehicule,
                    as: 'vehicule',
                    attributes: ['id', 'marque', 'modele', 'immatriculation']
                },
                {
                    model: Agence,
                    as: 'agence',
                    attributes: ['id', 'nom', 'ville']
                }
            ],
            order: [['date_debut', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            quotes,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching quotes report:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/reports/clients - Clients report with statistics
router.get('/clients', authorize('reports.view_clients'), async (req, res) => {
    try {
        const {
            agency_id,
            created_after,
            created_before,
            page = 1,
            limit = 50
        } = req.query;

        const where = {};

        if (created_after && created_before) {
            where.createdAt = {
                [Op.between]: [new Date(created_after), new Date(created_before)]
            };
        } else if (created_after) {
            where.createdAt = { [Op.gte]: new Date(created_after) };
        } else if (created_before) {
            where.createdAt = { [Op.lte]: new Date(created_before) };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Get clients with contract statistics
        const clients = await Client.findAll({
            where,
            attributes: [
                'id',
                'nom',
                'email',
                'telephone',
                'adresse',
                'ville',
                'createdAt',
                [sequelize.fn('COUNT', sequelize.col('contrats.id')), 'total_contracts'],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('contrats.montant_total')), 0), 'total_revenue']
            ],
            include: [{
                model: Contrat,
                as: 'contrats',
                attributes: [],
                required: false,
                where: agency_id ? { agence_id: agency_id } : {}
            }],
            group: ['Client.id'],
            limit: parseInt(limit),
            offset,
            subQuery: false
        });

        const totalCount = await Client.count({ where });

        res.json({
            clients,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching clients report:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/reports/vehicles - Vehicles report with statistics
router.get('/vehicles', authorize('reports.view_vehicles'), async (req, res) => {
    try {
        const {
            agency_id,
            etat,
            categorie,
            page = 1,
            limit = 50
        } = req.query;

        const where = {};

        if (agency_id) where.agence_id = agency_id;
        if (etat) where.etat = etat;
        if (categorie) where.categorie = categorie;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Get vehicles with contract statistics
        const vehicles = await Vehicule.findAll({
            where,
            attributes: [
                'id',
                'immatriculation',
                'marque',
                'modele',
                'annee',
                'etat',
                'categorie',
                'km',
                'prix_jour',
                [sequelize.fn('COUNT', sequelize.col('contrats.id')), 'total_contracts'],
                [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('contrats.montant_total')), 0), 'total_revenue']
            ],
            include: [
                {
                    model: Agence,
                    as: 'agence',
                    attributes: ['id', 'nom', 'ville']
                },
                {
                    model: Contrat,
                    as: 'contrats',
                    attributes: [],
                    required: false
                }
            ],
            group: ['Vehicule.id', 'agence.id'],
            limit: parseInt(limit),
            offset,
            subQuery: false
        });

        const totalCount = await Vehicule.count({ where });

        res.json({
            vehicles,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching vehicles report:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/reports/payments - Payments report with filters
router.get('/payments', authorize('reports.view_payments'), async (req, res) => {
    try {
        const {
            start_date,
            end_date,
            client_id,
            contract_id,
            methode,
            statut,
            page = 1,
            limit = 50
        } = req.query;

        const where = {};

        // Date filters
        if (start_date && end_date) {
            where.date_paiement = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        } else if (start_date) {
            where.date_paiement = { [Op.gte]: new Date(start_date) };
        } else if (end_date) {
            where.date_paiement = { [Op.lte]: new Date(end_date) };
        }

        // Other filters
        if (client_id) where.client_id = client_id;
        if (contract_id) where.reference_id = contract_id;
        if (methode) where.methode = methode;
        if (statut) where.statut = statut;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows: payments } = await Paiement.findAndCountAll({
            where,
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'nom', 'email']
                }
            ],
            order: [['date_paiement', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        // Calculate totals
        const totals = await Paiement.findOne({
            where,
            attributes: [
                [sequelize.fn('SUM', sequelize.col('montant')), 'total_amount'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'total_count']
            ],
            raw: true
        });

        res.json({
            payments,
            totals: {
                total_amount: parseFloat(totals.total_amount) || 0,
                total_count: parseInt(totals.total_count) || 0
            },
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching payments report:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
