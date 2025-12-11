require('dotenv').config();
const sequelize = require('../config/database');
const models = require('../models');
const { Agence, Vehicule, Client, User, Role, Permission, RolePermission, Contrat } = models;
const seedSettings = require('./seedSettings');

const permissionsList = [
    // Clients
    { name: 'clients.read', description: 'Voir la liste des clients', category: 'Clients' },
    { name: 'clients.create', description: 'Créer un client', category: 'Clients' },
    { name: 'clients.update', description: 'Modifier un client', category: 'Clients' },
    { name: 'clients.delete', description: 'Supprimer un client', category: 'Clients' },

    // Véhicules
    { name: 'vehicules.read', description: 'Voir la liste des véhicules', category: 'Véhicules' },
    { name: 'vehicules.create', description: 'Créer un véhicule', category: 'Véhicules' },
    { name: 'vehicules.update', description: 'Modifier un véhicule', category: 'Véhicules' },
    { name: 'vehicules.delete', description: 'Supprimer un véhicule', category: 'Véhicules' },

    // Réservations
    { name: 'reservations.read', description: 'Voir les réservations', category: 'Réservations' },
    { name: 'reservations.create', description: 'Créer une réservation', category: 'Réservations' },
    { name: 'reservations.update', description: 'Modifier une réservation', category: 'Réservations' },
    { name: 'reservations.delete', description: 'Supprimer une réservation', category: 'Réservations' },

    // Contrats
    { name: 'contrats.read', description: 'Voir les contrats', category: 'Contrats' },
    { name: 'contrats.create', description: 'Créer un contrat', category: 'Contrats' },
    { name: 'contrats.update', description: 'Modifier un contrat', category: 'Contrats' },
    { name: 'contrats.delete', description: 'Supprimer un contrat', category: 'Contrats' },

    // Agences
    { name: 'agences.read', description: 'Voir les agences', category: 'Agences' },
    { name: 'agences.create', description: 'Créer une agence', category: 'Agences' },
    { name: 'agences.update', description: 'Modifier une agence', category: 'Agences' },
    { name: 'agences.delete', description: 'Supprimer une agence', category: 'Agences' },

    // Utilisateurs & Rôles
    { name: 'users.read', description: 'Voir les utilisateurs', category: 'Administration' },
    { name: 'users.create', description: 'Créer un utilisateur', category: 'Administration' },
    { name: 'users.update', description: 'Modifier un utilisateur', category: 'Administration' },
    { name: 'users.delete', description: 'Supprimer un utilisateur', category: 'Administration' },
    { name: 'roles.read', description: 'Voir les rôles', category: 'Administration' },
    { name: 'roles.create', description: 'Créer un rôle', category: 'Administration' },
    { name: 'roles.update', description: 'Modifier un rôle', category: 'Administration' },
    { name: 'roles.delete', description: 'Supprimer un rôle', category: 'Administration' },

    // Paramètres
    { name: 'settings.read', description: 'Voir les paramètres', category: 'Paramètres' },
    { name: 'settings.update', description: 'Modifier les paramètres', category: 'Paramètres' },

    // Rapports
    { name: 'reports.view_contracts', description: 'Voir les rapports des contrats', category: 'Rapports' },
    { name: 'reports.view_quotes', description: 'Voir les rapports des devis', category: 'Rapports' },
    { name: 'reports.view_clients', description: 'Voir les rapports des clients', category: 'Rapports' },
    { name: 'reports.view_vehicles', description: 'Voir les rapports des véhicules', category: 'Rapports' },
    { name: 'reports.view_payments', description: 'Voir les rapports des paiements', category: 'Rapports' }
];

