const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Devis = sequelize.define('Devis', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
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
    agence_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'agences',
            key: 'id'
        }
    },

    // Période
    date_debut: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_fin: {
        type: DataTypes.DATE,
        allowNull: false
    },
    nombre_jours: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // Tarification
    prix_journalier: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    reduction: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    frais_chauffeur: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    frais_livraison: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    frais_carburant: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    frais_depassement_km: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    montant_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    // Statut
    statut: {
        type: DataTypes.STRING(50),
        defaultValue: 'brouillon',
        validate: {
            isIn: [['brouillon', 'envoye', 'accepte', 'refuse', 'converti']]
        }
    },

    // Métadonnées
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    conditions_particulieres: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },

    // Conversion
    contrat_id: {
        type: DataTypes.INTEGER,
        allowNull: true
        // No foreign key constraint to avoid circular dependency
    },
    converti_le: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'devis',
    timestamps: true,
    createdAt: 'cree_le',
    updatedAt: 'modifie_le'
});

module.exports = Devis;
