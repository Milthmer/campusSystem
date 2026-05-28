import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'cbdH8H2yNWe8k9A.root',   // 注意：你的截图里用户名是 cbdH8H2yNWe8k9A.root，不是 cbDH8...，请确认
    password: 'j3TAw74KGRd3NASS',
    database: 'campus_navigation',
    ssl: { rejectUnauthorized: false }   // 跳过证书验证，但加密连接仍会建立
});

export default pool.promise();