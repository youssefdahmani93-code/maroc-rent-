const express = require('express');
const router = express.Router();
const { Role, Permission, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /api/roles - Get all roles with their permissions
router.get('/', async (req, res) => {
    try {
        const roles = await Role.findAll({
            include: {
                model: Permission,
                as: 'permissions',
                attributes: ['id', 'name', 'description'],
                through: { attributes: [] } // Exclude junction table attributes
            },
            order: [['name', 'ASC']]
        });
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// GET /api/roles/permissions/list - Get all available permissions grouped by category
router.get('/permissions/list', async (req, res) => {
    try {
        const permissions = await Permission.findAll({ order: [['name', 'ASC']] });
        const grouped = permissions.reduce((acc, p) => {
            const category = p.name.split('.')[0] || 'general';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(p);
            return acc;
        }, {});
        res.json(grouped);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

// POST /api/roles - Create a new role
router.post('/', async (req, res) => {
    const { name, description, permissions } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Le nom du rôle est requis' });
    }

    const t = await sequelize.transaction();
    try {
        const role = await Role.create({ name, description }, { transaction: t });

        if (permissions && permissions.length > 0) {
            const permissionInstances = await Permission.findAll({
                where: { name: { [Op.in]: permissions } }
            });
            await role.setPermissions(permissionInstances, { transaction: t });
        }

        await t.commit();
        res.status(201).json(role);
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Erreur lors de la création du rôle', error: error.message });
    }
});

// PUT /api/roles/:id - Update a role
router.put('/:id', async (req, res) => {
    const { name, description, permissions } = req.body;
    const t = await sequelize.transaction();

    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) {
            await t.rollback();
            return res.status(404).json({ message: 'Rôle non trouvé' });
        }

        // System roles cannot be renamed
        const updateData = { description };
        if (!role.is_system) {
            updateData.name = name;
        }

        await role.update(updateData, { transaction: t });

        if (permissions) {
            const permissionInstances = await Permission.findAll({
                where: { name: { [Op.in]: permissions } }
            });
            // This replaces all existing permissions with the new set
            await role.setPermissions(permissionInstances, { transaction: t });
        }

        await t.commit();
        res.json({ message: 'Rôle mis à jour avec succès' });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle', error: error.message });
    }
});

// DELETE /api/roles/:id - Delete a role
router.delete('/:id', async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Rôle non trouvé' });
        }
        if (role.is_system) {
            return res.status(403).json({ message: 'Les rôles système ne peuvent pas être supprimés' });
        }
        await role.destroy();
        res.json({ message: 'Rôle supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du rôle', error: error.message });
    }
});

module.exports = router;
