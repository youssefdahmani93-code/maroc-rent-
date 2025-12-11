const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contrat = sequelize.define('Contrat', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['devis', 'contrat']]
        }
    },
    devis_id: {
        type: DataTypes.INTEGER,
        allowNull: true
        // No foreign key constraint to avoid circular dependency
    },
    reservation_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'reservations',
            key: 'id'
        }
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
    lieu_remise: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    lieu_restitution: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    prix_journalier: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    nombre_jours: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reduction: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    frais_chauffeur: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    frais_livraison: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    frais_carburant: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    frais_depassement_km: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    extras: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    montant_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
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
    reste_a_payer: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    statut: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'devis',
        validate: {
            isIn: [['devis', 'a_signer', 'signe', 'en_cours', 'termine', 'annule']]
        }
    },
    km_depart: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    km_retour: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    niveau_carburant_depart: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    niveau_carburant_retour: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    etat_vehicule_depart: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    etat_vehicule_retour: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },
    photos_depart: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    photos_retour: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    conditions_generales: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    terms_accepted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    signature_client: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    signature_agence: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date_signature: {
        type: DataTypes.DATE,
        allowNull: true
    },
    pdf_path: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    tableName: 'contrats',
    timestamps: true,
    createdAt: 'cree_le',
    updatedAt: 'modifie_le'
});

module.exports = Contrat;
