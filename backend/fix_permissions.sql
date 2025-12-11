-- Fix permission names to match backend code
UPDATE permissions SET name = 'vehicules.view', category = 'vehicules' WHERE name = 'vehicles.view';
UPDATE permissions SET name = 'vehicules.create', category = 'vehicules' WHERE name = 'vehicles.create';
UPDATE permissions SET name = 'vehicules.edit', category = 'vehicules' WHERE name = 'vehicles.edit';
UPDATE permissions SET name = 'vehicules.delete', category = 'vehicules' WHERE name = 'vehicles.delete';

-- Verify
SELECT name, category FROM permissions WHERE category = 'vehicules';
