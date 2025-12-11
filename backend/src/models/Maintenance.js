const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Maintenance = sequelize.define('Maintenance', {
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
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isIn: [[
                'vidange',
                'pneus',
                'freins',
                'batterie',
                'mecanique',
                'carrosserie',
                'assurance',
                'controle_technique',
                'nettoyage',
                'autre'
            ]]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    garage: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    date_entree: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_sortie_prevue: {
        type: DataTypes.DATE,
        allowNull: true
    },
    date_sortie_reelle: {
        type: DataTypes.DATE,
        allowNull: true
    },
    km_actuel: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    pieces_remplacees: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    photos: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            avant: [],
            apres: []
        }
    },
    cout_pieces: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    cout_main_oeuvre: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    cout_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    statut: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'a_faire',
        validate: {
            isIn: [['a_faire', 'en_cours', 'termine', 'urgent']]
        }
    },
    prochaine_vidange_km: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    prochain_changement_pneus_km: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    prochaine_visite_technique: {
        type: DataTypes.DATE,
        allowNull: true
    },
    prochaine_assurance: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes_internes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    facture_path: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    tableName: 'maintenances',
    timestamps: true,
    createdAt: 'cree_le',
    updatedAt: 'modifie_le'
});

module.exports = Maintenance;
