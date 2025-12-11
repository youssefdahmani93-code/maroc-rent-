const { User, Role, Permission } = require('../models');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_prod';

// Placeholder for register function to prevent server crash
exports.register = async (req, res) => {
    res.status(501).json({ message: 'La fonctionnalité d\'enregistrement n\'est pas implémentée.' });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        // 2. Validate password
        const isMatch = await user.validatePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        // 3. Check account status
        if (user.status !== 'active') {
            return res.status(403).json({ message: 'Compte désactivé ou suspendu' });
        }

        // 4. Fetch the user AGAIN, this time with their role and permissions
        const userWithPermissions = await User.findByPk(user.id, {
            include: [{
                model: Role,
                as: 'user_role',
                include: [{
                    model: Permission,
                    as: 'permissions',
                    attributes: ['name'],
                    through: { attributes: [] }
                }]
            }]
        });

        // 5. Update last login date
        user.last_login = new Date();
        await user.save();

        // 6. Prepare token payload with fresh data
        const roleName = userWithPermissions.user_role ? userWithPermissions.user_role.name : null;
        const permissions = userWithPermissions.user_role ? userWithPermissions.user_role.permissions.map(p => p.name) : [];

        const token = jwt.sign(
            { id: user.id, role: roleName, permissions }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // 7. Send response
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: roleName,
                permissions: permissions,
            }
        });

    } catch (error) {
        console.error('[Login Error]', error);
        res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
    }
};
