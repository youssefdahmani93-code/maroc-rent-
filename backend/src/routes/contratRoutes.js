const express = require('express');
const router = express.Router();
const Contrat = require('../models/Contrat');
const Client = require('../models/Client');
const Vehicule = require('../models/Vehicule');
const Agence = require('../models/Agence');
const Reservation = require('../models/Reservation');
const { Op } = require('sequelize');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

// Apply authentication middleware to all contract routes
router.use(authMiddleware);

// Fonction pour générer un numéro de contrat unique
const genererNumeroContrat = async (type) => {
    const prefix = type === 'devis' ? 'DEV' : 'CTR';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const lastDoc = await Contrat.findOne({
        where: {
            type,
            numero: {
                [Op.like]: `${prefix}-${year}${month}-%`
            }
        },
        order: [['numero', 'DESC']]
    });

    let nextNum = 1;
    if (lastDoc) {
        const parts = lastDoc.numero.split('-');
        if (parts.length === 3 && parts[2]) {
            nextNum = parseInt(parts[2]) + 1;
        }
    }

    const numero = String(nextNum).padStart(4, '0');
    return `${prefix}-${year}${month}-${numero}`;
};

// GET /api/contracts - Liste tous les contrats et devis
router.get('/', authorize('contrats.read'), async (req, res) => {
    try {
        const { type, statut, client_id, search } = req.query;
        const where = {};

        if (type) where.type = type;
        if (statut) where.statut = statut;
        if (client_id) where.client_id = client_id;

        const contrats = await Contrat.findAll({
            where,
            include: [
                {
                    model: Client,
                    as: 'client',
                    attributes: ['id', 'nom', 'telephone', 'email']
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
            order: [['cree_le', 'DESC']]
        });

        res.json(contrats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/contracts/:id - Détails d'un contrat
router.get('/:id', authorize('contrats.read'), async (req, res) => {
    try {
        const contrat = await Contrat.findByPk(req.params.id, {
            include: [
                { model: Client, as: 'client' },
                { model: Vehicule, as: 'vehicule' },
                { model: Agence, as: 'agence' },
                { model: Reservation, as: 'reservation' }
            ]
        });

        if (!contrat) {
            return res.status(404).json({ message: 'Contrat non trouvé' });
        }

        res.json(contrat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST /api/contracts - Créer un nouveau contrat ou devis
router.post('/', authorize('contrats.create'), async (req, res) => {
    console.log('--- Début de la création du contrat ---');
    try {
        console.log('1. Corps de la requête reçu:', req.body);

        const numero = await genererNumeroContrat(req.body.type || 'devis');
        console.log('2. Numéro de contrat généré:', numero);

        const dataToCreate = { ...req.body };

        if (dataToCreate.agence_retrait_id) {
            dataToCreate.agence_id = dataToCreate.agence_retrait_id;
            if (!dataToCreate.lieu_remise) {
                const agenceRetrait = await Agence.findByPk(dataToCreate.agence_retrait_id);
                if (agenceRetrait) {
                    dataToCreate.lieu_remise = `${agenceRetrait.nom} - ${agenceRetrait.ville}`;
                }
            }
        }

        if (dataToCreate.agence_retour_id) {
            if (!dataToCreate.agence_id) dataToCreate.agence_id = dataToCreate.agence_retour_id;
            if (!dataToCreate.lieu_restitution) {
                const agenceRetour = await Agence.findByPk(dataToCreate.agence_retour_id);
                if (agenceRetour) {
                    dataToCreate.lieu_restitution = `${agenceRetour.nom} - ${agenceRetour.ville}`;
                }
            }
        }

        delete dataToCreate.agence_retrait_id;
        delete dataToCreate.agence_retour_id;

        console.log('3. Données après mapping des agences:', dataToCreate);

        const dateDebut = new Date(dataToCreate.date_debut);
        const dateFin = new Date(dataToCreate.date_fin);
        const nombreJours = Math.max(1, Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24)));
        console.log('4. Nombre de jours calculé:', nombreJours);

        const prixBase = (parseFloat(dataToCreate.prix_journalier) || 0) * nombreJours;
        const fraisSupplementaires = (parseFloat(dataToCreate.frais_chauffeur) || 0) + (parseFloat(dataToCreate.frais_livraison) || 0);
        const montantTotal = prixBase + fraisSupplementaires - (parseFloat(dataToCreate.reduction) || 0);
        const resteAPayer = montantTotal - (parseFloat(dataToCreate.acompte) || 0);

        console.log('5. Montants calculés:', { montantTotal, resteAPayer });

        const finalData = {
            ...dataToCreate,
            numero,
            nombre_jours: nombreJours,
            montant_total: montantTotal,
            reste_a_payer: resteAPayer,
        };

        console.log('6. Données finales avant création:', finalData);

        const contrat = await Contrat.create(finalData);
        console.log('7. Contrat créé avec succès:', contrat.toJSON());

        if (parseFloat(contrat.acompte) > 0) {
            console.log('8. Création du paiement pour acompte...');
            const Paiement = require('../models/Paiement');
            await Paiement.create({
                client_id: contrat.client_id,
                type_paiement: 'contrat',
                reference_id: contrat.id,
                montant_total: contrat.montant_total,
                montant_paye: contrat.acompte,
                reste_a_payer: contrat.reste_a_payer,
                methode_paiement: contrat.methode_paiement || 'especes',
                statut: contrat.reste_a_payer > 0 ? 'partiel' : 'paye',
                date_paiement: new Date(),
                notes: 'Acompte à la création du contrat'
            });
            console.log('9. Paiement créé avec succès.');
        }

        console.log('--- Fin de la création du contrat ---');
        res.status(201).json(contrat);

    } catch (error) {
        console.error('[ERREUR] Création du contrat a échoué:', error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                message: `Erreur de validation: ${error.errors.map(e => e.message).join(', ')}`,
            });
        }
        res.status(500).json({
            message: 'Erreur serveur inattendue lors de la création du contrat.',
            error: error.message,
            stack: error.stack // Pour le débogage
        });
    }
});


// PUT /api/contracts/:id - Modifier un contrat
router.put('/:id', authorize('contrats.update'), async (req, res) => {
    try {
        const contrat = await Contrat.findByPk(req.params.id);

        if (!contrat) {
            return res.status(404).json({ message: 'Contrat non trouvé' });
        }

        // Recalculer si les dates ou prix changent
        if (req.body.date_debut || req.body.date_fin || req.body.prix_journalier) {
            const dateDebut = new Date(req.body.date_debut || contrat.date_debut);
            const dateFin = new Date(req.body.date_fin || contrat.date_fin);
            const nombreJours = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24));

            const prixJournalier = req.body.prix_journalier || contrat.prix_journalier;
            const prixBase = prixJournalier * nombreJours;
            const fraisSupplementaires =
                (parseFloat(req.body.frais_chauffeur) || contrat.frais_chauffeur) +
                (parseFloat(req.body.frais_livraison) || contrat.frais_livraison) +
                (parseFloat(req.body.frais_carburant) || contrat.frais_carburant) +
                (parseFloat(req.body.frais_depassement_km) || contrat.frais_depassement_km);
            const montantTotal = prixBase + fraisSupplementaires - (parseFloat(req.body.reduction) || contrat.reduction);
            const resteAPayer = montantTotal - (parseFloat(req.body.acompte) || contrat.acompte);

            req.body.nombre_jours = nombreJours;
            req.body.montant_total = montantTotal;
            req.body.reste_a_payer = resteAPayer;
        }

        await contrat.update(req.body);
        res.json(contrat);
    } catch (error) {
        console.error('Erreur lors de la modification du contrat', error);
        res.status(500).json({ message: 'Erreur lors de la modification', error: error.message });
    }
});

// PUT /api/contracts/:id/convert - Convertir un devis en contrat
router.put('/:id/convert', authorize('contrats.update'), async (req, res) => {
    try {
        const devis = await Contrat.findByPk(req.params.id);

        if (!devis) {
            return res.status(404).json({ message: 'Devis non trouvé' });
        }

        if (devis.type !== 'devis') {
            return res.status(400).json({ message: 'Ce document est déjà un contrat' });
        }

        const numero = await genererNumeroContrat('contrat');

        await devis.update({
            type: 'contrat',
            numero,
            statut: 'a_signer',
            ...req.body
        });

        if (req.body.acompte && parseFloat(req.body.acompte) > 0) {
            const Paiement = require('../models/Paiement');
            const existingPaiement = await Paiement.findOne({
                where: {
                    reference_id: devis.id,
                    type_paiement: 'contrat'
                }
            });

            if (!existingPaiement) {
                const montantTotal = parseFloat(req.body.montant_total || devis.montant_total);
                const montantPaye = parseFloat(req.body.acompte);
                const resteAPayer = montantTotal - montantPaye;

                await Paiement.create({
                    client_id: devis.client_id,
                    type_paiement: 'contrat',
                    reference_id: devis.id,
                    montant_total: montantTotal,
                    montant_paye: montantPaye,
                    reste_a_payer: resteAPayer,
                    methode_paiement: req.body.methode_paiement || 'especes',
                    statut: resteAPayer > 0 ? 'partiel' : 'paye',
                    date_paiement: new Date(),
                    notes: 'Acompte à la conversion du devis'
                });
            }
        }

        res.json(devis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la conversion' });
    }
});

// PUT /api/contracts/:id/status - Modifier le statut
router.put('/:id/status', authorize('contrats.update'), async (req, res) => {
    try {
        const { statut } = req.body;
        const contrat = await Contrat.findByPk(req.params.id);

        if (!contrat) {
            return res.status(404).json({ message: 'Contrat non trouvé' });
        }

        await contrat.update({ statut });
        res.json(contrat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification du statut' });
    }
});

// DELETE /api/contracts/:id - Supprimer un contrat
router.delete('/:id', authorize('contrats.delete'), async (req, res) => {
    try {
        const contrat = await Contrat.findByPk(req.params.id);

        if (!contrat) {
            return res.status(404).json({ message: 'Contrat non trouvé' });
        }

        await contrat.destroy();
        res.json({ message: 'Contrat supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

module.exports = router;
