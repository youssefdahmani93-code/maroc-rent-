const express = require('express');
const router = express.Router();
const { Paiement, Client, Contrat, Reservation, User, Vehicule } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// GET /api/paiements - Liste tous les paiements avec filtres
router.get('/', async (req, res) => {
    try {
        const { client_id, type_paiement, statut, methode_paiement, date_debut, date_fin } = req.query;
        const where = {};

        if (client_id) where.client_id = client_id;
        if (type_paiement) where.type_paiement = type_paiement;
        if (statut) where.statut = statut;
        if (methode_paiement) where.methode_paiement = methode_paiement;

        if (date_debut && date_fin) {
            where.date_paiement = { [Op.between]: [date_debut, date_fin] };
        }

        const paiements = await Paiement.findAll({
            where,
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'nom', 'telephone']
                },
                {
                    model: Contrat,
                    as: 'contrat',
                    attributes: ['id', 'numero'],
                    required: false,
                    include: [{ model: Vehicule, as: 'vehicule', attributes: ['marque', 'modele'] }]
                },
                {
                    model: Reservation,
                    as: 'reservation',
                    attributes: ['id'],
                    required: false,
                    include: [{ model: Vehicule, as: 'vehicule', attributes: ['marque', 'modele'] }]
                }
            ],
            order: [['date_paiement', 'DESC']]
        });

        res.json(paiements);
    } catch (error) {
        console.error('Error fetching paiements:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// ... (le reste du fichier reste inchangé)

// GET /api/paiements/stats - Statistiques des paiements
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Total paiements du jour
        const totalJour = await Paiement.sum('montant_paye', {
            where: {
                date_paiement: {
                    [Op.gte]: today
                },
                statut: { [Op.in]: ['paye', 'partiel'] }
            }
        });

        // Total paiements du mois
        const totalMois = await Paiement.sum('montant_paye', {
            where: {
                date_paiement: {
                    [Op.gte]: thisMonth
                },
                statut: { [Op.in]: ['paye', 'partiel'] }
            }
        });

        // Total impayés
        const totalImpayes = await Paiement.sum('reste_a_payer', {
            where: {
                reste_a_payer: {
                    [Op.gt]: 0
                }
            }
        });

        // Paiements en attente
        const enAttente = await Paiement.count({
            where: {
                statut: 'en_attente'
            }
        });

        // Méthode la plus utilisée
        const methodesStats = await Paiement.findAll({
            attributes: [
                'methode_paiement',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['methode_paiement'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 1,
            raw: true
        });

        res.json({
            total_jour: totalJour || 0,
            total_mois: totalMois || 0,
            total_impayes: totalImpayes || 0,
            en_attente: enAttente || 0,
            methode_plus_utilisee: methodesStats[0] || null
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// GET /api/paiements/:id - Détails d'un paiement
router.get('/:id', async (req, res) => {
    try {
        const paiement = await Paiement.findByPk(req.params.id, {
            include: [
                { model: Client, as: 'client' },
                { model: User, as: 'createur' }
            ]
        });

        if (!paiement) {
            return res.status(404).json({ message: 'Paiement non trouvé' });
        }

        res.json(paiement);
    } catch (error) {
        console.error('Error fetching paiement:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST /api/paiements - Créer un nouveau paiement
router.post('/', async (req, res) => {
    try {
        console.log('POST /api/paiements - Request received');
        console.log('Request body:', req.body);

        // Calculer reste à payer
        const montantTotal = parseFloat(req.body.montant_total);
        const montantPaye = parseFloat(req.body.montant_paye);
        const resteAPayer = montantTotal - montantPaye;

        // Déterminer le statut
        let statut = 'non_paye';
        if (montantPaye >= montantTotal) {
            statut = 'paye';
        } else if (montantPaye > 0) {
            statut = 'partiel';
        }

        const paiement = await Paiement.create({
            ...req.body,
            reste_a_payer: resteAPayer,
            statut: statut
        });

        // Si paiement lié à un contrat, mettre à jour le contrat
        if (req.body.type_paiement === 'contrat' && req.body.reference_id) {
            await Contrat.update(
                {
                    reste_a_payer: resteAPayer,
                    statut: statut === 'paye' ? 'paye' : 'partiel'
                },
                { where: { id: req.body.reference_id } }
            );
        }

        // Si paiement lié à une réservation, mettre à jour la réservation (optionnel, selon logique métier)
        // Par exemple, si acompte payé, on pourrait considérer la réservation comme confirmée si elle ne l'était pas
        // Si paiement lié à une réservation, mettre à jour la réservation
        if (req.body.type_paiement === 'reservation' && req.body.reference_id) {
            const reservation = await Reservation.findByPk(req.body.reference_id);
            if (reservation) {
                const nouvelAcompte = parseFloat(reservation.acompte || 0) + parseFloat(req.body.montant_paye);

                const updateData = {
                    acompte: nouvelAcompte
                };

                // Si la réservation est en attente et qu'un acompte est payé, on la confirme
                if (reservation.statut === 'en_attente' && nouvelAcompte > 0) {
                    updateData.statut = 'confirmee';
                }

                await reservation.update(updateData);
            }
        }

        res.status(201).json(paiement);
    } catch (error) {
        console.error('Error creating paiement:', error);
        res.status(500).json({ message: 'Erreur lors de la création', error: error.message });
    }
});

// PUT /api/paiements/:id - Modifier un paiement
router.put('/:id', async (req, res) => {
    try {
        const paiement = await Paiement.findByPk(req.params.id);

        if (!paiement) {
            return res.status(404).json({ message: 'Paiement non trouvé' });
        }

        // Recalculer reste à payer si montants changent
        if (req.body.montant_total || req.body.montant_paye) {
            const montantTotal = parseFloat(req.body.montant_total || paiement.montant_total);
            const montantPaye = parseFloat(req.body.montant_paye || paiement.montant_paye);
            req.body.reste_a_payer = montantTotal - montantPaye;

            // Mettre à jour statut
            if (montantPaye >= montantTotal) {
                req.body.statut = 'paye';
            } else if (montantPaye > 0) {
                req.body.statut = 'partiel';
            }
        }

        await paiement.update(req.body);
        res.json(paiement);
    } catch (error) {
        console.error('Error updating paiement:', error);
        res.status(500).json({ message: 'Erreur lors de la modification' });
    }
});

// DELETE /api/paiements/:id - Supprimer un paiement
router.delete('/:id', async (req, res) => {
    try {
        const paiement = await Paiement.findByPk(req.params.id);

        if (!paiement) {
            return res.status(404).json({ message: 'Paiement non trouvé' });
        }

        await paiement.destroy();
        res.json({ message: 'Paiement supprimé avec succès' });
    } catch (error) {
        console.error('Error deleting paiement:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

module.exports = router;
