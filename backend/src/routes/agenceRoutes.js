const express = require('express');
const router = express.Router();
const Agence = require('../models/Agence');

// GET /api/agences - Liste toutes les agences
router.get('/', async (req, res) => {
    try {
        const agences = await Agence.findAll();
        res.json(agences);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/agences/:id - Détails d'une agence
router.get('/:id', async (req, res) => {
    try {
        const agence = await Agence.findByPk(req.params.id);
        if (!agence) {
            return res.status(404).json({ message: 'Agence non trouvée' });
        }
        res.json(agence);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST /api/agences - Créer une agence
router.post('/', async (req, res) => {
    try {
        const agence = await Agence.create(req.body);
        res.status(201).json(agence);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'agence' });
    }
});

// PUT /api/agences/:id - Modifier une agence
router.put('/:id', async (req, res) => {
    try {
        const agence = await Agence.findByPk(req.params.id);
        if (!agence) {
            return res.status(404).json({ message: 'Agence non trouvée' });
        }
        await agence.update(req.body);
        res.json(agence);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification de l\'agence' });
    }
});

// DELETE /api/agences/:id - Supprimer une agence
router.delete('/:id', async (req, res) => {
    try {
        const agence = await Agence.findByPk(req.params.id);
        if (!agence) {
            return res.status(404).json({ message: 'Agence non trouvée' });
        }
        await agence.destroy();
        res.json({ message: 'Agence supprimée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'agence' });
    }
});

module.exports = router;
