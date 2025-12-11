const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Paiement = sequelize.define('Paiement', {
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
    type_paiement: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isIn: [['contrat', 'reservation', 'facture', 'amende', 'service']]
        },
        comment: 'Type de paiement: contrat, reservation, facture, amende, service'
    },
    reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID du contrat/reservation/facture concerné'
    },
    montant_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Montant total dû'
    },
    montant_paye: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Montant payé'
    },
    reste_a_payer: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Reste à payer'
    },
    methode_paiement: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isIn: [['especes', 'carte', 'virement', 'tpe', 'en_ligne', 'cheque', 'portefeuille']]
        }
    },
    reference_paiement: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Référence TPE, virement, etc.'
    },
    statut: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'en_attente',
        validate: {
            isIn: [['paye', 'partiel', 'non_paye', 'en_attente', 'rembourse', 'echoue']]
        }
    },
    date_paiement: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    remise: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Remise appliquée'
    },
    tva: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'TVA'
    },
    // Détails virement bancaire
    banque_nom: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    virement_reference: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    virement_date_reception: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Pièces jointes (JSON array)
    pieces_jointes: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of file paths/URLs'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'User who created this payment'
    }
}, {
    tableName: 'paiements',
    timestamps: true,
    createdAt: 'cree_le',
    updatedAt: 'modifie_le'
});

module.exports = Paiement;
