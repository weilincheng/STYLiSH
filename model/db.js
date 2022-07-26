require("dotenv").config();
const mysql = require("mysql");

const db = mysql.createPool({
    connectionLimist: 10,
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});

const queryPromise = (sql) => {
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                return reject(err);
            }
            return resolve(result);
        });
    });
};

module.exports = {
    query: (text, params) => db.query(text, params),
    escape: (text, params) => db.escape(text, params),
    queryPromise,
};
