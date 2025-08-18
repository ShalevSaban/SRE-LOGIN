// server/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.TIDB_HOST || 'tidb',
    port: process.env.TIDB_PORT ? Number(process.env.TIDB_PORT) : 4000,
    user: process.env.TIDB_USER || 'root',
    password: process.env.TIDB_PASSWORD || '',
    database: process.env.TIDB_DATABASE || 'sre_login',
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z',
});

module.exports = pool;