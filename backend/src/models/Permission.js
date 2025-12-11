const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,

        comment: 'e.g., clients.create, vehicles.read'
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Group permissions by category e.g., Clients, Vehicles'
    }
}, {
    tableName: 'permissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Permission;
