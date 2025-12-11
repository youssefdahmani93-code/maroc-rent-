const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Vehicule = require('../models/Vehicule');
const { Op } = require('sequelize');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Apply authentication middleware to all maintenance routes
router.use(authMiddleware);

// GET /api/maintenance - Liste toutes les maintenances
router.get('/', async (req, res) => {
    try {
        const { statut, type, vehicule_id, urgent } = req.query;
        const where = {};

        if (statut) where.statut = statut;
        if (type) where.type = type;
        if (vehicule_id) where.vehicule_id = vehicule_id;
        if (urgent === 'true') where.statut = 'urgent';

        const maintenances = await Maintenance.findAll({
            where,
            include: [{
                model: Vehicule,
                as: 'vehicule',
                attributes: ['id', 'marque', 'modele', 'immatriculation', 'km']
            }],
            order: [['date_entree', 'DESC']]
        });

        res.json(maintenances);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/maintenance/alerts - Alertes de maintenance
router.get('/alerts', async (req, res) => {
    try {
        const vehicules = await Vehicule.findAll({
            include: [{
                model: Maintenance,
                as: 'maintenances',
                order: [['cree_le', 'DESC']],
                limit: 1
            }]
        });

        const alerts = [];
        const today = new Date();
        const in30Days = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

        vehicules.forEach(vehicule => {
            const lastMaintenance = vehicule.maintenances[0];

            // Alerte vidange
            if (lastMaintenance && lastMaintenance.prochaine_vidange_km) {
                if (vehicule.km >= lastMaintenance.prochaine_vidange_km - 500) {
                    alerts.push({
                        type: 'vidange',
                        vehicule_id: vehicule.id,
                        vehicule: `${vehicule.marque} ${vehicule.modele}`,
                        message: `Vidange nécessaire (${vehicule.km}/${lastMaintenance.prochaine_vidange_km} km)`,
                        urgent: vehicule.km >= lastMaintenance.prochaine_vidange_km
                    });
                }
            }

            // Alerte contrôle technique
            if (lastMaintenance && lastMaintenance.prochaine_visite_technique) {
                const visiteTechnique = new Date(lastMaintenance.prochaine_visite_technique);
                if (visiteTechnique <= in30Days) {
                    alerts.push({
                        type: 'controle_technique',
                        vehicule_id: vehicule.id,
                        vehicule: `${vehicule.marque} ${vehicule.modele}`,
                        message: `Contrôle technique à faire avant le ${visiteTechnique.toLocaleDateString('fr-FR')}`,
                        urgent: visiteTechnique <= today
                    });
                }
            }

            // Alerte assurance
            if (lastMaintenance && lastMaintenance.prochaine_assurance) {
                const assurance = new Date(lastMaintenance.prochaine_assurance);
                if (assurance <= in30Days) {
                    alerts.push({
                        type: 'assurance',
                        vehicule_id: vehicule.id,
                        vehicule: `${vehicule.marque} ${vehicule.modele}`,
                        message: `Assurance à renouveler avant le ${assurance.toLocaleDateString('fr-FR')}`,
                        urgent: assurance <= today
                    });
                }
            }
        });

        res.json(alerts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/maintenance/:id - Détails d'une maintenance
router.get('/:id', async (req, res) => {
    try {
        const maintenance = await Maintenance.findByPk(req.params.id, {
            include: [{
                model: Vehicule,
                as: 'vehicule'
            }]
        });

        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance non trouvée' });
        }

        res.json(maintenance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/maintenance/vehicule/:vehicule_id - Historique de maintenance d'un véhicule
router.get('/vehicule/:vehicule_id', async (req, res) => {
    try {
        const maintenances = await Maintenance.findAll({
            where: { vehicule_id: req.params.vehicule_id },
            order: [['date_entree', 'DESC']]
        });

        // Calculer les statistiques
        const stats = {
            total_maintenances: maintenances.length,
            cout_total: maintenances.reduce((sum, m) => sum + parseFloat(m.cout_total), 0),
            cout_annee_actuelle: maintenances
                .filter(m => new Date(m.date_entree).getFullYear() === new Date().getFullYear())
                .reduce((sum, m) => sum + parseFloat(m.cout_total), 0),
            cout_annee_precedente: maintenances
                .filter(m => new Date(m.date_entree).getFullYear() === new Date().getFullYear() - 1)
                .reduce((sum, m) => sum + parseFloat(m.cout_total), 0)
        };

        res.json({ maintenances, stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST /api/maintenance - Créer une nouvelle maintenance
router.post('/', async (req, res) => {
    try {
        console.log('Creating maintenance with data:', req.body);

        // Calculer le coût total
        const coutTotal = parseFloat(req.body.cout_pieces || 0) + parseFloat(req.body.cout_main_oeuvre || 0);

        const maintenance = await Maintenance.create({
            ...req.body,
            cout_total: coutTotal
        });

        // Mettre à jour le statut du véhicule si nécessaire
        if (req.body.statut === 'en_cours') {
            await Vehicule.update(
                { etat: 'en_maintenance' },
                { where: { id: req.body.vehicule_id } }
            );
        }

        res.status(201).json(maintenance);
    } catch (error) {
        console.error('Error creating maintenance:', error);

        // Handle validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Erreur de validation',
                errors: error.errors.map(e => ({ field: e.path, message: e.message }))
            });
        }

        res.status(500).json({
            message: 'Erreur lors de la création de la maintenance',
            error: error.message
        });
    }
});

// PUT /api/maintenance/:id - Modifier une maintenance
router.put('/:id', async (req, res) => {
    try {
        const maintenance = await Maintenance.findByPk(req.params.id);

        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance non trouvée' });
        }

        // Recalculer le coût total si nécessaire
        if (req.body.cout_pieces || req.body.cout_main_oeuvre) {
            const coutPieces = req.body.cout_pieces || maintenance.cout_pieces;
            const coutMainOeuvre = req.body.cout_main_oeuvre || maintenance.cout_main_oeuvre;
            req.body.cout_total = parseFloat(coutPieces) + parseFloat(coutMainOeuvre);
        }

        // Si la maintenance est terminée, remettre le véhicule disponible
        if (req.body.statut === 'termine' && maintenance.statut !== 'termine') {
            await Vehicule.update(
                { etat: 'disponible' },
                { where: { id: maintenance.vehicule_id } }
            );
        }

        await maintenance.update(req.body);
        res.json(maintenance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification' });
    }
});

// DELETE /api/maintenance/:id - Supprimer une maintenance
router.delete('/:id', async (req, res) => {
    try {
        const maintenance = await Maintenance.findByPk(req.params.id);

        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance non trouvée' });
        }

        // Vérifier s'il y a une facture associée
        if (maintenance.facture_path) {
            return res.status(400).json({
                message: 'Impossible de supprimer cette maintenance car elle a une facture associée'
            });
        }

        await maintenance.destroy();
        res.json({ message: 'Maintenance supprimée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

module.exports = router;
