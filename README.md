# 词话 · 记单词 & 记对话

一款基于 SM-2 间隔重复算法的英语学习 Web 应用。前端 React + Vite，后端 Spring Boot + MyBatis-Plus + Sa-Token。

## ✨ 功能

- 🔐 账号系统：注册 / 登录 / 修改昵称 / 上传头像
- 📊 概览 Dashboard：统计卡片 + 热力图复习日历
- 📚 单词库：CRUD + 搜索 + 标签筛选 + 朗读（浏览器 SpeechSynthesis）
- 🔁 今日复习：3D 翻转卡片 + 4 档评分 + SM-2 后端算法
- 💬 对话库：CRUD + 聊天气泡详情 + speaker 颜色区分
- 📖 字典管理：对话分类 / 单词标签建议（用户隔离）
- ⚙️ 设置：JSON 数据导出 / 导入

## 🛠️ 技术栈

| 层 | 选型 |
|---|---|
| 前端 | React 18 + Vite 5 + TypeScript + TailwindCSS + Zustand + Axios + Lucide React |
| 后端 | Spring Boot 3.2.5 + MyBatis-Plus 3.5.7 + Sa-Token 1.38.0 + MySQL 8 |
| 算法 | SM-2 间隔重复（后端计算 nextReview / EF / repetitions） |
| 认证 | Sa-Token uuid token（前端 Axios 拦截器自动带 Authorization） |
| 语音 | 浏览器原生 Web Speech API（speechSynthesis，前端零依赖） |

## 📂 项目结构

```
memorize-words/
├── src/                       # 前端 React
│   ├── components/            # Layout / Modal / WordForm
│   ├── pages/                 # Dashboard / Review / Words / Dialogues / Profile / Settings ...
│   ├── store/                 # zustand stores (authStore / memorizeStore)
│   ├── utils/                 # api.ts / sm2.ts / storage.ts
│   └── App.tsx                # 路由 + ProtectedRoute
├── backend/                   # Spring Boot
│   ├── pom.xml
│   ├── src/main/resources/
│   │   ├── application.yml    # MySQL / Sa-Token / multipart / upload-dir
│   │   └── db/init.sql        # 建表 SQL + 种子数据
│   └── src/main/java/.../
│       ├── controller/        # Auth / Word / Dialogue / Review / Stats / Dict
│       ├── service/           # Auth / Word / Dialogue / Review / Dict
│       ├── dto/               # LoginRequest / WordCreateRequest / DialogueCreateRequest ...
│       ├── entity/            # SysUser / Word / Dialogue / ReviewRecord / DictItem
│       ├── mapper/            # 5 个 BaseMapper
│       ├── config/            # WebConfig(CORS+SaInterceptor+静态资源) / DataSeeder
│       └── common/            # Result / GlobalExceptionHandler / UserUtil
└── prototype/                 # 原型 HTML（可忽略）
```

## 🚀 本地运行

### 前置

- Java 17+
- MySQL 8.0+
- Node 18+ / pnpm 或 npm

### 1. 数据库

```sql
CREATE DATABASE IF NOT EXISTS `memorize-words` DEFAULT CHARSET utf8mb4;
-- 然后执行
mysql -u root -p memorize-words < backend/src/main/resources/db/init.sql
```

### 2. 后端

```bash
cd backend
mvn spring-boot:run
# 默认端口 8084
# 默认账号 admin / admin123
```

### 3. 前端

```bash
npm install
npm run dev
# http://localhost:5173
# Vite 已配好 /api 和 /uploads 代理到 8084
```

## 🔧 后端配置

编辑 `backend/src/main/resources/application.yml`：

```yaml
server:
  port: 8084

spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/memorize-words?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true
    username: root
    password: "123456"
  servlet:
    multipart:
      max-file-size: 2MB

app:
  admin-username: admin
  admin-password: admin123
  # upload-dir 默认 uploads （相对 jar 运行目录）
```

Sa-Token 内存存储，重启后所有 token 失效，用户需重新登录。

## 📦 打包

```bash
# 前端
npm run build       # 产物在 dist/

# 后端
cd backend
mvn -DskipTests clean package   # 产物在 target/memorize-server.jar
```

## 🌐 生产部署（宝塔 / Nginx）

### 1. 后端

```bash
# MySQL 建库 + init.sql（服务器上）
mysql -u root -p memorize-words < init.sql

# 运行 jar
java -jar memorize-server.jar --server.port=8084
# 会自动创建 uploads/avatar/ 目录
```

### 2. 前端

把 `dist/` 目录放到 Nginx 根目录（如 `/www/wwwroot/code/memorize-words/`）。

### 3. Nginx 配置

```nginx
server {
    listen 5132;
    server_name your-domain;
    root /www/wwwroot/code/memorize-words;
    index index.html;

    # ============ 反向代理到后端 ============
    location /api/ {
        proxy_pass http://127.0.0.1:8084;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8084;
    }

    # ============ SPA 路由 fallback（关键！刷新不 404）============
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存优化
    location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$ { expires 30d; }
    location ~ .*\.(js|css)$           { expires 12h; }

    access_log  /www/wwwlogs/memorize.log;
    error_log   /www/wwwlogs/memorize.error.log;
}
```

部署后：`nginx -t && nginx -s reload`

## 🗄️ 数据库表

| 表 | 说明 |
|---|---|
| `sys_user` | 用户（username / password_hash / nickname / avatar） |
| `word` | 单词（english / chinese / phonetic / example / tags CSV / repetitions / ease_factor / interval_days / next_review） |
| `dialogue` | 对话（title / source / category / content JSON 数组） |
| `review_record` | 复习历史（word_id / user_id / grade / old_ease_factor / new_ease_factor） |
| `sys_dict_item` | 用户自定义字典（dict_type: dialogue_category / word_tag，user_id 隔离） |

## 🧪 API 一览

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/logout` | 退出 |
| GET  | `/api/auth/info` | 当前用户 |
| PATCH| `/api/auth/profile` | 修改昵称/头像 |
| POST | `/api/auth/upload-avatar` | 头像上传（multipart） |
| GET  | `/api/words` | 列表（?q=&tag=） |
| POST | `/api/words` | 新增 |
| PUT  | `/api/words/:id` | 更新 |
| DELETE | `/api/words/:id` | 删除 |
| GET  | `/api/words/tags` | 标签聚合 |
| GET  | `/api/review/due` | 到期单词 |
| POST | `/api/review/submit` | 评分（grade: 0/2/4/5） |
| GET  | `/api/review/history` | 复习历史 |
| GET/POST/PUT/DELETE | `/api/dialogues[/:id]` | 对话 CRUD |
| GET  | `/api/stats/dashboard` | Dashboard 统计 |
| GET/POST/PUT/DELETE | `/api/dicts[/:id]` | 字典 CRUD（?type=dialogue_category） |

认证：所有 `/api/**`（除 login/register）需带 `Authorization: <token>` header。

## 🗒️ 注意事项

- **头像路径**：后端存相对路径 `/uploads/avatar/xxx.png`，前端和 Nginx 需正确代理
- **头像兼容**：后端同时接受 emoji、外部 URL、相对路径图片三种形态
- **tags 字段**：DB 存逗号分隔 CSV，前端是数组（api.ts 自动转换）
- **SM-2 后端算**：grade 0=Again / 2=Hard / 4=Good / 5=Easy
- **init.sql 只建表**：种子数据由 Spring Boot DataSeeder 在启动时自动灌（admin/admin123 + 6 单词 + 2 对话 + 字典）
- **Sa-Token 生产建议接 Redis**：默认内存存储，重启 token 全失效

## 📜 License

MIT
