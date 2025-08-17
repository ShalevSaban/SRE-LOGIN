// TiDB/MySQL pool (mysql2/promise)
const mysql = require('mysql2/promise');

const {
    TIDB_HOST = 'tidb',
        TIDB_PORT = '4000',
        TIDB_USER = 'root',
        TIDB_PASSWORD = '',
        TIDB_DATABASE = 'sre_login'
} = process.env;

const pool = mysql.createPool({
    host: TIDB_HOST,
    port: Number(TIDB_PORT),
    user: TIDB_USER,
    password: TIDB_PASSWORD || undefined,
    database: TIDB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
    timezone: 'Z'
});

module.exports = pool;