import express from 'express';
import cors from 'cors';
import db from "./db.js"

const app = express();

app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => {
    res.send("pong");
});

app.get('/route', async (req, res) => {
    const { startLon, startLat, endLon, endLat } = req.query;

    if (!startLon || !startLat || !endLon || !endLat) {
        return res.status(400).json({ error: '缺少参数' });
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;

    try {
        const osrmRes = await fetch(osrmUrl);
        const data = await osrmRes.json();
        res.json(data);
    } catch (err) {
        console.error('OSRM 请求失败:', err);
        res.status(500).json({ error: 'OSRM 请求失败', details: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Express 后端已启动：http://localhost:${PORT}`);
    console.log(`测试请求：http://localhost:${PORT}/route?startLon=113.0782&startLat=28.1859&endLon=113.0805&endLat=28.1882`);
});

// 保存历史记录
app.post('/api/history', async (req, res) => {
    const { start_name, end_name, distance, coordinates } = req.body;
    if (!start_name || !end_name || !coordinates) {
        return res.status(400).json({ error: '缺少必要字段' });
    }
    try {
        const [result] = await db.query(
            'INSERT INTO routes (start_name, end_name, distance, coordinates) VALUES (?, ?, ?, ?)',
            [start_name, end_name, distance, JSON.stringify(coordinates)]
        );
        res.json({ id: result.insertId, message: '保存成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '数据库错误' });
    }
});

// 获取历史列表
app.get('/api/history', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM routes ORDER BY created_at DESC');
        // 注意：coordinates 字段已经是 JSON 类型，取出后自动解析为对象
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '查询失败' });
    }
});

// 删除历史记录
app.delete('/api/history/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM routes WHERE id = ?', [id]);
        res.json({ message: '删除成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '删除失败' });
    }
});