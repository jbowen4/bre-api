const Sequelize = require('sequelize');
const Pool = require('pg').Pool;
const config = require('config');

const password = config.get('DB_PASSWORD');
const host = config.get('DB_HOST');

const db = new Sequelize('postgres', 'postgres', password, {
    host: host,
    dialect: 'postgres',
    port: 5434
});

const pool = new Pool({
    user: 'postgres',
    password: password,
    host: host,
    port: 5434,
    database: 'postgres'
})

module.exports = {
    db,
    pool
};