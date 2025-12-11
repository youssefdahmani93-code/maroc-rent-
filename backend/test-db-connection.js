const sequelize = require('./src/config/database');

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connection to database has been established successfully.');
        console.log('Database:', sequelize.config.database);
        console.log('Host:', sequelize.config.host);
        console.log('Port:', sequelize.config.port);
        console.log('User:', sequelize.config.username);
        process.exit(0);
    } catch (error) {
        console.error('❌ Unable to connect to the database:');
        console.error('Error:', error.message);
        console.error('\nPlease check:');
        console.error('1. PostgreSQL is running');
        console.error('2. Database credentials in .env file are correct');
        console.error('3. Database "rentmaroc" exists');
        process.exit(1);
    }
}

testConnection();
