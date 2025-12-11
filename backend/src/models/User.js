const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null initially for migration
        references: {
            model: 'roles',
            key: 'id'
        }
    },
    // Deprecated: keeping for backward compatibility during migration
    role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'inactive', 'suspended']]
        }
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    agence_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'agences',
            key: 'id'
        }
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Method to verify password
User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

// Hook to hash password before saving
User.beforeCreate(async (user) => {
    if (user.password_hash) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
});

module.exports = User;
