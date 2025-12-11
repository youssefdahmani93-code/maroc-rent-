// Simple Node.js script to hash password and show SQL
const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log('Password:', password);
    console.log('Hashed:', hash);
    console.log('\nSQL to insert user:');
    console.log(`
-- Delete existing user if exists
DELETE FROM users WHERE email = 'admin@gorent.com';

-- Insert admin user
INSERT INTO users (name, email, password_hash, status, phone, created_at, updated_at)
VALUES (
    'Admin GoRent',
    'admin@gorent.com',
    '${hash}',
    'active',
    '+212600000000',
    NOW(),
    NOW()
);

-- Verify
SELECT id, name, email, status FROM users WHERE email = 'admin@gorent.com';
    `);
}

generateHash();
