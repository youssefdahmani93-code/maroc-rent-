-- Seed Permissions and Default Roles
-- Run this SQL script in your PostgreSQL database

-- First, create permissions if they don't exist
INSERT INTO permissions (name, description, category, created_at, updated_at) VALUES
-- Véhicules
('vehicles.view', 'Voir les véhicules', 'vehicles', NOW(), NOW()),
('vehicles.create', 'Créer des véhicules', 'vehicles', NOW(), NOW()),
('vehicles.edit', 'Modifier les véhicules', 'vehicles', NOW(), NOW()),
('vehicles.delete', 'Supprimer les véhicules', 'vehicles', NOW(), NOW()),

-- Réservations
('reservations.view', 'Voir les réservations', 'reservations', NOW(), NOW()),
('reservations.create', 'Créer des réservations', 'reservations', NOW(), NOW()),
('reservations.edit', 'Modifier les réservations', 'reservations', NOW(), NOW()),
('reservations.delete', 'Supprimer les réservations', 'reservations', NOW(), NOW()),

-- Clients
('clients.view', 'Voir les clients', 'clients', NOW(), NOW()),
('clients.create', 'Créer des clients', 'clients', NOW(), NOW()),
('clients.edit', 'Modifier les clients', 'clients', NOW(), NOW()),
('clients.delete', 'Supprimer les clients', 'clients', NOW(), NOW()),

-- Contrats
('contracts.view', 'Voir les contrats', 'contracts', NOW(), NOW()),
('contracts.create', 'Créer des contrats', 'contracts', NOW(), NOW()),
('contracts.edit', 'Modifier les contrats', 'contracts', NOW(), NOW()),
('contracts.delete', 'Supprimer les contrats', 'contracts', NOW(), NOW()),

-- Paiements
('payments.view', 'Voir les paiements', 'payments', NOW(), NOW()),
('payments.create', 'Créer des paiements', 'payments', NOW(), NOW()),
('payments.edit', 'Modifier les paiements', 'payments', NOW(), NOW()),
('payments.delete', 'Supprimer les paiements', 'payments', NOW(), NOW()),

-- Maintenance
('maintenance.view', 'Voir la maintenance', 'maintenance', NOW(), NOW()),
('maintenance.create', 'Créer des maintenances', 'maintenance', NOW(), NOW()),
('maintenance.edit', 'Modifier les maintenances', 'maintenance', NOW(), NOW()),
('maintenance.delete', 'Supprimer les maintenances', 'maintenance', NOW(), NOW()),

-- Rapports
('reports.view', 'Voir les rapports', 'reports', NOW(), NOW()),
('reports.export', 'Exporter les rapports', 'reports', NOW(), NOW()),

-- Utilisateurs
('users.view', 'Voir les utilisateurs', 'users', NOW(), NOW()),
('users.create', 'Créer des utilisateurs', 'users', NOW(), NOW()),
('users.edit', 'Modifier les utilisateurs', 'users', NOW(), NOW()),
('users.delete', 'Supprimer les utilisateurs', 'users', NOW(), NOW()),

-- Rôles
('roles.view', 'Voir les rôles', 'roles', NOW(), NOW()),
('roles.create', 'Créer des rôles', 'roles', NOW(), NOW()),
('roles.edit', 'Modifier les rôles', 'roles', NOW(), NOW()),
('roles.delete', 'Supprimer les rôles', 'roles', NOW(), NOW()),

-- Paramètres
('settings.view', 'Voir les paramètres', 'settings', NOW(), NOW()),
('settings.edit', 'Modifier les paramètres', 'settings', NOW(), NOW())

ON CONFLICT (name) DO NOTHING;

-- Create default roles if they don't exist
INSERT INTO roles (name, description, is_system, created_at, updated_at) VALUES
('Admin', 'Administrateur avec tous les droits', true, NOW(), NOW()),
('Manager', 'Gestionnaire avec droits limités', true, NOW(), NOW()),
('Employee', 'Employé avec droits de base', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Assign ALL permissions to Admin role
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'Admin'),
    p.id,
    NOW(),
    NOW()
FROM permissions p
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign limited permissions to Manager role
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'Manager'),
    p.id,
    NOW(),
    NOW()
FROM permissions p
WHERE p.name IN (
    'vehicles.view', 'vehicles.create', 'vehicles.edit',
    'reservations.view', 'reservations.create', 'reservations.edit',
    'clients.view', 'clients.create', 'clients.edit',
    'contracts.view', 'contracts.create', 'contracts.edit',
    'payments.view', 'payments.create', 'payments.edit',
    'maintenance.view', 'maintenance.create', 'maintenance.edit',
    'reports.view',
    'settings.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign basic permissions to Employee role
INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'Employee'),
    p.id,
    NOW(),
    NOW()
FROM permissions p
WHERE p.name IN (
    'vehicles.view',
    'reservations.view', 'reservations.create',
    'clients.view', 'clients.create',
    'contracts.view',
    'payments.view',
    'maintenance.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verify the data
SELECT 'Permissions created:' as info, COUNT(*) as count FROM permissions;
SELECT 'Roles created:' as info, COUNT(*) as count FROM roles;
SELECT 'Role-Permission assignments:' as info, COUNT(*) as count FROM role_permissions;
