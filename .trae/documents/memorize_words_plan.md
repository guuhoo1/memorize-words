# 记单词 & 记对话 网站 — 需求调研与实施计划

> 版本：v0.1（需求阶段）  
> 日期：2026-11-21  
> 状态：待评审

---

## 一、需求分析

### 1.1 产品定位

面向通用英语学习者的 **单词记忆 + 对话内容管理** 工具。核心思路：

- **单词**：用户手动录入，通过 SM-2 间隔重复算法安排复习，翻转卡片交互
- **对话**：用户手动粘贴/输入对话文本（电影台词、书籍片段、日常对话等），作为学习素材进行归档和查阅
- 不做 AI 对话练习，对话模块定位于 **"内容记录 + 关联复习"**

### 1.2 功能需求矩阵

| 模块 | 功能 | 优先级 | 说明 |
|------|------|--------|------|
| **单词管理** | 单词 CRUD（增删改查） | P0 | 手动录入：英文、中文释义、音标、例句、标签 |
| | 标签/分类管理 | P1 | 按主题、难度、来源分组 |
| | 发音播放 | P1 | Web Speech API 或 TTS 服务 |
| | 搜索 & 筛选 | P1 | 按单词、释义、标签、日期搜索 |
| | 导出（JSON/CSV） | P2 | 数据备份 |
| **记忆系统** | 翻转卡片复习 | P0 | 正面英文→翻面显示中文/例句 |
| | SM-2 间隔重复调度 | P0 | 自动计算下次复习时间 |
| | 复习结果评分 | P0 | 用户自评 0-5 分，决定间隔调整 |
| | 每日复习队列 | P0 | 展示今日到期需复习的单词 |
| | 新单词学习 | P1 | 从"未学习"列表中选取新卡片 |
| **对话管理** | 对话 CRUD | P0 | 手动输入/粘贴对话文本，支持多行 |
| | 对话分场景归档 | P1 | 按来源（电影、书籍、日常）分类 |
| | 对话内单词高亮 | P2 | 自动/手动标记对话中出现的生词 |
| | 对话关联单词本 | P2 | 将对话中的词一键加入单词本 |
| **数据统计** | 学习日历/热力图 | P1 | 类似 GitHub Contribution Graph |
| | 累计学习单词数 | P1 | 总量、已掌握、待复习 |
| | 复习正确率趋势 | P2 | 图表展示 |
| **数据持久化** | localStorage | P0 | MVP 阶段纯前端存储 |
| | JSON 导入/导出 | P1 | 跨设备迁移、备份恢复 |

### 1.3 非功能需求

- **响应式设计**：桌面端优先，平板/手机端可用
- **离线可用**：localStorage 存储后，所有功能无需网络
- **性能**：首次加载 < 2s，复习翻牌动画流畅（60fps）
- **可扩展**：后端接口预留（后续可接入 Firebase/Supabase）

---

## 二、技术架构

### 2.1 技术栈选择

| 层级 | 选型 | 理由 |
|------|------|------|
| 框架 | **React 18 + Vite** | 生态成熟、HMR 快、适合单页应用 |
| 语言 | **TypeScript** | 类型安全，便于长期维护 |
| 路由 | **React Router v6** | SPA 路由标准方案 |
| UI 组件库 | **Tailwind CSS + shadcn/ui** | 轻量、可定制、视觉现代 |
| 状态管理 | **Zustand** | 极简、够用，比 Redux 轻 |
| 数据存储 | **localStorage + IndexedDB 封装** | MVP 阶段无需后端；IndexedDB 用于大量对话文本 |
| 间隔重复 | **自研 SM-2 实现** | 算法简单可控，无需第三方库 |
| 发音 | **Web Speech API** | 浏览器原生支持，零依赖 |
| 图表 | **Recharts** | React 友好，轻量 |
| 构建 | **Vite** | 开发体验极佳 |

### 2.2 为什么不选其他方案

- ~~Next.js~~：SSR 在纯前端 MVP 阶段增加复杂度，后续需要 SEO 时再迁移
- ~~Vue~~：团队技术栈兼容性待确认，React 生态更丰富
- ~~Anki/SRS 库~~：过度依赖，SM-2 算法 50 行代码即可实现

