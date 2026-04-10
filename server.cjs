const http = require("http");
const url = require("url");

const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        });
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);

    if (req.method === "GET" && parsedUrl.pathname === "/route") {
        const { startLon, startLat, endLon, endLat } = parsedUrl.query;

        if (!startLon || !startLat || !endLon || !endLat) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "缺少参数" }));
            return;
        }

        const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;

        try {
            const osrmRes = await fetch(osrmUrl);
            const data = await osrmRes.json();

            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            });
            res.end(JSON.stringify(data));
        } catch (err) {
            console.error("OSRM请求失败", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "OSRM请求失败", details: err.message }));
        }
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
    }
});

server.listen(3000, () => {
    console.log("后端代理服务已启动：http://localhost:3000");
    console.log('示例请求：http://localhost:3000/route?startLon=113.0782&startLat=28.1859&endLon=113.0805&endLat=28.1882');
});