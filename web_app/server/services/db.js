const mysql = require('mysql2/promise');
const config = require('../config');
const pool = mysql.createPool(config.db);

async function query(sql, params) {

    // workaround for mysql2 8.0.22 => https://github.com/sidorares/node-mysql2/issues/1239
    // convert all parameters that are numbers to strings
    for (const key in params) {
        const value = params[key];
        if (typeof value === 'number')
          params[key] = String(value);
    }

    const [rows, fields] = await pool.execute(sql, params);

    return rows;
}

module.exports = {
    query
}
