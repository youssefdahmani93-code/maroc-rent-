const express = require('express');
const router = express.Router();
const { GpsPosition, GpsAlerte, GpsZone, Vehicule, Agence } = require('../models');
const { Op } = require('sequelize');

// GET /api/gps/positions - Positions actuelles de tous les véhicules
router.get('/positions', async (req, res) => {
    try {
        const { agence_id, statut } = req.query;

        // Récupérer la dernière position de chaque véhicule
        const vehicules = await Vehicule.findAll({
            where: agence_id ? { agence_id } : {},
            include: [
                {
                    model: GpsPosition,
                    as: 'gps_positions',
                    limit: 1,
                    order: [['timestamp', 'DESC']],
                    separate: true
                },
                {
                    model: Agence,
                    as: 'agence',
                    attributes: ['id', 'nom', 'ville']
                }
            ]
        });

        // Formater les données pour la carte
        const positions = vehicules.map(v => {
            const lastPosition = v.gps_positions[0];
            return {
                vehicule_id: v.id,
                marque: v.marque,
                modele: v.modele,
                immatriculation: v.immatriculation,
                etat: v.etat,
                agence: v.agence,
                gps: lastPosition || null
            };
        }).filter(v => v.gps !== null);

        res.json(positions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/gps/positions/:vehicule_id - Position d'un véhicule spécifique
router.get('/positions/:vehicule_id', async (req, res) => {
    try {
        const positions = await GpsPosition.findAll({
            where: { vehicule_id: req.params.vehicule_id },
            order: [['timestamp', 'DESC']],
            limit: 100
        });

        res.json(positions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/gps/trajets/:vehicule_id - Trajet d'un véhicule (par date)
router.get('/trajets/:vehicule_id', async (req, res) => {
    try {
        const { date } = req.query;
        const vehiculeId = req.params.vehicule_id;

        let startDate, endDate;
        if (date) {
            startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
        } else {
            // Aujourd'hui par défaut
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
        }

        const positions = await GpsPosition.findAll({
            where: {
                vehicule_id: vehiculeId,
                timestamp: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['timestamp', 'ASC']]
        });

        // Calculer les statistiques
        let distanceTotale = 0;
        let vitesseMax = 0;
        let vitesseMoyenne = 0;
        const arrets = [];

        if (positions.length > 0) {
            vitesseMax = Math.max(...positions.map(p => parseFloat(p.vitesse) || 0));
            const vitesseSum = positions.reduce((sum, p) => sum + (parseFloat(p.vitesse) || 0), 0);
            vitesseMoyenne = vitesseSum / positions.length;

            // Calculer distance approximative (formule de Haversine simplifiée)
            for (let i = 1; i < positions.length; i++) {
                const lat1 = parseFloat(positions[i - 1].latitude);
                const lon1 = parseFloat(positions[i - 1].longitude);
                const lat2 = parseFloat(positions[i].latitude);
                const lon2 = parseFloat(positions[i].longitude);

                const R = 6371; // Rayon de la Terre en km
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                distanceTotale += R * c;
            }

            // Détecter les arrêts (vitesse < 5 km/h pendant > 5 minutes)
            let arretDebut = null;
            for (let i = 0; i < positions.length; i++) {
                const vitesse = parseFloat(positions[i].vitesse) || 0;
                if (vitesse < 5) {
                    if (!arretDebut) arretDebut = positions[i];
                } else {
                    if (arretDebut) {
                        const duree = (new Date(positions[i].timestamp) - new Date(arretDebut.timestamp)) / 1000 / 60;
                        if (duree > 5) {
                            arrets.push({
                                debut: arretDebut.timestamp,
                                fin: positions[i].timestamp,
                                duree: Math.round(duree),
                                latitude: arretDebut.latitude,
                                longitude: arretDebut.longitude,
                                adresse: arretDebut.adresse
                            });
                        }
                        arretDebut = null;
                    }
                }
            }
        }

        const stats = {
            distance_totale: Math.round(distanceTotale * 100) / 100,
            vitesse_max: Math.round(vitesseMax),
            vitesse_moyenne: Math.round(vitesseMoyenne),
            duree_totale: positions.length > 0 ?
                Math.round((new Date(positions[positions.length - 1].timestamp) - new Date(positions[0].timestamp)) / 1000 / 60) : 0,
            nombre_arrets: arrets.length
        };

        res.json({
            positions,
            stats,
            arrets
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/gps/alertes - Liste des alertes GPS
router.get('/alertes', async (req, res) => {
    try {
        const { statut, type, vehicule_id } = req.query;
        const where = {};

        if (statut) where.statut = statut;
        if (type) where.type = type;
        if (vehicule_id) where.vehicule_id = vehicule_id;

        const alertes = await GpsAlerte.findAll({
            where,
            include: [{
                model: Vehicule,
                as: 'vehicule',
                attributes: ['id', 'marque', 'modele', 'immatriculation']
            }],
            order: [['timestamp', 'DESC']],
            limit: 100
        });

        res.json(alertes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST /api/gps/alertes/:id/resolve - Marquer une alerte comme résolue
router.post('/alertes/:id/resolve', async (req, res) => {
    try {
        const alerte = await GpsAlerte.findByPk(req.params.id);

        if (!alerte) {
            return res.status(404).json({ message: 'Alerte non trouvée' });
        }

        await alerte.update({ statut: 'resolue' });
        res.json(alerte);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET /api/gps/zones - Liste des zones géographiques
router.get('/zones', async (req, res) => {
    try {
        const { agence_id } = req.query;
        const where = { actif: true };

        if (agence_id) where.agence_id = agence_id;

        const zones = await GpsZone.findAll({
            where,
            include: [{
                model: Agence,
                as: 'agence',
                attributes: ['id', 'nom', 'ville']
            }]
        });

        res.json(zones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST /api/gps/zones - Créer une zone
router.post('/zones', async (req, res) => {
    try {
        const zone = await GpsZone.create(req.body);
        res.status(201).json(zone);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de la zone' });
    }
});

// GET /api/gps/stats - Statistiques GPS pour le dashboard
router.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Nombre total de véhicules
        const totalVehicules = await Vehicule.count();

        // Véhicules avec GPS actif (position dans les 30 dernières minutes)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const vehiculesActifs = await GpsPosition.count({
            distinct: true,
            col: 'vehicule_id',
            where: {
                timestamp: {
                    [Op.gte]: thirtyMinutesAgo
                }
            }
        });

        // Alertes en attente
        const alertesEnAttente = await GpsAlerte.count({
            where: {
                statut: { [Op.in]: ['en_attente', 'critique'] }
            }
        });

        // Distance totale aujourd'hui (approximation)
        const positionsToday = await GpsPosition.findAll({
            where: {
                timestamp: {
                    [Op.gte]: today
                }
            },
            order: [['vehicule_id', 'ASC'], ['timestamp', 'ASC']]
        });

        let distanceTotale = 0;
        let currentVehicule = null;
        let lastPosition = null;

        positionsToday.forEach(pos => {
            if (currentVehicule !== pos.vehicule_id) {
                currentVehicule = pos.vehicule_id;
                lastPosition = pos;
            } else if (lastPosition) {
                const lat1 = parseFloat(lastPosition.latitude);
                const lon1 = parseFloat(lastPosition.longitude);
                const lat2 = parseFloat(pos.latitude);
                const lon2 = parseFloat(pos.longitude);

                const R = 6371;
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                distanceTotale += R * c;

                lastPosition = pos;
            }
        });

        res.json({
            total_vehicules: totalVehicules,
            vehicules_actifs: vehiculesActifs,
            alertes_en_attente: alertesEnAttente,
            distance_totale_aujourd_hui: Math.round(distanceTotale * 100) / 100
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
