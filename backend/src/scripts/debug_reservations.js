require('dotenv').config();
const { Reservation, Client, Vehicule, Agence } = require('../models');
const sequelize = require('../config/database');

async function debugReservations() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Fetching reservations...');
        const reservations = await Reservation.findAll({
            include: [
                { model: Client, as: 'client' },
                { model: Vehicule, as: 'vehicule' },
                { model: Agence, as: 'agence_retrait' },
                { model: Agence, as: 'agence_retour' }
            ],
            order: [['cree_le', 'DESC']]
        });
        console.log(`Reservations found: ${reservations.length}`);

    } catch (error) {
        console.error('Error fetching reservations:', error);
    } finally {
        await sequelize.close();
    }
}

debugReservations();
