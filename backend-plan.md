# memorize-words · 后端开发计划

> 参照工程：`D:\code\feishu-notebook\backend`（Spring Boot 3.2.5 + MyBatis-Plus 3.5.7 + Sa-Token 1.38.0）
> 前端仓库：`d:\code\frontend\memorize-words`（React 18 + TS + Zustand，类型契约见 `src/types/index.ts`）

---

## 一、技术栈（冻结，与前端同时拍板）

| 层 | 选型 | 版本 | 说明 |
|---|---|---|---|
| 语言 | Java 17 | - | 参考工程同 |
| 框架 | Spring Boot | 3.2.5 | 参考工程同 |
| ORM | MyBatis-Plus | 3.5.7 | `mybatis-plus-spring-boot3-starter` |
| 认证 | Sa-Token | 1.38.0 | `sa-token-spring-boot3-starter`，token 头 `Authorization`，uuid 风格 |
| 密码加密 | BCrypt | - | `spring-security-crypto`（仅加密工具，不引入完整 Security） |
| 数据库 | MySQL | 8.x | - |
| 驱动 | mysql-connector-j | latest | runtime scope |
| 工具 | Lombok | - | `@Data / @RequiredArgsConstructor` |
| 参数校验 | spring-boot-starter-validation | - | `@Valid / @NotBlank` |
| 数据库迁移 | 暂不引入 Flyway | - | 与参考工程一致，手写 `schema.sql` 手动执行 |
| API 前缀 | `/api` | - | 全部接口挂此前缀，前端 axios 统一 baseURL |
| 端口 | `8081` | - | 与参考工程一致，前端 dev 代理 `localhost:8081` |
| 包名 | `com.example.memorize` | - | 参考工程用 `com.example.notebook` |

## 二、数据库设计（MySQL）

### 2.1 用户表（Sa-Token 认证必须）

```sql
CREATE TABLE sys_user (
  id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(64)  NOT NULL UNIQUE,
  password_hash VARCHAR(128) NOT NULL,          -- BCrypt
  nickname      VARCHAR(64),
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '用户';
```

### 2.2 单词表

```sql
CREATE TABLE word (
  id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT       NOT NULL,
  english       VARCHAR(128) NOT NULL,
  chinese       VARCHAR(256) NOT NULL,
  phonetic      VARCHAR(128),
  example       TEXT,
  tags          VARCHAR(512) DEFAULT '',        -- 逗号分隔，前端数组序列化
  ease_factor   DOUBLE       NOT NULL DEFAULT 2.5,
  interval_days INT          NOT NULL DEFAULT 0,
  repetitions   INT          NOT NULL DEFAULT 0,
  next_review   DATETIME,
  last_review   DATETIME,
  source_dialogue_id BIGINT,                    -- 关联对话（nullable）
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_next_review (next_review),
  CONSTRAINT fk_word_user FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE
) COMMENT '单词';
```

### 2.3 对话表

```sql
CREATE TABLE dialogue (
  id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT       NOT NULL,
  title       VARCHAR(256) NOT NULL,
  source      VARCHAR(256),
  category    VARCHAR(32)  NOT NULL,           -- 电影/剧集 | 书籍 | 演讲 | 日常/工作
  content     TEXT         NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  CONSTRAINT fk_dialogue_user FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE
) COMMENT '对话素材';
```

### 2.4 复习记录表

```sql
CREATE TABLE review_record (
  id         BIGINT   NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT   NOT NULL,
  word_id    BIGINT   NOT NULL,
  grade      INT      NOT NULL,               -- 0 / 2 / 4 / 5
  reviewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_word_id (word_id),
  INDEX idx_user_id (user_id),
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_word FOREIGN KEY (word_id) REFERENCES word(id) ON DELETE CASCADE
) COMMENT '复习历史';
```

### 2.5 关联说明

前端 `Dialogue.wordIds: string[]` 存的是单词 ID 数组，后端 **不加中间表**，保持与参考工程一致的轻量方案：
- 在 `dialogue` 表加一列 `word_ids VARCHAR(512)`（逗号分隔），或者查询时 `word.source_dialogue_id = dialogue.id` 反向关联
- **决策**：用 `word.source_dialogue_id` 字段反向关联，更清晰，且 `dialogue.wordIds` 数组在前端组装

