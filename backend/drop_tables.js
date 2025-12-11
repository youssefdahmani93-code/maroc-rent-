require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'rentmaroc',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

async function dropTables() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database');

        await sequelize.query('DROP TABLE IF EXISTS paiements CASCADE');
        console.log('✓ Dropped paiements table');

        await sequelize.query('DROP TABLE IF EXISTS devis CASCADE');
        console.log('✓ Dropped devis table');

        console.log('\n✅ Tables dropped successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

dropTables();
