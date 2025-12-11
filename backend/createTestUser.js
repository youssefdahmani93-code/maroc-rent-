const { User, Role } = require('./src/models');
const sequelize = require('./src/config/database');

async function createTestUser() {
    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // Find or create Admin role
        const [adminRole] = await Role.findOrCreate({
            where: { name: 'Admin' },
            defaults: {
                name: 'Admin',
                description: 'Administrateur avec tous les droits',
                is_system: true
            }
        });
        console.log('✓ Admin role ready');

        // Check if admin user exists
        const existingUser = await User.findOne({ where: { email: 'admin@gorent.com' } });

        if (existingUser) {
            console.log('ℹ User already exists: admin@gorent.com');
            console.log('  Email: admin@gorent.com');
            console.log('  Password: admin123');
            console.log('  Status:', existingUser.status);

            // Update password if needed
            existingUser.password_hash = 'admin123';
            existingUser.status = 'active';
            await existingUser.save();
            console.log('✓ Password reset to: admin123');
        } else {
            // Create admin user
            const adminUser = await User.create({
                name: 'Admin GoRent',
                email: 'admin@gorent.com',
                password_hash: 'admin123', // Will be hashed by model hook
                role_id: adminRole.id,
                status: 'active',
                phone: '+212600000000'
            });
            console.log('✓ Created admin user');
            console.log('  Email: admin@gorent.com');
            console.log('  Password: admin123');
        }

        console.log('\n✅ You can now login with:');
        console.log('   Email: admin@gorent.com');
        console.log('   Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createTestUser();
