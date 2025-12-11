require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 3000;

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function connectWithRetry(retries = MAX_RETRIES) {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        return true;
    } catch (error) {
        if (retries > 0) {
            console.log(`Unable to connect to the database. Retrying in ${RETRY_DELAY / 1000}s... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return connectWithRetry(retries - 1);
        } else {
            console.error('Unable to connect to the database after multiple attempts:', error);
            process.exit(1);
        }
    }
}

async function startServer() {
    await connectWithRetry();

    // Load model associations
    require('./models');

    // Sync models (temporarily use alter to create new tables)
    await sequelize.sync({ force: false, alter: true });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();
