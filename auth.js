import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';

const JWT_SECRET = 'your_jwt_secret_change_me'; // 生产环境应使用环境变量

// 注册
export async function register(req, res) {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
    try {
        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length) return res.status(400).json({ error: '用户名已存在' });
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hashed]);
        res.json({ id: result.insertId, username, message: '注册成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '注册失败' });
    }
}

// 登录
export async function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ error: '用户名或密码错误' });
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: '用户名或密码错误' });
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '登录失败' });
    }
}

// JWT 验证中间件
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: '未提供认证令牌' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: '令牌无效或已过期' });
        req.user = user;
        next();
    });
}