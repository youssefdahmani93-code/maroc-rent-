const express = require('express');
const router = express.Router();
const { Devis, Client, Vehicule, Agence, Contrat } = require('../models');
const { Op } = require('sequelize');

// GET all devis
router.get('/', async (req, res) => {
    try {
        const { statut, client_id, agence_id } = req.query;
        const where = {};

        if (statut) where.statut = statut;
        if (client_id) where.client_id = client_id;
        if (agence_id) where.agence_id = agence_id;

        const devis = await Devis.findAll({
            where,
            include: [
                { model: Client, as: 'client' },
                { model: Vehicule, as: 'vehicule' },
                { model: Agence, as: 'agence' },
                { model: Contrat, as: 'contrat_genere' }
            ],
            order: [['cree_le', 'DESC']]
        });

        res.json(devis);
    } catch (error) {
        console.error('Error fetching devis:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// GET devis by ID
router.get('/:id', async (req, res) => {
    try {
        const devis = await Devis.findByPk(req.params.id, {
            include: [
                { model: Client, as: 'client' },
                { model: Vehicule, as: 'vehicule' },
                { model: Agence, as: 'agence' },
                { model: Contrat, as: 'contrat_genere' }
            ]
        });

        if (!devis) {
            return res.status(404).json({ message: 'Devis non trouvé' });
        }

        res.json(devis);
    } catch (error) {
        console.error('Error fetching devis:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// CREATE new devis
router.post('/', async (req, res) => {
    try {
        const {
            client_id,
            vehicule_id,
            agence_id,
            date_debut,
            date_fin,
            prix_journalier,
            reduction,
            frais_chauffeur,
            frais_livraison,
            frais_carburant,
            frais_depassement_km,
            notes,
            conditions_particulieres
        } = req.body;

        // Calculate nombre_jours
        const dateDebut = new Date(date_debut);
        const dateFin = new Date(date_fin);
        const nombre_jours = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24));

        // Calculate montant_total
        const subtotal = prix_journalier * nombre_jours;
        const montant_total = subtotal - (reduction || 0) +
            (frais_chauffeur || 0) +
            (frais_livraison || 0) +
            (frais_carburant || 0) +
            (frais_depassement_km || 0);

        // Generate numero
        const count = await Devis.count();
        const numero = `DEV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

        const devis = await Devis.create({
            numero,
            client_id,
            vehicule_id,
            agence_id,
            date_debut,
            date_fin,
            nombre_jours,
            prix_journalier,
            reduction: reduction || 0,
            frais_chauffeur: frais_chauffeur || 0,
            frais_livraison: frais_livraison || 0,
            frais_carburant: frais_carburant || 0,
            frais_depassement_km: frais_depassement_km || 0,
            montant_total,
            notes,
            conditions_particulieres,
            statut: 'brouillon',
            created_by: req.user?.id || null
        });

        const devisWithRelations = await Devis.findByPk(devis.id, {
            include: [
                { model: Client, as: 'client' },
                { model: Vehicule, as: 'vehicule' },
                { model: Agence, as: 'agence' }
            ]
        });

        res.status(201).json(devisWithRelations);
    } catch (error) {
        console.error('Error creating devis:', error);
        res.status(500).json({ message: 'Erreur lors de la création', error: error.message });
    }
});

// UPDATE devis
router.put('/:id', async (req, res) => {
    try {
        const devis = await Devis.findByPk(req.params.id);

        if (!devis) {
            return res.status(404).json({ message: 'Devis non trouvé' });
        }

        // Don't allow editing if already converted
        if (devis.statut === 'converti') {
            return res.status(400).json({ message: 'Impossible de modifier un devis déjà converti' });
        }

        const {
            date_debut,
            date_fin,
            prix_journalier,
            reduction,
            frais_chauffeur,
            frais_livraison,
            frais_carburant,
            frais_depassement_km,
            notes,
            conditions_particulieres,
            statut
        } = req.body;

        // Recalculate if dates or prices changed
        let nombre_jours = devis.nombre_jours;
        let montant_total = devis.montant_total;

        if (date_debut || date_fin || prix_journalier !== undefined) {
            const dateDebut = new Date(date_debut || devis.date_debut);
            const dateFin = new Date(date_fin || devis.date_fin);
            nombre_jours = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24));

            const prixJour = prix_journalier !== undefined ? prix_journalier : devis.prix_journalier;
            const subtotal = prixJour * nombre_jours;
            montant_total = subtotal - (reduction !== undefined ? reduction : devis.reduction) +
                (frais_chauffeur !== undefined ? frais_chauffeur : devis.frais_chauffeur) +
                (frais_livraison !== undefined ? frais_livraison : devis.frais_livraison) +
                (frais_carburant !== undefined ? frais_carburant : devis.frais_carburant) +
                (frais_depassement_km !== undefined ? frais_depassement_km : devis.frais_depassement_km);
        }

        await devis.update({
            date_debut: date_debut || devis.date_debut,
            date_fin: date_fin || devis.date_fin,
            nombre_jours,
            prix_journalier: prix_journalier !== undefined ? prix_journalier : devis.prix_journalier,
            reduction: reduction !== undefined ? reduction : devis.reduction,
            frais_chauffeur: frais_chauffeur !== undefined ? frais_chauffeur : devis.frais_chauffeur,
            frais_livraison: frais_livraison !== undefined ? frais_livraison : devis.frais_livraison,
            frais_carburant: frais_carburant !== undefined ? frais_carburant : devis.frais_carburant,
            frais_depassement_km: frais_depassement_km !== undefined ? frais_depassement_km : devis.frais_depassement_km,
            montant_total,
            notes: notes !== undefined ? notes : devis.notes,
            conditions_particulieres: conditions_particulieres !== undefined ? conditions_particulieres : devis.conditions_particulieres,
            statut: statut || devis.statut
        });

        const updatedDevis = await Devis.findByPk(devis.id, {
            include: [
                { model: Client, as: 'client' },
                { model: Vehicule, as: 'vehicule' },
                { model: Agence, as: 'agence' }
            ]
        });

        res.json(updatedDevis);
    } catch (error) {
        console.error('Error updating devis:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour', error: error.message });
    }
});

// DELETE devis
router.delete('/:id', async (req, res) => {
    try {
        const devis = await Devis.findByPk(req.params.id);

        if (!devis) {
            return res.status(404).json({ message: 'Devis non trouvé' });
        }

        // Don't allow deleting if already converted
        if (devis.statut === 'converti') {
            return res.status(400).json({ message: 'Impossible de supprimer un devis déjà converti' });
        }

        await devis.destroy();
        res.json({ message: 'Devis supprimé avec succès' });
    } catch (error) {
        console.error('Error deleting devis:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
    }
});

// CONVERT devis to contrat
router.post('/:id/convert', async (req, res) => {
    try {
        const devis = await Devis.findByPk(req.params.id, {
            include: [
                { model: Client, as: 'client' },
                { model: Vehicule, as: 'vehicule' },
                { model: Agence, as: 'agence' }
            ]
        });

        if (!devis) {
            return res.status(404).json({ message: 'Devis non trouvé' });
        }

        if (devis.statut === 'converti') {
            return res.status(400).json({ message: 'Ce devis a déjà été converti' });
        }

        // Generate contrat numero
        const count = await Contrat.count();
        const numero = `CTR-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

        // Create contrat from devis
        const contrat = await Contrat.create({
            numero,
            type: 'contrat',
            devis_id: devis.id,
            client_id: devis.client_id,
            vehicule_id: devis.vehicule_id,
            agence_id: devis.agence_id,
            date_debut: devis.date_debut,
            date_fin: devis.date_fin,
            nombre_jours: devis.nombre_jours,
            prix_journalier: devis.prix_journalier,
            reduction: devis.reduction,
            frais_chauffeur: devis.frais_chauffeur,
            frais_livraison: devis.frais_livraison,
            frais_carburant: devis.frais_carburant,
            frais_depassement_km: devis.frais_depassement_km,
            montant_total: devis.montant_total,
            caution: devis.montant_total * 0.3, // 30% caution
            acompte: 0,
            reste_a_payer: devis.montant_total,
            statut: 'a_signer',
            notes: devis.notes,
            conditions_generales: devis.conditions_particulieres
        });

        // Update devis status
        await devis.update({
            statut: 'converti',
            contrat_id: contrat.id,
            converti_le: new Date()
        });

        const contratWithRelations = await Contrat.findByPk(contrat.id, {
            include: [
                { model: Client, as: 'client' },
                { model: Vehicule, as: 'vehicule' },
                { model: Agence, as: 'agence' },
                { model: Devis, as: 'devis' }
            ]
        });

        res.status(201).json(contratWithRelations);
    } catch (error) {
        console.error('Error converting devis:', error);
        res.status(500).json({ message: 'Erreur lors de la conversion', error: error.message });
    }
});

// GET devis statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const total = await Devis.count();
        const brouillon = await Devis.count({ where: { statut: 'brouillon' } });
        const envoye = await Devis.count({ where: { statut: 'envoye' } });
        const accepte = await Devis.count({ where: { statut: 'accepte' } });
        const converti = await Devis.count({ where: { statut: 'converti' } });
        const refuse = await Devis.count({ where: { statut: 'refuse' } });

        const totalMontant = await Devis.sum('montant_total', {
            where: { statut: { [Op.in]: ['accepte', 'converti'] } }
        });

        res.json({
            total,
            brouillon,
            envoye,
            accepte,
            converti,
            refuse,
            totalMontant: totalMontant || 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

module.exports = router;
