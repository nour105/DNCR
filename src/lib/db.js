import mysql from "mysql2/promise";

const db = mysql.createPool({
    host: "dncr.bargo-realestate.com",
    user: "dncr_dncr",
    password: "aH0105+*A#E~",
    database: "dncr_bargo",
});

export default db;