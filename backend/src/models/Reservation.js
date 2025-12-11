const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'clients',
            key: 'id'
        }
    },
    vehicule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'vehicules',
            key: 'id'
        }
    },
    agence_retrait_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'agences',
            key: 'id'
        }
    },
    agence_retour_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'agences',
            key: 'id'
        }
    },
    date_debut: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_fin: {
        type: DataTypes.DATE,
        allowNull: false
    },
    prix_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    statut: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'en_attente',
        validate: {
            isIn: [['en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee']]
        }
    },
    caution: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    acompte: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    avec_chauffeur: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'reservations',
    timestamps: true,
    createdAt: 'cree_le',
    updatedAt: 'modifie_le'
});

module.exports = Reservation;
