const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Temporary endpoint to create test admin user
router.post('/create-test-user', async (req, res) => {
    try {
        const { User, Role } = require('../models');

        // Find or create Admin role
        const [adminRole] = await Role.findOrCreate({
            where: { name: 'Admin' },
            defaults: {
                name: 'Admin',
                description: 'Administrateur avec tous les droits',
                is_system: true
            }
        });

        // Check if user exists
        const existingUser = await User.findOne({ where: { email: 'admin@gorent.com' } });

        if (existingUser) {
            // Reset password
            existingUser.password_hash = 'admin123';
            existingUser.status = 'active';
            existingUser.role_id = adminRole.id;
            await existingUser.save();

            return res.json({
                message: 'User already exists, password reset',
                credentials: {
                    email: 'admin@gorent.com',
                    password: 'admin123'
                }
            });
        }

        // Create new user
        await User.create({
            name: 'Admin GoRent',
            email: 'admin@gorent.com',
            password_hash: 'admin123',
            role_id: adminRole.id,
            status: 'active',
            phone: '+212600000000'
        });

        res.json({
            message: 'Test user created successfully',
            credentials: {
                email: 'admin@gorent.com',
                password: 'admin123'
            }
        });
    } catch (error) {
        console.error('Error creating test user:', error);
        res.status(500).json({ message: 'Error creating test user', error: error.message });
    }
});

module.exports = router;
