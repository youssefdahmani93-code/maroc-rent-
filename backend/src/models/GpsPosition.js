const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GpsPosition = sequelize.define('GpsPosition', {
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
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
    },
    vitesse: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0
    },
    direction: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 360
        }
    },
    altitude: {
        type: DataTypes.DECIMAL(7, 2),
        allowNull: true
    },
    precision: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    adresse: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    statut: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'actif',
        validate: {
            isIn: [['actif', 'inactif']]
        }
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'gps_positions',
    timestamps: true,
    createdAt: 'cree_le',
    updatedAt: 'modifie_le',
    indexes: [
        {
            fields: ['vehicule_id', 'timestamp']
        }
    ]
});

module.exports = GpsPosition;
