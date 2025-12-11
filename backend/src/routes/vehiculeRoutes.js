const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Vehicule = require('../models/Vehicule');
const Agence = require('../models/Agence');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Apply authentication middleware to all vehicle routes
router.use(authMiddleware);

// GET /api/vehicules - Liste tous les véhicules avec filtres, tri et pagination
router.get('/', authorize('vehicules.read'), async (req, res) => {
    try {
        const {
            agence_id,
            etat,
            categorie,
            marque,
            modele,
            annee,
            carburant,
            boite,
            search,
            sortBy = 'cree_le',
            order = 'DESC',
            page = 1,
            limit = 10
        } = req.query;

        const where = {};

        // Filters
        if (agence_id) where.agence_id = agence_id;
        if (etat) where.etat = etat;
        if (categorie) where.categorie = categorie;
        if (marque) where.marque = { [Op.iLike]: `%${marque}%` };
        if (modele) where.modele = { [Op.iLike]: `%${modele}%` };
        if (annee) where.annee = annee;
        if (carburant) where.carburant = carburant;
        if (boite) where.boite = boite;

        // Search across multiple fields
        if (search) {
            where[Op.or] = [
                { immatriculation: { [Op.iLike]: `%${search}%` } },
                { marque: { [Op.iLike]: `%${search}%` } },
                { modele: { [Op.iLike]: `%${search}%` } },
                { vin: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const limitInt = parseInt(limit);

        // Sorting - validate sortBy to prevent SQL injection
        const allowedSortFields = ['marque', 'modele', 'annee', 'etat', 'km', 'prix_jour', 'cree_le', 'immatriculation'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'cree_le';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const { count, rows: vehicules } = await Vehicule.findAndCountAll({
            where,
            include: [{
                model: Agence,
                as: 'agence',
                attributes: ['id', 'nom', 'ville']
            }],
            order: [[sortField, sortOrder]],
            limit: limitInt,
            offset: offset
        });

        res.json({
            vehicules,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: limitInt,
                totalPages: Math.ceil(count / limitInt)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/vehicules/:id - Détails d'un véhicule
router.get('/:id', authorize('vehicules.read'), async (req, res) => {
    try {
        const vehicule = await Vehicule.findByPk(req.params.id, {
            include: [{
                model: Agence,
                as: 'agence'
            }]
        });

        if (!vehicule) {
            return res.status(404).json({ message: 'Véhicule non trouvé' });
        }

        res.json(vehicule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST /api/vehicules - Créer un nouveau véhicule
router.post('/', authorize('vehicules.create'), upload.array('images', 5), async (req, res) => {
    try {
        console.log('POST /api/vehicules - Body:', JSON.stringify(req.body, null, 2));
        console.log('Files:', req.files);

        // Process uploaded images
        const images = req.files ? req.files.map(file => `/uploads/vehicles/${file.filename}`) : [];

        const vehiculeData = {
            ...req.body,
            images: images
        };

        const vehicule = await Vehicule.create(vehiculeData);
        res.status(201).json(vehicule);
    } catch (error) {
        console.error('Erreur création véhicule:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Données invalides',
                errors: error.errors.map(e => ({ field: e.path, message: e.message }))
            });
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Cette immatriculation existe déjà' });
        }
        res.status(500).json({ message: 'Erreur lors de la création du véhicule' });
    }
});

// PUT /api/vehicules/:id - Modifier un véhicule
router.put('/:id', authorize('vehicules.update'), upload.array('images', 5), async (req, res) => {
    try {
        const vehicule = await Vehicule.findByPk(req.params.id);

        if (!vehicule) {
            return res.status(404).json({ message: 'Véhicule non trouvé' });
        }

        // Process uploaded images if any
        const updateData = { ...req.body };
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/vehicles/${file.filename}`);
            // Merge with existing images or replace
            updateData.images = newImages;
        }

        await vehicule.update(updateData);
        res.json(vehicule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification' });
    }
});

// PUT /api/vehicules/:id/status - Modifier l'état d'un véhicule
router.put('/:id/status', authorize('vehicules.update'), async (req, res) => {
    try {
        const { etat } = req.body;
        const vehicule = await Vehicule.findByPk(req.params.id);

        if (!vehicule) {
            return res.status(404).json({ message: 'Véhicule non trouvé' });
        }

        await vehicule.update({ etat });
        res.json(vehicule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification du statut' });
    }
});

// DELETE /api/vehicules/:id - Supprimer un véhicule
router.delete('/:id', authorize('vehicules.delete'), async (req, res) => {
    try {
        const vehicule = await Vehicule.findByPk(req.params.id);

        if (!vehicule) {
            return res.status(404).json({ message: 'Véhicule non trouvé' });
        }

        await vehicule.destroy();
        res.json({ message: 'Véhicule supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

module.exports = router;
