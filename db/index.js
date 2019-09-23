const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Test',
    password: 'William1993$',
    port: 5432,
})

module.exports = {
    query: (text, params) => pool.query(text, params),
}