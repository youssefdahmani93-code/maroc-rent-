-- Create test admin user with pre-hashed password
-- Password: admin123
-- Hashed with bcrypt (10 rounds): $2a$10$YourHashHere

-- First, ensure Admin role exists
INSERT INTO roles (name, description, is_system, created_at, updated_at)
VALUES ('Admin', 'Administrateur avec tous les droits', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Get the role ID
DO $$
DECLARE
    admin_role_id INTEGER;
BEGIN
    SELECT id INTO admin_role_id FROM roles WHERE name = 'Admin' LIMIT 1;
    
    -- Delete existing user if exists
    DELETE FROM users WHERE email = 'admin@gorent.com';
    
    -- Insert new admin user with hashed password
    -- Password is 'admin123' hashed with bcrypt
    INSERT INTO users (name, email, password_hash, role_id, status, phone, created_at, updated_at)
    VALUES (
        'Admin GoRent',
        'admin@gorent.com',
        '$2a$10$rOZJQGKqVXW7fLXq5fYqHOKKjYxGfz5H.Wz6vKqYqYqYqYqYqYqYq', -- This is a placeholder, will be replaced
        admin_role_id,
        'active',
        '+212600000000',
        NOW(),
        NOW()
    );
END $$;

-- Verify user was created
SELECT id, name, email, status, role_id FROM users WHERE email = 'admin@gorent.com';
