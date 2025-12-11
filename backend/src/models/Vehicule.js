const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicule = sequelize.define('Vehicule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    agence_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'agences',
            key: 'id'
        }
    },
    immatriculation: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    vin: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    marque: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    modele: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    annee: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    categorie: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isIn: [['economique', 'moyenne', 'luxe', 'suv', 'utilitaire']]
        }
    },
    etat: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'disponible',
        validate: {
            isIn: [['disponible', 'reserve', 'en_maintenance', 'hors_service']]
        }
    },
    km: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    carburant: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isIn: [['essence', 'diesel', 'electrique', 'hybride']]
        }
    },
    boite: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isIn: [['manuelle', 'automatique']]
        }
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    prix_jour: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    assurance_expire_le: {
        type: DataTypes.DATE,
        allowNull: true
    },
    visite_technique_expire_le: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'vehicules',
    timestamps: true,
    createdAt: 'cree_le',
    updatedAt: 'modifie_le'
});

module.exports = Vehicule;