async function seed() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Sync models
        await sequelize.sync({ alter: true });
        console.log('Models synced.');

        // Seed Settings
        await seedSettings();

        // 1. Create Permissions
        console.log('Seeding permissions...');
        for (const perm of permissionsList) {
            await Permission.findOrCreate({
                where: { name: perm.name },
                defaults: perm
            });
        }
        const allPermissions = await Permission.findAll();
        console.log(`Seeded ${allPermissions.length} permissions.`);

        // 2. Create Roles
        console.log('Seeding roles...');
        const [adminRole] = await Role.findOrCreate({
            where: { name: 'Admin' },
            defaults: { description: 'Accès complet à toutes les fonctionnalités', is_system: true }
        });

        const [managerRole] = await Role.findOrCreate({
            where: { name: 'Manager' },
            defaults: { description: 'Gestion des opérations quotidiennes', is_system: true }
        });

        const [agentRole] = await Role.findOrCreate({
            where: { name: 'Agent' },
            defaults: { description: 'Accès limité aux réservations et clients', is_system: true }
        });

        // 3. Assign Permissions to Roles
        console.log('Assigning permissions...');

        // Admin gets all permissions
        await adminRole.setPermissions(allPermissions);

        // Manager gets everything except deleting users/roles and system settings
        const managerPermissions = allPermissions.filter(p =>
            !p.name.includes('delete') &&
            !p.name.startsWith('roles') &&
            !p.name.startsWith('settings')
        );
        await managerRole.setPermissions(managerPermissions);

        // Agent gets read/create/update for operational modules only
        const agentPermissions = allPermissions.filter(p =>
            ['clients', 'reservations', 'vehicules', 'contrats'].includes(p.category) &&
            !p.name.includes('delete')
        );
        await agentRole.setPermissions(agentPermissions);

        // 4. Create Agences
        const agences = await Agence.bulkCreate([
            {
                nom: 'Agence Casablanca Centre',
                ville: 'Casablanca',
                adresse: 'Boulevard Mohammed V',
                telephone: '0522-123456',
                ice: 'ICE001234567'
            },
            {
                nom: 'Agence Rabat Agdal',
                ville: 'Rabat',
                adresse: 'Avenue Hassan II',
                telephone: '0537-654321',
                ice: 'ICE001234568'
            },
            {
                nom: 'Agence Marrakech Gueliz',
                ville: 'Marrakech',
                adresse: 'Avenue Mohammed VI',
                telephone: '0524-987654',
                ice: 'ICE001234569'
            }
        ], { ignoreDuplicates: true });

        // Fetch agences to get IDs
        const allAgences = await Agence.findAll();
        console.log(`Agences ready: ${allAgences.length}`);

        // 5. Create Vehicles
        const vehicleCount = await Vehicule.count();
        if (vehicleCount === 0 && allAgences.length > 0) {
            await Vehicule.bulkCreate([
                {
                    agence_id: allAgences[0].id,
                    immatriculation: 'A-12345-20',
                    vin: 'VF1RFE00123456789',
                    marque: 'Renault',
                    modele: 'Clio',
                    annee: 2022,
                    categorie: 'economique',
                    etat: 'disponible',
                    km: 15000,
                    carburant: 'diesel',
                    boite: 'manuelle',
                    prix_jour: 250,
                    images: ['/images/clio1.jpg', '/images/clio2.jpg']
                },
                {
                    agence_id: allAgences[0].id,
                    immatriculation: 'B-67890-21',
                    vin: 'VF3LCYHZM12345678',
                    marque: 'Peugeot',
                    modele: '208',
                    annee: 2021,
                    categorie: 'economique',
                    etat: 'disponible',
                    km: 22000,
                    carburant: 'essence',
                    boite: 'automatique',
                    prix_jour: 280,
                    images: ['/images/208_1.jpg']
                },
                {
                    agence_id: allAgences[1].id,
                    immatriculation: 'C-11111-22',
                    vin: 'UU1PCBHZH12345678',
                    marque: 'Dacia',
                    modele: 'Logan',
                    annee: 2022,
                    categorie: 'moyenne',
                    etat: 'disponible',
                    km: 8000,
                    carburant: 'diesel',
                    boite: 'manuelle',
                    prix_jour: 220,
                    images: []
                },
                {
                    agence_id: allAgences[1].id,
                    immatriculation: 'D-22222-20',
                    vin: 'WDB1234567890ABCD',
                    marque: 'Mercedes',
                    modele: 'Classe A',
                    annee: 2020,
                    categorie: 'luxe',
                    etat: 'reserve',
                    km: 35000,
                    carburant: 'essence',
                    boite: 'automatique',
                    prix_jour: 650,
                    images: ['/images/mercedesA.jpg']
                },
                {
                    agence_id: allAgences[2].id,
                    immatriculation: 'E-33333-23',
                    vin: 'WVWZZZ1KZAW123456',
                    marque: 'Volkswagen',
                    modele: 'Tiguan',
                    annee: 2023,
                    categorie: 'suv',
                    etat: 'disponible',
                    km: 5000,
                    carburant: 'diesel',
                    boite: 'automatique',
                    prix_jour: 550,
                    images: ['/images/tiguan1.jpg', '/images/tiguan2.jpg']
                }
            ]);
            console.log('Vehicles created');
        }

        // 6. Create Clients
        const clientCount = await Client.count();
        if (clientCount === 0) {
            await Client.bulkCreate([
                {
                    nom: 'Ahmed Benali',
                    telephone: '0661234567',
                    cni_passport: 'AB123456',
                    email: 'ahmed.benali@email.com',
                    adresse: 'Casablanca, Maarif',
                    permis_conduire: 'P123456',
                    date_naissance: new Date('1985-05-15')
                },
                {
                    nom: 'Fatima Zahra',
                    telephone: '0662345678',
                    cni_passport: 'CD789012',
                    email: 'fatima.zahra@email.com',
                    adresse: 'Rabat, Hassan',
                    permis_conduire: 'P789012',
                    date_naissance: new Date('1990-08-22')
                },
                {
                    nom: 'Mohammed Alami',
                    telephone: '0663456789',
                    cni_passport: 'EF345678',
                    email: 'mohammed.alami@email.com',
                    adresse: 'Marrakech, Gueliz',
                    permis_conduire: 'P345678',
                    date_naissance: new Date('1978-12-10')
                }
            ]);
            console.log('Clients created');
        }

        // 7. Create Admin User
        const existingAdmin = await User.findOne({ where: { email: 'admin@rentmaroc.com' } });
        if (!existingAdmin && allAgences.length > 0) {
            await User.create({
                name: 'Super Admin',
                email: 'admin@rentmaroc.com',
                password_hash: 'admin123', // Hook will hash this
                role_id: adminRole.id,
                agence_id: allAgences[0].id,
                status: 'active'
            });
            console.log('Admin user created: admin@rentmaroc.com / admin123');
        } else if (existingAdmin) {
            // Update existing admin to have the role if missing
            if (!existingAdmin.role_id) {
                existingAdmin.role_id = adminRole.id;
                await existingAdmin.save();
                console.log('Updated existing admin with Admin role');
            }
            console.log('Admin user ready');
        }

        console.log('\n✅ Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seed();