## 三、工程结构

```
memorize-server/
├── pom.xml
├── src/main/java/com/example/memorize/
│   ├── MemorizeApplication.java              ← 启动类
│   ├── common/                                ← 拷贝参考工程
│   │   ├── Result.java                        ← 统一响应体 { code, message, data }
│   │   ├── GlobalExceptionHandler.java       ← 全局异常
│   │   └── UserUtil.java                     ← Sa-Token 获取当前用户工具
│   ├── config/
│   │   ├── DataSeeder.java                    ← 首次启动灌 admin + mock 数据
│   │   └── WebConfig.java                     ← CORS + Sa-Token 拦截器注册
│   ├── entity/
│   │   ├── SysUser.java                      ← @TableName("sys_user")
│   │   ├── Word.java                         ← @TableName("word")
│   │   ├── Dialogue.java                     ← @TableName("dialogue")
│   │   └── ReviewRecord.java                 ← @TableName("review_record")
│   ├── mapper/
│   │   ├── SysUserMapper.java                ← BaseMapper<SysUser>
│   │   ├── WordMapper.java
│   │   ├── DialogueMapper.java
│   │   └── ReviewRecordMapper.java
│   ├── service/
│   │   ├── AuthService.java                  ← login / register / current / logout
│   │   ├── WordService.java                  ← CRUD + 搜索 + 标签查询
│   │   ├── DialogueService.java              ← CRUD + 分类查询
│   │   └── ReviewService.java                ← submitReview + 今日待复习
│   ├── dto/
│   │   ├── LoginRequest.java                 ← username, password
│   │   ├── WordCreateRequest.java            ← english, chinese, phonetic?, example?, tags[]
│   │   ├── WordUpdateRequest.java            ← 同 Create，全部 optional
│   │   ├── DialogueCreateRequest.java
│   │   ├── ReviewSubmitRequest.java          ← wordId, grade(0|2|4|5)
│   │   └── StatsVO.java                      ← Dashboard 概览数据
│   └── controller/
│       ├── AuthController.java               ← /api/auth/*
│       ├── WordController.java               ← /api/words/*
│       ├── DialogueController.java           ← /api/dialogues/*
│       ├── ReviewController.java             ← /api/review/*
│       └── StatsController.java              ← /api/stats/*
└── src/main/resources/
    ├── application.yml                        ← 参考工程模板改数据库名
    └── db/
        └── init.sql                           ← 手动执行的建表语句
```

## 四、接口契约（前端已按此设计，冻结）

> 统一响应体：`{ code: 200, message: "success", data: ... }`  
> 统一前缀：`/api`  
> 认证头：`Authorization: <uuid-token>`（Sa-Token 自动校验）

### 4.1 认证 `/api/auth`

| 方法 | 路径 | 请求体 | 响应 data | 说明 |
|---|---|---|---|---|
| POST | `/login` | `{ username, password }` | `{ token, user }` | 返回 Sa-Token uuid |
| POST | `/register` | `{ username, password }` | `SysUser` | BCrypt 加密 |
| POST | `/logout` | - | - | `StpUtil.logout()` |
| GET | `/info` | - | `SysUser` | 当前登录用户 |

### 4.2 单词 `/api/words`

| 方法 | 路径 | 参数 | 响应 data | 说明 |
|---|---|---|---|---|
| GET | `/` | `?q=` 搜索词, `?tag=` 标签筛选 | `Word[]` | 支持英文/中文模糊搜索 + 标签过滤 |
| GET | `/{id}` | - | `Word` | 详情 |
| POST | `/` | `WordCreateRequest` | `Word` | 新增，SM-2 初始值默认 easeFactor=2.5 |
| PUT | `/{id}` | `WordUpdateRequest` | `Word` | 仅允许修改 english/chinese/phonetic/example/tags |
| DELETE | `/{id}` | - | - | 级联删除关联对话 word_ids |
| GET | `/tags` | - | `String[]` | 返回所有出现过的 tag 去重列表 |

### 4.3 对话 `/api/dialogues`

