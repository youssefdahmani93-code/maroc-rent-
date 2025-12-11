const express = require('express');
const router = express.Router();
const { User, Role, Agence } = require('../models');
const bcrypt = require('bcryptjs');

// GET /api/users - List all users
router.get('/', async (req, res) => {
    try {
        const { search, role_id, agence_id, status } = req.query;
        const where = {};

        if (role_id) where.role_id = role_id;
        if (agence_id) where.agence_id = agence_id;
        if (status) where.status = status;

        const users = await User.findAll({
            where,
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: Role, as: 'user_role' },
                { model: Agence, as: 'agence' }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST /api/users - Create a new user
router.post('/', async (req, res) => {
    try {
        const { name, email, password, role_id, agence_id, phone, status } = req.body;

        // Check if email exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        const user = await User.create({
            name,
            email,
            password_hash: password, // Will be hashed by hook
            role_id,
            agence_id,
            phone,
            status: status || 'active'
        });

        // Fetch with associations
        const createdUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: Role, as: 'user_role' },
                { model: Agence, as: 'agence' }
            ]
        });

        res.status(201).json(createdUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            message: 'Erreur lors de la création de l\'utilisateur',
            error: error.message
        });
    }
});

// PUT /api/users/:id - Update a user
router.put('/:id', async (req, res) => {
    try {
        const { name, email, password, role_id, agence_id, phone, status } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const updateData = {
            name,
            email,
            role_id,
            agence_id,
            phone,
            status
        };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password_hash = await bcrypt.hash(password, salt);
        }

        await user.update(updateData);

        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: Role, as: 'user_role' },
                { model: Agence, as: 'agence' }
            ]
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification' });
    }
});

// PATCH /api/users/:id/status - Toggle status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        await user.update({ status });
        res.json({ message: 'Statut mis à jour', status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du changement de statut' });
    }
});

// DELETE /api/users/:id - Delete (Soft delete preferred, but hard delete for now as per request)
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        await user.destroy();
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

module.exports = router;
