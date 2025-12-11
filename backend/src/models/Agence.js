const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agence = sequelize.define('Agence', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    ville: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    adresse: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    telephone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    ice: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
}, {
    tableName: 'agences',
    timestamps: true,
    createdAt: 'cree_le',
    updatedAt: 'modifie_le'
});

module.exports = Agence;