| 方法 | 路径 | 参数 | 响应 data | 说明 |
|---|---|---|---|---|
| GET | `/` | `?category=` | `Dialogue[]` | 支持分类过滤 |
| GET | `/{id}` | - | `Dialogue` | 详情 |
| POST | `/` | `DialogueCreateRequest` | `Dialogue` | - |
| PUT | `/{id}` | 同上 | `Dialogue` | - |
| DELETE | `/{id}` | - | - | - |

### 4.4 复习 `/api/review`

| 方法 | 路径 | 参数 | 响应 data | 说明 |
|---|---|---|---|---|
| GET | `/due` | - | `Word[]` | `WHERE next_review <= NOW() ORDER BY next_review ASC` |
| POST | `/submit` | `{ wordId, grade: 0|2|4|5 }` | `Word` | **后端跑 SM-2 算法**，更新 word 的 easeFactor/interval/repetitions/nextReview/lastReview，写入 review_record |
| GET | `/history` | `?wordId=` | `ReviewRecord[]` | 可选按单词过滤 |

### 4.5 概览 `/api/stats`

| 方法 | 路径 | 响应 data | 说明 |
|---|---|---|---|
| GET | `/dashboard` | `{ wordCount, dueCount, masteredCount, dialogueCount }` | Dashboard 4 张 stat 卡 |

### 4.6 前端对接需要改的文件（明天同步改）

- `src/store/memorizeStore.ts` — CRUD 从 Zustand 本地操作改为 fetch `/api/...`
- `src/utils/api.ts`（新建）— axios 实例 + Sa-Token 拦截器（自动带 `Authorization` 头，401 跳登录）
- `src/utils/sm2.ts` — 算法保留本地副本做乐观更新，但最终以服务端结果为准
- 新增 `src/pages/Login.tsx` + `src/pages/Register.tsx`
- 入口加登录路由守卫

## 五、application.yml 模板（对齐参考工程）

```yaml
server:
  port: 8081

spring:
  application:
    name: memorize-server
  datasource:
    url: jdbc:mysql://localhost:3306/memorize_words?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true
    username: memorize_words
    password: memorize_words123
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl
  global-config:
    db-config:
      id-type: auto

sa-token:
  token-name: Authorization
  timeout: 2592000        # 30 天
  active-timeout: -1
  is-concurrent: true
  is-share: false
  token-style: uuid
  is-log: false

app:
  admin-username: admin
  admin-password: admin123
```

## 六、明天开发任务清单（按顺序执行）

### Task 1 · 脚手架搭建
- [ ] 创建 `D:\code\backend\memorize-server` 目录
- [ ] 复制参考工程 `pom.xml` 改 artifactId/description
- [ ] 复制 `src/main/java/com/example/notebook` → `memorize`，改 package 名
- [ ] 复制 `common/`（Result / GlobalExceptionHandler / UserUtil）— 不动，直接用
- [ ] 写 `application.yml`（套模板改数据库名）
- [ ] 启动类加 `@MapperScan("com.example.memorize.mapper")`
- [ ] **启动验证**：`mvn spring-boot:run` 看到 started 日志

### Task 2 · 建库 + 初始数据
- [ ] 写 `src/main/resources/db/init.sql`（4 张表 DDL）
- [ ] MySQL 执行 `init.sql`
- [ ] 写 `DataSeeder.java`：首次启动插入 admin 用户（username=admin, BCrypt admin123）+ 6 个 mock 单词 + 2 个 mock 对话（与前端 mock.ts 一致）
- [ ] **验证**：连上 MySQL 能看到 4 张表 + 种子数据

### Task 3 · 认证模块
- [ ] `SysUser` 实体 + `SysUserMapper`
- [ ] `LoginRequest` DTO
- [ ] `AuthService`：login（校验密码 → StpUtil.login → 返回 token）/ register（BCrypt 加密 → insert）/ current（UserUtil.getCurrentUserId）/ logout
- [ ] `AuthController`（参考工程拷贝改路径）
- [ ] `WebConfig` 加 Sa-Token 拦截器 `/api/**` 放行 `/api/auth/login` `/api/auth/register`
- [ ] **验证**：Postman `POST /api/auth/login` 返回 token + 用户信息

