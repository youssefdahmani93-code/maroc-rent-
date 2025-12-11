const express = require('express');
const router = express.Router();
const { Reservation, Client, Vehicule, Agence, Contrat, Paiement, Maintenance } = require('../models');
const { Op } = require('sequelize');

// GET /api/reservations - Liste toutes les réservations
router.get('/', async (req, res) => {
    try {
        const { statut, client_id, vehicule_id, search } = req.query;
        const where = {};

        if (statut) where.statut = statut;
        if (client_id) where.client_id = client_id;
        if (vehicule_id) where.vehicule_id = vehicule_id;

        const reservations = await Reservation.findAll({
            include: [
                { model: Client, as: 'client' },
                { model: Vehicule, as: 'vehicule' },
                { model: Contrat, as: 'contrat' }
            ],
            order: [['id', 'DESC']]
        });

        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/reservations/check-availability - Vérifier la disponibilité d'un véhicule
router.get('/check-availability', async (req, res) => {
    try {
        const { vehicule_id, date_debut, date_fin, exclude_reservation_id } = req.query;

        if (!vehicule_id || !date_debut || !date_fin) {
            return res.status(400).json({ message: 'Paramètres manquants' });
        }

        const where = {
            vehicule_id: vehicule_id,
            statut: { [Op.in]: ['en_attente', 'confirmee', 'en_cours'] },
            [Op.or]: [
                {
                    date_debut: {
                        [Op.between]: [new Date(date_debut), new Date(date_fin)]
                    }
                },
                {
                    date_fin: {
                        [Op.between]: [new Date(date_debut), new Date(date_fin)]
                    }
                },
                {
                    [Op.and]: [
                        { date_debut: { [Op.lte]: new Date(date_debut) } },
                        { date_fin: { [Op.gte]: new Date(date_fin) } }
                    ]
                }
            ]
        };

        if (exclude_reservation_id) {
            where.id = { [Op.ne]: exclude_reservation_id };
        }

        const conflictingReservations = await Reservation.findAll({ where });

        // Check for conflicting maintenance
        const conflictingMaintenances = await Maintenance.findAll({
            where: {
                vehicule_id: vehicule_id,
                statut: { [Op.ne]: 'termine' },
                [Op.or]: [
                    {
                        date_entree: {
                            [Op.between]: [new Date(date_debut), new Date(date_fin)]
                        }
                    },
                    {
                        date_sortie_prevue: {
                            [Op.between]: [new Date(date_debut), new Date(date_fin)]
                        }
                    },
                    {
                        [Op.and]: [
                            { date_entree: { [Op.lte]: new Date(date_debut) } },
                            { date_sortie_prevue: { [Op.gte]: new Date(date_fin) } }
                        ]
                    },
                    {
                        [Op.and]: [
                            { date_entree: { [Op.lte]: new Date(date_fin) } },
                            { date_sortie_prevue: null }
                        ]
                    }
                ]
            }
        });

        const available = conflictingReservations.length === 0 && conflictingMaintenances.length === 0;

        let message = 'Véhicule disponible';
        if (conflictingReservations.length > 0) {
            message = 'Véhicule déjà réservé pour cette période';
        } else if (conflictingMaintenances.length > 0) {
            message = 'Véhicule en maintenance pour cette période';
        }

        res.json({
            available,
            conflicts: conflictingReservations.length,
            message
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/reservations/:id - Détails d'une réservation
router.get('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id, {
            include: [
                { model: Client, as: 'client' },
                { model: Vehicule, as: 'vehicule' },
                { model: Agence, as: 'agence_retrait' },
                { model: Agence, as: 'agence_retour' },
                { model: Contrat, as: 'contrat' }
            ]
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }

        res.json(reservation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST /api/reservations - Créer une nouvelle réservation
router.post('/', async (req, res) => {
    try {
        // Vérifier la disponibilité
        const { vehicule_id, date_debut, date_fin } = req.body;

        // Calculate caution if not provided
        if (req.body.caution === undefined || req.body.caution === null) {
            const { Setting } = require('../models');
            const cautionSetting = await Setting.findByPk('caution_percentage');
            let cautionPercentage = 0;
            if (cautionSetting) {
                cautionPercentage = parseFloat(cautionSetting.value);
            }

            // Default to 10% if not set, or use 0 if that's the policy. 
            // Let's assume if setting is missing, we default to 0 to avoid surprises, 
            // or maybe 10% as a safe default? The plan mentioned "Default to a fixed amount if percentage is not set".
            // Let's use 10% as a reasonable default if the setting exists but is invalid, or 0 if setting doesn't exist.
            // Actually, let's stick to the plan: "Calculate caution = prix_total * (caution_percentage / 100)".

            if (req.body.prix_total) {
                req.body.caution = (parseFloat(req.body.prix_total) * cautionPercentage) / 100;
            }
        }

        const conflictingReservations = await Reservation.findAll({
            where: {
                vehicule_id: vehicule_id,
                statut: { [Op.in]: ['en_attente', 'confirmee', 'en_cours'] },
                [Op.or]: [
                    {
                        date_debut: {
                            [Op.between]: [new Date(date_debut), new Date(date_fin)]
                        }
                    },
                    {
                        date_fin: {
                            [Op.between]: [new Date(date_debut), new Date(date_fin)]
                        }
                    },
                    {
                        [Op.and]: [
                            { date_debut: { [Op.lte]: new Date(date_debut) } },
                            { date_fin: { [Op.gte]: new Date(date_fin) } }
                        ]
                    }
                ]
            }
        });

        if (conflictingReservations.length > 0) {
            return res.status(400).json({
                message: 'Ce véhicule est déjà réservé pour cette période'
            });
        }

        // Check for conflicting maintenance
        const conflictingMaintenances = await Maintenance.findAll({
            where: {
                vehicule_id: vehicule_id,
                statut: { [Op.ne]: 'termine' },
                [Op.or]: [
                    {
                        date_entree: {
                            [Op.between]: [new Date(date_debut), new Date(date_fin)]
                        }
                    },
                    {
                        date_sortie_prevue: {
                            [Op.between]: [new Date(date_debut), new Date(date_fin)]
                        }
                    },
                    {
                        [Op.and]: [
                            { date_entree: { [Op.lte]: new Date(date_debut) } },
                            { date_sortie_prevue: { [Op.gte]: new Date(date_fin) } }
                        ]
                    },
                    {
                        [Op.and]: [
                            { date_entree: { [Op.lte]: new Date(date_fin) } },
                            { date_sortie_prevue: null }
                        ]
                    }
                ]
            }
        });

        if (conflictingMaintenances.length > 0) {
            return res.status(400).json({
                message: 'Ce véhicule est en maintenance pour cette période'
            });
        }

        const reservation = await Reservation.create(req.body);

        // Mettre à jour le statut du véhicule
        await Vehicule.update(
            { etat: 'reserve' },
            { where: { id: req.body.vehicule_id } }
        );

        // Incrémenter le nombre de réservations du client
        await Client.increment('nombre_reservations', {
            where: { id: req.body.client_id }
        });

        // Créer le paiement pour l'acompte si présent
        // Créer le paiement pour l'acompte si présent
        if (req.body.acompte > 0 && req.body.methode_paiement) {
            const montantTotal = parseFloat(req.body.prix_total);
            const montantPaye = parseFloat(req.body.acompte);
            const reste = montantTotal - montantPaye;

            await Paiement.create({
                client_id: req.body.client_id,
                type_paiement: 'reservation',
                reference_id: reservation.id,
                montant_total: montantTotal,
                montant_paye: montantPaye,
                reste_a_payer: reste,
                methode_paiement: req.body.methode_paiement,
                statut: reste > 0 ? 'partiel' : 'paye',
                date_paiement: new Date(),
                notes: 'Acompte réservation'
            });
        }

        res.status(201).json(reservation);
    } catch (error) {
        console.error('Erreur création réservation:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Erreur de validation',
                errors: error.errors.map(e => e.message)
            });
        }
        res.status(500).json({
            message: 'Erreur lors de la création de la réservation',
            error: error.message
        });
    }
});

// PUT /api/reservations/:id - Modifier une réservation
router.put('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }

        // Si changement de véhicule ou de dates, vérifier la disponibilité
        if (req.body.vehicule_id || req.body.date_debut || req.body.date_fin) {
            const vehicule_id = req.body.vehicule_id || reservation.vehicule_id;
            const date_debut = req.body.date_debut || reservation.date_debut;
            const date_fin = req.body.date_fin || reservation.date_fin;

            const conflictingReservations = await Reservation.findAll({
                where: {
                    id: { [Op.ne]: req.params.id },
                    vehicule_id: vehicule_id,
                    statut: { [Op.in]: ['en_attente', 'confirmee', 'en_cours'] },
                    [Op.or]: [
                        {
                            date_debut: {
                                [Op.between]: [new Date(date_debut), new Date(date_fin)]
                            }
                        },
                        {
                            date_fin: {
                                [Op.between]: [new Date(date_debut), new Date(date_fin)]
                            }
                        },
                        {
                            [Op.and]: [
                                { date_debut: { [Op.lte]: new Date(date_debut) } },
                                { date_fin: { [Op.gte]: new Date(date_fin) } }
                            ]
                        }
                    ]
                }
            });

            if (conflictingReservations.length > 0) {
                return res.status(400).json({
                    message: 'Ce véhicule est déjà réservé pour cette période'
                });
            }

            // Check for conflicting maintenance
            const conflictingMaintenances = await Maintenance.findAll({
                where: {
                    vehicule_id: vehicule_id,
                    statut: { [Op.ne]: 'termine' },
                    [Op.or]: [
                        {
                            date_entree: {
                                [Op.between]: [new Date(date_debut), new Date(date_fin)]
                            }
                        },
                        {
                            date_sortie_prevue: {
                                [Op.between]: [new Date(date_debut), new Date(date_fin)]
                        }
                    },
                    {
                        [Op.and]: [
                            { date_entree: { [Op.lte]: new Date(date_debut) } },
                            { date_sortie_prevue: { [Op.gte]: new Date(date_fin) } }
                        ]
                    },
                    {
                        [Op.and]: [
                            { date_entree: { [Op.lte]: new Date(date_fin) } },
                            { date_sortie_prevue: null }
                        ]
                    }
                ]
            }
        });

        if (conflictingMaintenances.length > 0) {
            return res.status(400).json({
                message: 'Ce véhicule est en maintenance pour cette période'
            });
        }
    }

    await reservation.update(req.body);
    res.json(reservation);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la modification' });
}
});

// PUT /api/reservations/:id/status - Changer le statut d'une réservation
router.put('/:id/status', async (req, res) => {
    try {
        const { statut } = req.body;
        const reservation = await Reservation.findByPk(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }

        await reservation.update({ statut });

        // Mettre à jour le statut du véhicule selon le nouveau statut
        if (statut === 'en_cours') {
            await Vehicule.update(
                { etat: 'loue' },
                { where: { id: reservation.vehicule_id } }
            );
        } else if (statut === 'terminee' || statut === 'annulee') {
            await Vehicule.update(
                { etat: 'disponible' },
                { where: { id: reservation.vehicule_id } }
            );
        }

        res.json(reservation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du changement de statut' });
    }
});

// POST /api/reservations/:id/generate-contract - Générer un contrat à partir d'une réservation
router.post('/:id/generate-contract', async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id, {
            include: [
                { model: Client, as: 'client' },
                { model: Vehicule, as: 'vehicule' },
                { model: Agence, as: 'agence_retrait' },
                { model: Agence, as: 'agence_retour' }
            ]
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }

        if (!reservation.vehicule) {
            return res.status(400).json({ message: 'Véhicule associé à la réservation introuvable' });
        }

        if (!reservation.agence_retrait_id) {
            return res.status(400).json({ message: 'Agence de retrait non spécifiée dans la réservation' });
        }

        // Vérifier si un contrat existe déjà
        const existingContrat = await Contrat.findOne({
            where: { reservation_id: reservation.id }
        });

        if (existingContrat) {
            return res.status(400).json({
                message: 'Un contrat existe déjà pour cette réservation',
                contrat: existingContrat
            });
        }

        // Générer le numéro de contrat
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');

        const lastContrat = await Contrat.findOne({
            where: {
                numero: {
                    [Op.like]: `CTR-${year}${month}-%`
                }
            },
            order: [['cree_le', 'DESC']]
        });

        let nextNum = 1;
        if (lastContrat) {
            const parts = lastContrat.numero.split('-');
            if (parts.length === 3) {
                nextNum = parseInt(parts[2]) + 1;
            }
        }

        const numero = `CTR-${year}${month}-${String(nextNum).padStart(4, '0')}`;

        // Calculer le nombre de jours
        const dateDebut = new Date(reservation.date_debut);
        const dateFin = new Date(reservation.date_fin);
        const nombreJours = Math.max(1, Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24)));

        // Prepare location strings
        let lieuRemise = '';
        let lieuRestitution = '';

        if (reservation.agence_retrait) {
            lieuRemise = `${reservation.agence_retrait.nom} - ${reservation.agence_retrait.ville}`;
        }

        if (reservation.agence_retour) {
            lieuRestitution = `${reservation.agence_retour.nom} - ${reservation.agence_retour.ville}`;
        }

        // Créer le contrat
        const contrat = await Contrat.create({
            numero,
            type: 'contrat',
            reservation_id: reservation.id,
            client_id: reservation.client_id,
            vehicule_id: reservation.vehicule_id,
            agence_id: reservation.agence_retrait_id,
            date_debut: reservation.date_debut,
            date_fin: reservation.date_fin,
            lieu_remise: lieuRemise || 'Agence',
            lieu_restitution: lieuRestitution || 'Agence',
            prix_journalier: reservation.vehicule.prix_jour,
            nombre_jours: nombreJours,
            montant_total: reservation.prix_total,
            caution: reservation.caution,
            reste_a_payer: reservation.prix_total - (reservation.acompte || 0),
            acompte: reservation.acompte || 0,
            statut: 'a_signer'
        });

        // Mettre à jour la réservation
        await reservation.update({ statut: 'confirmee' });

        res.status(201).json(contrat);
    } catch (error) {
        console.error('Erreur génération contrat:', error);
        // Return validation errors if available
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Erreur de validation',
                errors: error.errors.map(e => e.message)
            });
        }
        res.status(500).json({
            message: 'Erreur lors de la génération du contrat',
            error: error.message
        });
    }
});

// DELETE /api/reservations/:id - Annuler une réservation
router.delete('/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findByPk(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }

        // Libérer le véhicule si la réservation n'était pas terminée
        if (reservation.statut !== 'terminee') {
            await Vehicule.update(
                { etat: 'disponible' },
                { where: { id: reservation.vehicule_id } }
            );
        }

        await reservation.destroy();
        res.json({ message: 'Réservation supprimée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

module.exports = router;
