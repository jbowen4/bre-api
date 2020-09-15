const Sequelize = require('sequelize');
const Pool = require('pg').Pool;
const config = require('config');

const password = config.get('localPassword');

const db = new Sequelize('blackbook', 'postgres', password, {
    host: 'localhost',
    dialect: 'postgres',
});

const pool = new Pool({
    user: 'postgres',
    password: password,
    host: 'localhost',
    port: 5432,
    database: 'blackbook'
})

module.exports = {
    db,
    pool
};