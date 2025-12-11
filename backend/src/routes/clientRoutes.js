const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Reservation = require('../models/Reservation');
const { Op } = require('sequelize');
const { authorize, authMiddleware } = require('../middleware/authMiddleware');

// Apply authentication middleware to all client routes
router.use(authMiddleware);

/* -------------------------------------------------
   GET /api/clients – Liste des clients (filtrage)
------------------------------------------------- */
router.get('/', authorize('clients.read'), async (req, res) => {
    try {
        const { search, statut, has_reservations, ville } = req.query;
        const where = {};

        if (statut) where.statut = statut;
        if (ville) where.ville = ville;

        if (search) {
            where[Op.or] = [
                { nom: { [Op.iLike]: `%${search}%` } },
                { telephone: { [Op.iLike]: `%${search}%` } },
                { cni_passport: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const clients = await Client.findAll({
            where,
            order: [['cree_le', 'DESC']]
        });
        res.json(clients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

/* -------------------------------------------------
   GET /api/clients/:id – Détails d’un client
------------------------------------------------- */
router.get('/:id', authorize('clients.read'), async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id, {
            include: [{
                model: Reservation,
                as: 'reservations',
                include: ['vehicule', 'agence_retrait', 'agence_retour']
            }]
        });

        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }
        res.json(client);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

/* -------------------------------------------------
   POST /api/clients – Création d’un client
------------------------------------------------- */
router.post('/', authorize('clients.create'), async (req, res) => {
    try {
        console.log('POST /api/clients - Body:', JSON.stringify(req.body, null, 2));
        const client = await Client.create(req.body);
        res.status(201).json(client);
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Ce numéro de document existe déjà' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
        }
        res.status(500).json({ message: 'Erreur lors de la création du client' });
    }
});

/* -------------------------------------------------
   PUT /api/clients/:id – Modification d’un client
------------------------------------------------- */
router.put('/:id', authorize('clients.update'), async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }
        await client.update(req.body);
        res.json(client);
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Ce numéro de document existe déjà' });
        }
        res.status(500).json({ message: 'Erreur lors de la modification' });
    }
});

/* -------------------------------------------------
   DELETE /api/clients/:id – Suppression d’un client
------------------------------------------------- */
router.delete('/:id', authorize('clients.delete'), async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id, {
            include: [{
                model: Reservation,
                as: 'reservations',
                where: { statut: { [Op.in]: ['en_attente', 'confirmee', 'en_cours'] } },
                required: false
            }]
        });

        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        // Vérifier s’il y a des réservations actives
        if (client.reservations && client.reservations.length > 0) {
            return res.status(400).json({
                message: 'Impossible de supprimer ce client car il a des réservations en cours'
            });
        }

        await client.destroy();
        res.json({ message: 'Client supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

/* -------------------------------------------------
   GET /api/clients/:id/reservations – Historique
------------------------------------------------- */
router.get('/:id/reservations', authorize('clients.read'), async (req, res) => {
    try {
        const reservations = await Reservation.findAll({
            where: { client_id: req.params.id },
            include: ['vehicule', 'agence_retrait', 'agence_retour'],
            order: [['cree_le', 'DESC']]
        });
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

/* -------------------------------------------------
   PUT /api/clients/:id/notes – Notes internes
------------------------------------------------- */
router.put('/:id/notes', authorize('clients.update'), async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }
        await client.update({ notes_internes: req.body.notes });
        res.json(client);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification' });
    }
});

module.exports = router;
