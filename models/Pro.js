const { Sequelize, DataTypes } = require('sequelize');
const { db } = require('../config/db');

const Pro = db.define('pro', {
    id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
    },
    name: DataTypes.STRING(200),
    job_type: DataTypes.STRING(100),
    contact_number: DataTypes.STRING,
    contact_email: DataTypes.STRING,
    website: DataTypes.STRING,
    description: DataTypes.TEXT,
    photo: DataTypes.STRING,
    address1: DataTypes.STRING,
    address2: DataTypes.STRING,
    state: DataTypes.STRING(2),
    city: DataTypes.STRING(100),
    zipcode: DataTypes.SMALLINT,
    createdAt: {
        field: "created_at",
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    company: DataTypes.STRING,
    lat: DataTypes.DECIMAL,
    lng: DataTypes.DECIMAL
}, {
        tableName: "pros",
        updatedAt: false
        // timestamps: false
    });

module.exports = Pro;