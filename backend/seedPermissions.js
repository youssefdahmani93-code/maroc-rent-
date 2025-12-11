const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: false
        }
    }
);

const permissions = [
    // Véhicules
    { name: 'vehicles.view', description: 'Voir les véhicules', category: 'vehicles' },
    { name: 'vehicles.create', description: 'Créer des véhicules', category: 'vehicles' },
    { name: 'vehicles.edit', description: 'Modifier les véhicules', category: 'vehicles' },
    { name: 'vehicles.delete', description: 'Supprimer les véhicules', category: 'vehicles' },

    // Réservations
    { name: 'reservations.view', description: 'Voir les réservations', category: 'reservations' },
    { name: 'reservations.create', description: 'Créer des réservations', category: 'reservations' },
    { name: 'reservations.edit', description: 'Modifier les réservations', category: 'reservations' },
    { name: 'reservations.delete', description: 'Supprimer les réservations', category: 'reservations' },

    // Clients
    { name: 'clients.view', description: 'Voir les clients', category: 'clients' },
    { name: 'clients.create', description: 'Créer des clients', category: 'clients' },
    { name: 'clients.edit', description: 'Modifier les clients', category: 'clients' },
    { name: 'clients.delete', description: 'Supprimer les clients', category: 'clients' },

    // Contrats
    { name: 'contracts.view', description: 'Voir les contrats', category: 'contracts' },
    { name: 'contracts.create', description: 'Créer des contrats', category: 'contracts' },
    { name: 'contracts.edit', description: 'Modifier les contrats', category: 'contracts' },
    { name: 'contracts.delete', description: 'Supprimer les contrats', category: 'contracts' },

    // Paiements
    { name: 'payments.view', description: 'Voir les paiements', category: 'payments' },
    { name: 'payments.create', description: 'Créer des paiements', category: 'payments' },
    { name: 'payments.edit', description: 'Modifier les paiements', category: 'payments' },
    { name: 'payments.delete', description: 'Supprimer les paiements', category: 'payments' },

    // Maintenance
    { name: 'maintenance.view', description: 'Voir la maintenance', category: 'maintenance' },
    { name: 'maintenance.create', description: 'Créer des maintenances', category: 'maintenance' },
    { name: 'maintenance.edit', description: 'Modifier les maintenances', category: 'maintenance' },
    { name: 'maintenance.delete', description: 'Supprimer les maintenances', category: 'maintenance' },

    // GPS
    { name: 'gps.read', description: 'Voir la page GPS', category: 'gps' },
    { name: 'gps.create', description: 'Ajouter des traceurs GPS', category: 'gps' },
    { name: 'gps.update', description: 'Modifier des traceurs GPS', category: 'gps' },
    { name: 'gps.delete', description: 'Supprimer des traceurs GPS', category: 'gps' },

    // Rapports
    { name: 'reports.view', description: 'Voir les rapports', category: 'reports' },
    { name: 'reports.export', description: 'Exporter les rapports', category: 'reports' },

    // Utilisateurs
    { name: 'users.view', description: 'Voir les utilisateurs', category: 'users' },
    { name: 'users.create', description: 'Créer des utilisateurs', category: 'users' },
    { name: 'users.edit', description: 'Modifier les utilisateurs', category: 'users' },
    { name: 'users.delete', description: 'Supprimer les utilisateurs', category: 'users' },

    // Rôles
    { name: 'roles.view', description: 'Voir les rôles', category: 'roles' },
    { name: 'roles.create', description: 'Créer des rôles', category: 'roles' },
    { name: 'roles.edit', description: 'Modifier les rôles', category: 'roles' },
    { name: 'roles.delete', description: 'Supprimer les rôles', category: 'roles' },

    // Paramètres
    { name: 'settings.view', description: 'Voir les paramètres', category: 'settings' },
    { name: 'settings.edit', description: 'Modifier les paramètres', category: 'settings' }
];

async function seedPermissions() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // Insert permissions
        for (const perm of permissions) {
            await sequelize.query(
                `INSERT INTO permissions (name, description, category, created_at, updated_at) 
                 VALUES (:name, :description, :category, NOW(), NOW()) 
                 ON CONFLICT (name) DO NOTHING`,
                {
                    replacements: perm
                }
            );
        }
        console.log(`✓ ${permissions.length} permissions created/verified`);

        // Create default roles
        const roles = [
            { name: 'Admin', description: 'Administrateur avec tous les droits', is_system: true },
            { name: 'Manager', description: 'Gestionnaire avec droits limités', is_system: true },
            { name: 'Employee', description: 'Employé avec droits de base', is_system: true }
        ];

        for (const role of roles) {
            await sequelize.query(
                `INSERT INTO roles (name, description, is_system, created_at, updated_at) 
                 VALUES (:name, :description, :is_system, NOW(), NOW()) 
                 ON CONFLICT (name) DO NOTHING`,
                {
                    replacements: role
                }
            );
        }
        console.log('✓ 3 default roles created/verified');

        // Assign ALL permissions to Admin
        await sequelize.query(`
            INSERT INTO role_permissions (role_id, permission_id)
            SELECT 
                (SELECT id FROM roles WHERE name = 'Admin'),
                p.id
            FROM permissions p
            ON CONFLICT (role_id, permission_id) DO NOTHING
        `);
        console.log('✓ Admin role permissions assigned');

        console.log('\n✅ Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedPermissions();
