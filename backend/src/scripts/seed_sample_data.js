// Seed script to add sample data for testing dashboard
const sequelize = require('../config/database');
const { Vehicule, Client, Agence, Reservation, Contrat, Paiement, Maintenance } = require('../models');

async function seedData() {
    try {
        console.log('Starting data seeding...');

        // 1. Create a sample agency
        const [agence] = await Agence.findOrCreate({
            where: { nom: 'Agence Casablanca' },
            defaults: {
                ville: 'Casablanca',
                adresse: '123 Rue Mohammed V',
                telephone: '+212 5 22 12 34 56',
                email: 'casa@gorent.ma'
            }
        });
        console.log('✓ Agency created');

        // 2. Create sample vehicles
        const vehicles = [];
        const vehicleData = [
            { immatriculation: 'A-12345-20', marque: 'Renault', modele: 'Clio', annee: 2022, categorie: 'economique', prix_jour: 250, etat: 'disponible' },
            { immatriculation: 'B-67890-21', marque: 'Peugeot', modele: '208', annee: 2023, categorie: 'economique', prix_jour: 280, etat: 'disponible' },
            { immatriculation: 'C-11111-22', marque: 'Dacia', modele: 'Sandero', annee: 2021, categorie: 'economique', prix_jour: 220, etat: 'reserve' },
            { immatriculation: 'D-22222-23', marque: 'Toyota', modele: 'Corolla', annee: 2023, categorie: 'moyenne', prix_jour: 350, etat: 'disponible' },
            { immatriculation: 'E-33333-24', marque: 'Mercedes', modele: 'Classe C', annee: 2024, categorie: 'luxe', prix_jour: 800, etat: 'reserve' },
            { immatriculation: 'F-44444-25', marque: 'BMW', modele: 'X5', annee: 2023, categorie: 'suv', prix_jour: 900, etat: 'en_maintenance' }
        ];

        for (const vData of vehicleData) {
            const [vehicle] = await Vehicule.findOrCreate({
                where: { immatriculation: vData.immatriculation },
                defaults: {
                    ...vData,
                    agence_id: agence.id,
                    couleur: 'Noir',
                    portes: 5,
                    places: 5,
                    carburant: 'essence',
                    boite: 'manuelle',
                    km: 50000
                }
            });
            vehicles.push(vehicle);
        }
        console.log(`✓ ${vehicles.length} vehicles created`);

        // 3. Create sample clients
        const clients = [];
        const clientData = [
            { nom: 'Ahmed Benali', email: 'ahmed@example.com', telephone: '+212 6 12 34 56 78', cin: 'AB123456', permis: 'P123456' },
            { nom: 'Fatima Zahra', email: 'fatima@example.com', telephone: '+212 6 23 45 67 89', cin: 'CD789012', permis: 'P789012' },
            { nom: 'Mohammed Alami', email: 'mohammed@example.com', telephone: '+212 6 34 56 78 90', cin: 'EF345678', permis: 'P345678' }
        ];

        for (const cData of clientData) {
            const [client] = await Client.findOrCreate({
                where: { email: cData.email },
                defaults: {
                    ...cData,
                    adresse: 'Casablanca, Maroc',
                    ville: 'Casablanca'
                }
            });
            clients.push(client);
        }
        console.log(`✓ ${clients.length} clients created`);

        // 4. Create sample reservations
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const [reservation1] = await Reservation.findOrCreate({
            where: { client_id: clients[0].id, vehicule_id: vehicles[2].id },
            defaults: {
                date_debut: tomorrow,
                date_fin: nextWeek,
                agence_retrait_id: agence.id,
                agence_retour_id: agence.id,
                prix_total: vehicles[2].prix_jour * 6,
                caution: vehicles[2].prix_jour * 6 * 0.3,
                statut: 'confirmee'
            }
        });
        console.log('✓ Reservations created');

        // 5. Create sample contracts
        const lastMonth = new Date(now);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthEnd = new Date(lastMonth);
        lastMonthEnd.setDate(lastMonthEnd.getDate() + 5);

        const [contrat1] = await Contrat.findOrCreate({
            where: { numero: 'CTR-2024-001' },
            defaults: {
                numero: 'CTR-2024-001',
                client_id: clients[1].id,
                vehicule_id: vehicles[4].id,
                agence_id: agence.id,
                date_debut: lastMonth,
                date_fin: lastMonthEnd,
                montant_total: vehicles[4].prix_jour * 5,
                caution: 2000,
                statut: 'actif',
                type: 'contrat'
            }
        });
        console.log('✓ Contracts created');

        // 6. Create sample payments
        const [paiement1] = await Paiement.findOrCreate({
            where: { reference_paiement: 'PAY-001' },
            defaults: {
                client_id: clients[1].id,
                type_paiement: 'contrat',
                reference_id: contrat1.id,
                montant_total: vehicles[4].prix_jour * 5,
                montant_paye: vehicles[4].prix_jour * 5,
                reste_a_payer: 0,
                methode_paiement: 'carte',
                reference_paiement: 'PAY-001',
                statut: 'paye',
                date_paiement: lastMonth
            }
        });

        const [paiement2] = await Paiement.findOrCreate({
            where: { reference_paiement: 'PAY-002' },
            defaults: {
                client_id: clients[0].id,
                type_paiement: 'reservation',
                reference_id: reservation1.id,
                montant_total: vehicles[2].prix_jour * 6,
                montant_paye: vehicles[2].prix_jour * 6 * 0.3,
                reste_a_payer: vehicles[2].prix_jour * 6 * 0.7,
                methode_paiement: 'especes',
                reference_paiement: 'PAY-002',
                statut: 'partiel',
                date_paiement: now
            }
        });
        console.log('✓ Payments created');

        // 7. Create sample maintenance
        const maintenanceStart = new Date(now);
        maintenanceStart.setDate(maintenanceStart.getDate() - 2);
        const maintenanceEnd = new Date(now);
        maintenanceEnd.setDate(maintenanceEnd.getDate() + 1);

        await Maintenance.findOrCreate({
            where: { vehicule_id: vehicles[5].id },
            defaults: {
                vehicule_id: vehicles[5].id,
                type: 'entretien',
                date_entree: maintenanceStart,
                date_sortie_prevue: maintenanceEnd,
                description: 'Révision complète + changement huile',
                cout_estime: 1500,
                statut: 'en_cours'
            }
        });
        console.log('✓ Maintenance records created');

        console.log('\n✅ Sample data seeded successfully!');
        console.log('\nSummary:');
        console.log(`- 1 Agency`);
        console.log(`- ${vehicles.length} Vehicles`);
        console.log(`- ${clients.length} Clients`);
        console.log(`- 1 Reservation`);
        console.log(`- 1 Contract`);
        console.log(`- 2 Payments`);
        console.log(`- 1 Maintenance`);
        console.log('\nYou can now refresh the dashboard to see the data!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

// Run the seed
seedData();
