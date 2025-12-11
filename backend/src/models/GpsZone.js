const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GpsZone = sequelize.define('GpsZone', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'autorisee',
        validate: {
            isIn: [['autorisee', 'interdite']]
        }
    },
    coordonnees: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Array of [lat, lng] points forming a polygon'
    },
    agence_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'agences',
            key: 'id'
        }
    },
    actif: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    couleur: {
        type: DataTypes.STRING(7),
        allowNull: true,
        defaultValue: '#3388ff'
    }
}, {
    tableName: 'gps_zones',
    timestamps: true,
    createdAt: 'cree_le',
    updatedAt: 'modifie_le'
});

module.exports = GpsZone;
