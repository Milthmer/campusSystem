import express from 'express';
import cors from 'cors';

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