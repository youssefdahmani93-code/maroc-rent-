require('dotenv').config();
const { Contrat, Client, Vehicule, Agence } = require('./src/models');

async function testContractCreation() {
    try {
        console.log('Testing contract creation...');

        // Test data
        const contractData = {
            type: 'devis',
            numero: 'TEST-001',
            client_id: 1,
            vehicule_id: 1,
            agence_id: 1,
            date_debut: '2025-12-01',
            date_fin: '2025-12-05',
            prix_journalier: 1000,
            nombre_jours: 4,
            reduction: 0,
            frais_chauffeur: 0,
            frais_livraison: 0,
            frais_carburant: 0,
            frais_depassement_km: 0,
            montant_total: 4000,
            acompte: 0,
            reste_a_payer: 4000,
            extras: [],
            terms_accepted: true
        };

        console.log('Creating contract with data:', contractData);
        const contract = await Contrat.create(contractData);
        console.log('Contract created successfully:', contract.toJSON());

        process.exit(0);
    } catch (error) {
        console.error('Error creating contract:', error);
        process.exit(1);
    }
}

testContractCreation();
