
const express = require('express');
const router = express.Router();
const { Client, Reservation, Vehicule } = require('../models');
const { Op } = require('sequelize');

// POST /api/public/bookings - Create a booking from the public landing page
router.post('/bookings', async (req, res) => {
    const {
        vehicle_id,
        date_debut,
        date_fin,
        agence_retrait_id,
        agence_retour_id,
        client_nom,
        client_email,
        client_telephone,
        client_cin,
        client_permis
    } = req.body;

    if (!vehicle_id || !date_debut || !date_fin || !agence_retrait_id || !client_nom || !client_email || !client_telephone || !client_cin) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // 1. Find or create the client
        let client = await Client.findOne({
            where: {
                [Op.or]: [
                    { email: client_email },
                    { cin: client_cin }
                ]
            }
        });

        if (!client) {
            client = await Client.create({
                nom: client_nom,
                email: client_email,
                telephone: client_telephone,
                cin: client_cin,
                permis: client_permis,
                statut: 'potentiel' 
            });
        }

        // 2. Check vehicle availability
        const conflictingReservations = await Reservation.findAll({
            where: {
                vehicule_id: vehicle_id,
                statut: { [Op.in]: ['en_attente', 'confirmee', 'en_cours'] },
                [Op.or]: [
                    { date_debut: { [Op.between]: [new Date(date_debut), new Date(date_fin)] } },
                    { date_fin: { [Op.between]: [new Date(date_debut), new Date(date_fin)] } },
                    {
                        [Op.and]: [
                            { date_debut: { [Op.lte]: new Date(date_debut) } },
                            { date_fin: { [Op.gte]: new Date(date_fin) } }
                        ]
                    }
                ]
            }
        });

        if (conflictingReservations.length > 0) {
            return res.status(400).json({ message: 'Vehicle not available for the selected dates' });
        }

        // 3. Create the reservation
        const vehicule = await Vehicule.findByPk(vehicle_id);
        const dateDebut = new Date(date_debut);
        const dateFin = new Date(date_fin);
        const nombreJours = Math.max(1, Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24)));
        const prixTotal = nombreJours * (vehicule ? vehicule.prix_jour : 0);

        const reservation = await Reservation.create({
            client_id: client.id,
            vehicule_id: vehicle_id,
            date_debut: date_debut,
            date_fin: date_fin,
            agence_retrait_id: agence_retrait_id,
            agence_retour_id: agence_retour_id || agence_retrait_id,
            prix_total: prixTotal,
            statut: 'en_attente', 
            source: 'landing_page'
        });

        res.status(201).json({
            message: 'Booking created successfully',
            reference: reservation.id 
        });

    } catch (error) {
        console.error('Error creating public booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
