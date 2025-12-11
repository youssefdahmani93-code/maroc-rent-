const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GpsAlerte = sequelize.define('GpsAlerte', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    vehicule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'vehicules',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isIn: [[
                'exces_vitesse',
                'sortie_zone',
                'arret_prolonge',
                'gps_deconnecte',
                'suspicion_vol'
            ]]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
    },
    valeur: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    statut: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'en_attente',
        validate: {
            isIn: [['en_attente', 'en_cours', 'resolue', 'critique']]
        }
    },
    notifie: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'gps_alertes',
    timestamps: true,
    createdAt: 'cree_le',
    updatedAt: 'modifie_le'
});

module.exports = GpsAlerte;
