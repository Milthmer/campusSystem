import express from 'express';
import cors from 'cors';
import db from './db.js';
import { register, login, authenticateToken } from './auth.js';

const app = express();
app.use(cors());
app.use(express.json());

// 认证接口
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// OSRM 代理（不需要认证）
app.get('/route', async (req, res) => {
    const { startLon, startLat, endLon, endLat } = req.query;
    if (!startLon || !startLat || !endLon || !endLat) {
        return res.status(400).json({ error: '缺少参数' });
    }
    const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
    try {
        const response = await fetch(osrmUrl);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'OSRM 请求失败' });
    }
});

// 历史记录 API（需要认证）
app.get('/api/history', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const [rows] = await db.query('SELECT * FROM routes WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: '数据库查询失败' });
    }
});

app.post('/api/history', authenticateToken, async (req, res) => {
    const { start_name, end_name, distance, coordinates } = req.body;
    const userId = req.user.userId;
    if (!start_name || !end_name || !coordinates) {
        return res.status(400).json({ error: '缺少字段' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO routes (start_name, end_name, distance, coordinates, user_id) VALUES (?, ?, ?, ?, ?)',
            [start_name, end_name, distance, JSON.stringify(coordinates), userId]
        );
        res.json({ id: result.insertId, message: '保存成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '数据库错误' });
    }
});

app.delete('/api/history/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
        const [result] = await db.query('DELETE FROM routes WHERE id = ? AND user_id = ?', [id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: '记录不存在或无权限' });
        }
        res.json({ message: '删除成功' });
    } catch (err) {
        res.status(500).json({ error: '删除失败' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));