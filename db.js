import mysql from "mysql2";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "895124",
    database: "campus_navigation",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool.promise();