### 2.3 目录结构规划

```
memorize-words/
├── src/
│   ├── components/       # 通用组件
│   │   ├── FlashCard/    # 翻转卡片组件
│   │   ├── Sidebar/      # 侧边导航
│   │   ├── Heatmap/     # 学习热力图
│   │   └── WordInput/   # 单词录入表单
│   ├── pages/            # 页面
│   │   ├── Dashboard/    # 首页/概览
│   │   ├── Words/        # 单词列表 & 管理
│   │   ├── Review/       # 复习模式
│   │   ├── Dialogues/    # 对话列表 & 管理
│   │   ├── DialogueDetail/ # 对话详情
│   │   └── Settings/     # 设置 & 数据管理
│   ├── store/            # Zustand 状态
│   │   ├── wordStore.ts
│   │   ├── reviewStore.ts
│   │   └── dialogueStore.ts
│   ├── utils/
│   │   ├── sm2.ts        # SM-2 算法
│   │   ├── storage.ts    # localStorage 封装
│   │   └── speech.ts     # 发音工具
│   ├── types/            # TypeScript 类型定义
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 三、数据模型设计

### 3.1 Word（单词卡片）

```typescript
interface Word {
  id: string;              // uuid
  english: string;         // 英文单词/短语
  chinese: string;         // 中文释义
  phonetic?: string;       // 音标
  example?: string;        // 例句
  tags: string[];          // 标签，如 ["CET4", "电影台词"]
  
  // SM-2 字段
  easeFactor: number;      // 初始 2.5
  interval: number;        // 单位：天
  repetitions: number;     // 连续正确次数
  nextReview: number;      // 下次复习时间戳
  lastReview?: number;     // 上次复习时间戳
  
  // 元数据
  createdAt: number;
  updatedAt: number;
  source?: string;         // 来源对话 ID（关联对话）
}
```

### 3.2 Dialogue（对话记录）

```typescript
interface Dialogue {
  id: string;
  title: string;           // 标题，如 "Friends S01E01 咖啡馆"
  source?: string;         // 来源，如 "Friends 老友记"
  category: string;        // 分类：电影/书籍/日常/其他
  content: string;         // 对话全文（可能较长）
  wordIds: string[];       // 关联的生词 ID
  
  createdAt: number;
  updatedAt: number;
}
```

### 3.3 ReviewSession（复习记录）

```typescript
interface ReviewRecord {
  wordId: string;
  grade: number;           // 0-5 用户自评
  reviewedAt: number;
}
```

### 3.4 SM-2 算法核心逻辑

```
输入：grade (0-5), easeFactor (默认 2.5), interval, repetitions
输出：新的 easeFactor, interval, repetitions

if grade < 3:
  repetitions = 0
  interval = 1
else:
  if repetitions == 0: interval = 1
  if repetitions == 1: interval = 6
  if repetitions >= 2: interval = interval * easeFactor
  repetitions += 1

