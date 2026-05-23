# 智慧校园地图 - 项目结构说明

## 技术栈
- **前端**：Vue 3 (Composition API) + Vite + OpenLayers
- **后端**：Node.js + Express + MySQL (mysql2)
- **地图服务**：OSRM 步行路径 API
- **认证**：bcrypt + JWT
- **数据库**：MySQL (本地或云)

## 目录结构
```
campusSystem/
├── index.html
├── package.json
├── vite.config.js
├── app.js          # Express 后端（认证 + OSRM 代理 + 历史 CRUD）
├── auth.js         # JWT 认证模块（注册/登录/中间件）
├── db.js           # MySQL 连接池
├── src/
│   ├── main.js
│   ├── App.vue     # 根组件：状态管理、路径规划、认证 UI、弹窗
│   ├── assets/
│   │   └── main.css
│   ├── components/
│   │   ├── BuildingList.vue   # 侧边栏建筑列表
│   │   ├── HistoryList.vue    # 历史记录列表
│   │   ├── MapContainer.vue   # 地图容器（封装 useMap）
│   │   ├── AuthModal.vue      # 登录弹窗
│   │   └── RegisterModal.vue  # 注册（创建用户）弹窗
│   ├── composables/
│   │   ├── useMap.js     # 地图初始化、标记、高亮、弹窗
│   │   ├── useHistory.js # 历史记录 API 交互（JWT 鉴权）
│   │   ├── useAuth.js    # 认证状态管理（登录/注册/登出）
│   │   └── usePath.js    # 路径规划请求与绘制（暂未使用）
│   └── data/
│       └── buildings.js  # 建筑静态数据（7栋）
└── README.md
```

## 后端 API 设计 (`app.js`)

| 路由 | 方法 | 认证 | 功能 |
|------|------|------|------|
| `/api/auth/register` | POST | 无 | 注册用户（username + password → bcrypt 哈希 → users 表） |
| `/api/auth/login` | POST | 无 | 登录验证（返回 JWT token，有效期 7 天） |
| `/route` | GET | 无 | 代理 OSRM 步行路径请求 |
| `/api/history` | GET | JWT | 返回当前用户的历史记录（按 `created_at` 降序） |
| `/api/history` | POST | JWT | 保存历史记录（body: `start_name, end_name, distance, coordinates`） |
| `/api/history/:id` | DELETE | JWT | 删除指定 ID 的记录（仅限本人） |

## 数据库表

```sql
-- 用户表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 路径历史表（用户维度隔离）
CREATE TABLE routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_name VARCHAR(100) NOT NULL,
    end_name VARCHAR(100) NOT NULL,
    distance FLOAT,
    coordinates JSON,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 核心调用流程

### 1. 页面初始化
App.vue 挂载 → 调用 `useHistory().loadHistory()` → 携带 JWT token 请求后端 → 更新历史列表

MapContainer.vue 挂载 → 调用 `useMap().initMap()` 创建地图 → 调用 `addBuildingFeatures()` 绘制建筑标记

### 2. 用户认证
- **注册**：点击"注册"按钮 → RegisterModal 弹窗 → 填写用户名、密码、确认密码（前端校验一致性+长度≥6）→ `POST /api/auth/register` → 创建成功提示
- **登录**：点击"登录"按钮 → AuthModal 弹窗 → 填写用户名、密码 → `POST /api/auth/login` → JWT token 存入 localStorage → 刷新历史列表
- **登出**：点击"登出"按钮 → 清除 token 和 username → 清空历史列表 → 重置地图状态
- **Token 过期**：API 返回 401 → `useHistory` 分发 `unauthorized` 事件 → App.vue 监听到后自动执行登出

### 3. 路径规划
用户依次点击两个建筑标记 → `onMapClick` 记录起点/终点 → `calculateAndDrawRoute()`

将起点/终点坐标转经纬度 → 请求 OSRM 公共 API

解析返回的 GeoJSON → 坐标转 EPSG:3857 → 赋值 `currentRouteCoords`

MapContainer 监听到 `routeCoords` 变化 → 绘制蓝色虚线路径

调用 `addHistoryItem` 保存到数据库（携带 JWT token）→ 刷新历史列表

### 4. 历史回放
点击历史条目 → `onHistorySelect` 直接将 `item.coordinates` 赋值给 `currentRouteCoords` → 地图立即绘制路径

### 5. 删除历史
点击删除按钮 → 调用 `deleteHistoryItem(id)` → 后端删除（校验 `user_id` 权限）→ 重新拉取列表
