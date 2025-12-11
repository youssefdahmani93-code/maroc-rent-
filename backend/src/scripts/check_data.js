require('dotenv').config();
const { Client, Vehicule, Agence } = require('../models');
const sequelize = require('../config/database');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const clients = await Client.findAll();
        console.log(`Clients found: ${clients.length}`);
        clients.forEach(c => console.log(` - ${c.id}: ${c.nom}`));

        const vehicules = await Vehicule.findAll();
        console.log(`Vehicules found: ${vehicules.length}`);

        const agences = await Agence.findAll();
        console.log(`Agences found: ${agences.length}`);

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        await sequelize.close();
    }
}

checkData();