easeFactor = max(1.3, easeFactor + 0.1 - (5-grade) * (0.08 + (5-grade) * 0.02))
```

---

## 四、页面与路由设计

```
/                            → Dashboard（概览）
/words                       → 单词列表
/words/new                   → 新增单词
/words/:id                   → 单词详情/编辑
/review                      → 今日复习
/review/new                  → 学习新单词
/dialogues                   → 对话列表
/dialogues/new               → 新增对话
/dialogues/:id               → 对话详情
/settings                    → 设置 & 数据管理
```

### 4.1 Dashboard 首页

- 今日待复习数量卡片
- 新单词待学习数量
- 7 天学习热力图
- 最近添加的单词/对话预览
- 快速入口按钮（开始复习、添加单词、添加对话）

### 4.2 Review 复习页

- 全屏翻转卡片
- 卡片正面：英文单词 + 发音按钮
- 点击翻面：中文释义 + 例句 + 音标
- 底部评分按钮：Again(0) / Hard(2) / Good(4) / Easy(5)
- 完成后显示本次统计

### 4.3 Words 单词列表页

- 表格/卡片视图切换
- 搜索框 + 标签筛选
- 批量操作（删除、改标签）
- 点击行进入详情

### 4.4 Dialogues 对话页

- 对话卡片列表（标题 + 来源 + 摘要）
- 新增/编辑：大文本框输入对话内容
- 详情页：对话全文 + 关联生词列表 + 一键加入单词本

---

## 五、实施步骤（依赖有序）

### Phase 1：项目脚手架（Day 1）

1. `npm create vite@latest . -- --template react-ts` 初始化
2. 安装依赖：tailwindcss, react-router-dom, zustand, recharts
3. 配置 Tailwind + shadcn/ui
4. 配置路径别名 `@/`
5. 搭建全局布局：Sidebar + Content

### Phase 2：数据层 & SM-2 算法（Day 2）

6. 定义 TypeScript 类型（Word, Dialogue, ReviewRecord）
7. 实现 localStorage 存储工具（含迁移策略）
8. 实现 SM-2 算法工具函数
9. 实现 Web Speech 发音工具
10. Zustand store：wordStore, dialogueStore, reviewStore

### Phase 3：单词模块（Day 3-4）

11. Dashboard 首页骨架 + 概览数据
12. Words 列表页（搜索、筛选、分页）
13. Word 新增/编辑表单
14. Word 详情页
15. 标签管理

### Phase 4：复习系统（Day 5-6）

16. 翻转卡片 FlashCard 组件
17. Review 复习队列逻辑（筛选到期单词）
18. 评分交互 + SM-2 更新
19. 新单词学习队列
20. 复习完成统计

### Phase 5：对话模块（Day 7-8）

21. Dialogues 列表页
22. Dialogue 新增/编辑（大文本输入）
23. Dialogue 详情页
24. 对话与单词关联（从对话中选词加入单词本）

### Phase 6：统计 & 设置（Day 9）

25. 学习热力图组件
26. 数据统计卡片
27. 设置页：导入/导出 JSON、清空数据

### Phase 7：打磨 & 验证（Day 10）

28. 响应式适配
29. 空状态、Loading 状态
30. 键盘快捷键（空格翻面、数字键评分）
31. 测试数据填充 & 手动测试
32. Bug 修复

---

## 六、依赖与注意事项

| 项目 | 说明 |
|------|------|
| **localStorage 容量** | 通常 5-10MB，单词数据足够；大量对话文本考虑 IndexedDB |
| **SM-2 参数** | easeFactor 初始 2.5，可在设置中暴露给高级用户调整 |
| **发音质量** | Web Speech API 在中文系统上英语发音可能不理想，需测试 fallback |
| **ID 生成** | 使用 `crypto.randomUUID()`（现代浏览器原生支持） |
| **数据迁移** | localStorage schema 变更时需版本号 + 迁移函数 |
| **日期处理** | 复习时间计算用 `dayjs` 或纯 Date，避免时区问题 |

---

## 七、风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 用户数据丢失（localStorage 清空） | 高 | 提供导出/导入 JSON，首次启动提示备份 |
| 对话文本过长导致性能问题 | 中 | 对话详情页虚拟滚动；大文本考虑 IndexedDB |
| 后续需要多端同步 | 中 | 预留 API 层，store 与存储解耦，后续接 Supabase |
| SM-2 参数不适合用户 | 低 | 设置页暴露关键参数，允许用户自定义 |

---

## 八、后续扩展方向（不在 MVP 范围）

- [ ] 内置词书库（CET4/6、雅思、托福词库 JSON 导入）
- [ ] 音视频上传 + 自动转写对话
- [ ] 字幕文件（.srt）解析导入
- [ ] Supabase/Firebase 云端同步 + 账号系统
- [ ] PWA 支持（离线安装）
- [ ] 分享单词本/对话给他人
- [ ] AI 生成例句/词根词缀分析

---

## 九、验证标准

- [ ] 所有路由页面可正常访问
- [ ] 完整用户流程：录入单词 → 复习 → 评分 → 间隔正确调整
- [ ] 完整用户流程：录入对话 → 查看详情 → 关联生词
- [ ] 刷新页面后数据持久化
- [ ] JSON 导出/导入数据一致
- [ ] 移动端宽度 < 768px 布局可接受
- [ ] Lighthouse Score > 80

---

> **下一步**：评审确认后，从 Phase 1 开始实施。
