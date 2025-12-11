const express = require('express');
const router = express.Router();
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const Vehicule = require('../models/Vehicule');
const Contrat = require('../models/Contrat');
const Reservation = require('../models/Reservation');
const Paiement = require('../models/Paiement');
const Client = require('../models/Client');
const Maintenance = require('../models/Maintenance');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply authentication middleware to all dashboard routes
router.use(authMiddleware);

// GET /api/dashboard/stats - General statistics
router.get('/stats', async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const [
            totalVehicules,
            vehiculesDisponibles,
            vehiculesLoues,
            vehiculesMaintenance,
            contratsActifs,
            totalReservations,
            paiementsMois
        ] = await Promise.all([
            Vehicule.count(),
            Vehicule.count({ where: { etat: 'disponible' } }),
            Vehicule.count({ where: { etat: 'reserve' } }), // Assuming 'reserve' means rented/booked
            Vehicule.count({ where: { etat: 'en_maintenance' } }),
            Contrat.count({ where: { statut: 'actif' } }),
            Reservation.count(),
            Paiement.sum('montant_paye', {
                where: {
                    date_paiement: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            })
        ]);

        res.json({
            totalVehicules,
            vehiculesDisponibles,
            vehiculesLoues,
            vehiculesMaintenance,
            contratsActifs,
            totalReservations,
            chiffreAffairesMois: paiementsMois || 0
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
    }
});

// GET /api/dashboard/charts/revenue - Monthly revenue for the current year
router.get('/charts/revenue', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const endOfYear = new Date(currentYear, 11, 31);

        const revenueByMonth = await Paiement.findAll({
            attributes: [
                [sequelize.fn('to_char', sequelize.col('date_paiement'), 'Month'), 'month'], // PostgreSQL specific
                [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM date_paiement')), 'monthNum'],
                [sequelize.fn('SUM', sequelize.col('montant_paye')), 'total']
            ],
            where: {
                date_paiement: {
                    [Op.between]: [startOfYear, endOfYear]
                }
            },
            group: [sequelize.fn('to_char', sequelize.col('date_paiement'), 'Month'), sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM date_paiement'))],
            order: [[sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM date_paiement')), 'ASC']]
        });

        // Format for frontend
        const formattedData = revenueByMonth.map(item => ({
            name: item.get('month').trim(),
            total: parseFloat(item.get('total'))
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching revenue chart:', error);
        // Fallback for non-Postgres or error
        res.status(500).json([]);
    }
});

// GET /api/dashboard/charts/fleet - Fleet status distribution
router.get('/charts/fleet', async (req, res) => {
    try {
        const fleetStatus = await Vehicule.findAll({
            attributes: [
                'etat',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['etat']
        });

        const formattedData = fleetStatus.map(item => ({
            name: item.etat,
            value: parseInt(item.get('count'))
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching fleet chart:', error);
        res.status(500).json([]);
    }
});

// GET /api/dashboard/charts/vehicle-types - Vehicle type distribution
router.get('/charts/vehicle-types', async (req, res) => {
    try {
        const typeDistribution = await Vehicule.findAll({
            attributes: [
                'carburant',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['carburant']
        });

        const formattedData = typeDistribution.map(item => ({
            name: item.carburant,
            value: parseInt(item.get('count'))
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching vehicle types chart:', error);
        res.status(500).json([]);
    }
});

// GET /api/dashboard/tables/latest-contracts
router.get('/tables/latest-contracts', async (req, res) => {
    try {
        const contracts = await Contrat.findAll({
            limit: 5,
            order: [['cree_le', 'DESC']],
            include: [
                { model: Client, as: 'client', attributes: ['nom', 'telephone'] },
                { model: Vehicule, as: 'vehicule', attributes: ['marque', 'modele', 'immatriculation'] }
            ]
        });
        res.json(contracts);
    } catch (error) {
        console.error('Error fetching latest contracts:', error);
        res.status(500).json([]);
    }
});

// GET /api/dashboard/tables/upcoming-reservations
router.get('/tables/upcoming-reservations', async (req, res) => {
    try {
        const reservations = await Reservation.findAll({
            where: {
                date_debut: {
                    [Op.gte]: new Date()
                },
                statut: {
                    [Op.ne]: 'annulee'
                }
            },
            limit: 5,
            order: [['date_debut', 'ASC']],
            include: [
                { model: Client, as: 'client', attributes: ['nom', 'telephone'] },
                { model: Vehicule, as: 'vehicule', attributes: ['marque', 'modele'] }
            ]
        });
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching upcoming reservations:', error);
        res.status(500).json([]);
    }
});

// GET /api/dashboard/alerts
router.get('/alerts', async (req, res) => {
    try {
        const today = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(today.getDate() + 7);

        const [insuranceAlerts, techVisitAlerts, maintenanceAlerts] = await Promise.all([
            Vehicule.findAll({
                where: {
                    assurance_expire_le: {
                        [Op.between]: [today, sevenDaysLater]
                    }
                },
                attributes: ['id', 'marque', 'modele', 'immatriculation', 'assurance_expire_le']
            }),
            Vehicule.findAll({
                where: {
                    visite_technique_expire_le: {
                        [Op.between]: [today, sevenDaysLater]
                    }
                },
                attributes: ['id', 'marque', 'modele', 'immatriculation', 'visite_technique_expire_le']
            }),
            Maintenance.findAll({
                where: {
                    statut: 'en_cours'
                },
                include: [{ model: Vehicule, as: 'vehicule', attributes: ['marque', 'modele', 'immatriculation'] }]
            })
        ]);

        const alerts = [
            ...insuranceAlerts.map(v => ({
                type: 'assurance',
                message: `Assurance expire le ${new Date(v.assurance_expire_le).toLocaleDateString()}`,
                vehicule: `${v.marque} ${v.modele} (${v.immatriculation})`,
                severity: 'warning'
            })),
            ...techVisitAlerts.map(v => ({
                type: 'visite_technique',
                message: `Visite technique expire le ${new Date(v.visite_technique_expire_le).toLocaleDateString()}`,
                vehicule: `${v.marque} ${v.modele} (${v.immatriculation})`,
                severity: 'warning'
            })),
            ...maintenanceAlerts.map(m => ({
                type: 'maintenance',
                message: `En maintenance: ${m.type_maintenance}`,
                vehicule: `${m.vehicule.marque} ${m.vehicule.modele} (${m.vehicule.immatriculation})`,
                severity: 'info'
            }))
        ];

        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json([]);
    }
});

module.exports = router;
