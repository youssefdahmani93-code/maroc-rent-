const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_prod';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Accès refusé. Jeton non fourni.' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Jeton invalide.' });
    }
};

const authorize = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user?.id) {
                return res.status(401).json({ message: 'Utilisateur non authentifié.' });
            }

            // Directly use the role from the JWT payload for efficiency
            const userRole = req.user.role;

            // Super Admin and Admin have unrestricted access
            if (userRole === 'Super Admin' || userRole === 'Admin') {
                return next();
            }

            // For other roles, check permissions
            const userPermissions = req.user.permissions || [];
            const resource = requiredPermission.split('.')[0];
            const wildcardPermission = `${resource}.*`;

            if (userPermissions.includes(requiredPermission) || userPermissions.includes(wildcardPermission)) {
                return next();
            }

            return res.status(403).json({ 
                message: `Accès interdit. La permission '${requiredPermission}' est requise.` 
            });

        } catch (error) {
            console.error('Erreur d\'autorisation:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la vérification des droits.' });
        }
    };
};

module.exports = { authMiddleware, authorize };
