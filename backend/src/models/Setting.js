const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
    key: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        allowNull: false
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'general'
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    type: {
        type: DataTypes.STRING(20),
        defaultValue: 'string', // string, number, boolean, json
        validate: {
            isIn: [['string', 'number', 'boolean', 'json']]
        }
    }
}, {
    tableName: 'settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Setting;