### Task 4 · 单词 CRUD
- [ ] `Word` 实体（注意 tags 字段用 String 存逗号分隔）+ `WordMapper`
- [ ] `WordCreateRequest` / `WordUpdateRequest` DTO
- [ ] `WordService`：增删改查 + 搜索（`LIKE '%q%'` english/chinese）+ 标签聚合（`SELECT DISTINCT tags FROM word WHERE user_id=?` 拆分去重）
- [ ] `WordController` 全部 6 个接口
- [ ] **验证**：完整 CRUD 闭环

### Task 5 · 对话 CRUD
- [ ] `Dialogue` 实体 + `DialogueMapper`
- [ ] `DialogueCreateRequest` DTO
- [ ] `DialogueService` + `DialogueController`
- [ ] **验证**：完整 CRUD + 分类过滤

### Task 6 · 复习核心（SM-2 后端化）
- [ ] `ReviewRecord` 实体 + `ReviewRecordMapper`
- [ ] 把前端 `sm2.ts` 算法移植为 Java `Sm2Algorithm.java`（**必须后端跑**，不能依赖前端传结果）
- [ ] `ReviewService.dueWords(userId)`：查表 `next_review <= NOW()`
- [ ] `ReviewService.submitReview(userId, wordId, grade)`：
  1. 查当前 word
  2. 跑 SM-2 算新值
  3. UPDATE word（easeFactor, interval_days, repetitions, next_review, last_review, updated_at）
  4. INSERT review_record
  5. 返回更新后的 word
- [ ] `ReviewController` 3 个接口
- [ ] **验证**：Postman 模拟一次完整复习流程，查 MySQL 确认 word 字段正确更新

### Task 7 · 概览统计
- [ ] `StatsVO` DTO
- [ ] `StatsService`：wordCount / dueCount（COUNT WHERE next_review <= NOW()）/ masteredCount（COUNT WHERE repetitions >= 4）/ dialogueCount
- [ ] `StatsController`
- [ ] **验证**：Dashboard 4 张卡数据正确

### Task 8 · 前端对接（同步改）
- [ ] 新建 `src/utils/api.ts`：axios 实例，baseURL `/api`，请求拦截器自动加 `Authorization`，响应拦截器 401 跳登录
- [ ] Zustand store 所有 CRUD 改成 `api.words.list()` / `api.words.create()` / ... 形式
- [ ] 登录/注册页面 + 路由守卫（未登录 `/api/auth/info` 401 → `/login`）
- [ ] Vite `server.proxy` 配置 `/api` → `http://localhost:8081`
- [ ] **端到端验证**：浏览器走登录 → 加单词 → 复习 → 刷新数据还在（MySQL 持久化）

## 七、约束与风险

| 风险 | 对策 |
|---|---|
| Sa-Token token 头默认 `satoken`，要改成 `Authorization` | application.yml 已写 `token-name: Authorization`，前端拦截器也加这个头 |
| Sa-Token 默认存储 token 用内存，重启丢失 | 先不接 Redis（保持参考工程），后续可加 |
| BCrypt 前端注册直接传明文密码（参考工程就是这么做的） | 接受，HTTPS 生产加密，本阶段开发期先忽略 |
| 前端 `tags: string[]` 存 JSON 数组 vs 后端逗号分隔 String | 约定：后端存 `"a,b,c"`，DTO 层 `String tagsCsv` → 前端 `String[] tags`，api.ts 转换层处理 |
| flyway 参考工程默认 disabled | 本项目也不引入，用 DataSeeder + 手动 SQL |
| 参考工程 `app.admin-username` / `app.admin-password` | 完全保留，DataSeeder 读配置灌 admin |

---

**本 plan 冻结后先人工审核，确认 4 件事再开工：**
1. 数据库 4 张表字段对齐（尤其 `Word` 表的 SM-2 字段和前端 TypeScript 类型是否一致）
2. 接口路径/方法/请求体/响应体是否需要调整
3. 是否保留 `flyway.enabled: false`（手写 SQL 方式）
4. BCrypt 密码在前端直接传明文 OK 吗？还是要加前端 MD5 预哈希？

> 审核通过后再进入 Task 1 写代码。
