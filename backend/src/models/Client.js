const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    telephone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    adresse: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ville: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    date_naissance: {
        type: DataTypes.DATE,
        allowNull: true
    },
    type_document: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'cin',
        validate: {
            isIn: [['cin', 'passeport', 'permis_etranger']]
        }
    },
    cni_passport: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    date_expiration_document: {
        type: DataTypes.DATE,
        allowNull: true
    },
    permis_conduire: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    documents: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            cin_recto: null,
            cin_verso: null,
            permis: null,
            passeport: null
        }
    },
    statut: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'normal',
        validate: {
            isIn: [['normal', 'vip', 'blacklist']]
        }
    },
    notes_internes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    nombre_reservations: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'clients',
    timestamps: true,
    createdAt: 'cree_le',
    updatedAt: 'modifie_le'
});

module.exports = Client;
