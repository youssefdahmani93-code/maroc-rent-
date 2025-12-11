require('dotenv').config({ path: 'backend/.env' });
const { Reservation, Setting, Client, Vehicule, Agence } = require('../src/models');
const sequelize = require('../src/config/database');

async function testCaution() {
    try {
        console.log('Starting Caution Calculation Test...');

        // 1. Set Caution Percentage
        console.log('Setting caution_percentage to 10%...');
        let setting = await Setting.findByPk('caution_percentage');
        if (setting) {
            await setting.update({ value: '10' });
        } else {
            await Setting.create({
                key: 'caution_percentage',
                value: '10',
                category: 'finance',
                type: 'number'
            });
        }

        // 2. Create Dummy Data (Client, Vehicle, Agency) if needed, or pick existing
        // For simplicity, let's try to pick existing first, or create if not found.
        const client = await Client.findOne() || await Client.create({
            nom: 'Test Client',
            prenom: 'Caution',
            email: 'test@caution.com',
            telephone: '0600000000',
            permis: '12345'
        });

        const agence = await Agence.findOne() || await Agence.create({
            nom: 'Test Agence',
            ville: 'Test City'
        });

        const vehicule = await Vehicule.findOne() || await Vehicule.create({
            marque: 'Test',
            modele: 'Auto',
            immatriculation: '1234-A-56',
            agence_id: agence.id,
            categorie: 'economique',
            prix_jour: 100
        });

        // 3. Create Reservation via API would be best to test the route, 
        // but since this is a script running in the backend context, we can simulate the logic 
        // OR we can use axios to call the running server.
        // However, the logic is inside the route handler. 
        // To test the route handler logic specifically, we should ideally call the API.
        // But for quick verification of the *logic* if I had put it in a model hook, model test would be fine.
        // Since I put it in the route, I should test the route.

        // Use fetch to call the local API.
        const API_URL = 'http://localhost:3000/api'; // Port 3000

        console.log('Creating Reservation via API...');
        const reservationData = {
            client_id: client.id,
            vehicule_id: vehicule.id,
            agence_retrait_id: agence.id,
            agence_retour_id: agence.id,
            date_debut: new Date(),
            date_fin: new Date(new Date().setDate(new Date().getDate() + 3)),
            prix_total: 300 // 3 days * 100
            // caution is OMITTED
        };

        try {
            const response = await fetch(`${API_URL}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const reservation = await response.json();

            console.log('Reservation created:', reservation.id);
            console.log('Prix Total:', reservation.prix_total);
            console.log('Caution:', reservation.caution);

            const expectedCaution = 300 * 0.10; // 30
            if (parseFloat(reservation.caution) === expectedCaution) {
                console.log('✅ SUCCESS: Caution calculated correctly!');
            } else {
                console.error(`❌ FAILURE: Expected caution ${expectedCaution}, got ${reservation.caution}`);
            }

            // Cleanup
            await Reservation.destroy({ where: { id: reservation.id } });

        } catch (apiError) {
            console.error('API Error:', apiError.message);
        }

    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        // await sequelize.close(); // Don't close if we want to keep app running or if using axios
    }
}

testCaution();
