# 🛡️ 山东建筑类安全C证模拟考试系统

一个专业的建筑施工安全员C证考试模拟系统，基于真实考试题库，提供完整的在线考试体验。

## ✨ 项目特色

- 📚 **完整题库**: 包含 2286 道真实考试题目
- 🎯 **三种题型**: 判断题、单选题、多选题
- ⏰ **真实考试**: 90分钟限时，100道题目
- 🎮 **多种模式**: 随机模式、未答题优先、错题优先
- 🔒 **灵活规则**: 选择即算作答，支持交卷前修改
- 📊 **详细统计**: 答题进度、分数统计、错题分析
- 💾 **数据持久**: 考试记录、用户进度自动保存

## 🎮 考试规则

### 题目构成
- **判断题**: 40道，每题1分
- **单选题**: 40道，每题1分
- **多选题**: 20道，每题1分
- **总分**: 100分，60分合格

### 答题模式
- **🎲 随机模式**: 题目完全随机排列，模拟真实考试环境
- **📝 未答题优先**: 优先显示未答过的题目，提高学习效率
- **❌ 错题优先**: 优先显示答错的题目，针对性复习薄弱环节

### 考试流程
1. 用户注册/登录
2. 选择答题模式
3. 开始新考试（按模式生成题目顺序）
4. 按题型分组答题：判断题 → 单选题 → 多选题
5. 选择选项即标记为已答题
6. 可随时修改答案，交卷时自动保存
7. 提交考试，查看成绩
8. 支持查看历史考试记录和错题分析

## 🛠️ 技术栈

### 前端
- **Next.js 14** - React 全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 现代化样式
- **NextAuth.js** - 身份认证

### 后端
- **Prisma** - ORM 数据库管理
- **PostgreSQL** - 生产级数据库
- **API Routes** - 服务端接口

### 部署
- **Vercel** - 前端部署
- **Neon** - PostgreSQL 云数据库

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 数据库

### 安装步骤

1. **克隆项目**
```bash
git clone <project-url>
cd safe-c-test
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. **初始化数据库**
```bash
npx prisma generate
npx prisma db push
```

5. **启动开发服务器**
```bash
npm run dev
```

6. **访问应用**
打开 [http://localhost:3000](http://localhost:3000)

### 一键安装（推荐）
```bash
node setup.js
```
自动完成环境配置和依赖安装。

## 📁 项目结构

```
safe-c-test/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 路由
│   │   ├── auth/           # 认证页面
│   │   ├── exam/           # 考试页面
│   │   │   ├── mode/       # 答题模式选择
│   │   │   ├── [sessionId]/ # 考试答题页面
│   │   │   └── results/    # 考试结果页面
│   │   └── page.tsx        # 首页
│   ├── res/                # 原始题库文件
│   └── output/             # 解析后的 JSON 题库
├── lib/                    # 核心库文件
│   ├── auth.ts            # 认证配置
│   ├── db.ts              # 数据库连接
│   └── exam.ts            # 考试逻辑
├── prisma/                # 数据库 Schema
└── components/            # React 组件
```

## 🎯 核心功能

### 用户系统
- 用户注册/登录
- 密码加密存储
- 会话管理

### 考试系统
- 多模式题目生成（随机/未答题优先/错题优先）
- 智能题目排序算法
- 实时计时器
- 灵活答题机制
- 自动评分

### 数据管理
- 考试记录存储
- 错题统计分析
- 用户进度跟踪

## 📊 数据库设计

### 核心表结构
- **User**: 用户信息
- **ExamSession**: 考试会话
- **ExamAnswer**: 用户答案
- **Question**: 题目数据（JSON存储）

## 🔧 开发指南

### 添加新题目
1. 更新 `src/res/` 下的题库文件
2. 运行解析脚本: `node src/scripts/parseQuestionsAdvanced.js`
3. 重新部署应用

### 修改考试规则
编辑 `lib/exam.ts` 中的 `EXAM_CONFIG` 配置：
```typescript
export const EXAM_CONFIG = {
  singleChoiceCount: 40,
  multipleChoiceCount: 20,
  judgeCount: 40,
  timeLimit: 5400, // 90分钟
  totalQuestions: 100
}
```

### 答题模式配置
在 `lib/exam.ts` 中配置答题模式：
```typescript
export const EXAM_MODES: ExamModeConfig[] = [
  {
    mode: 'random',
    label: '随机模式',
    description: '题目完全随机排列'
  },
  {
    mode: 'unanswered_first',
    label: '未答题优先',
    description: '优先显示未答的题目'
  },
  {
    mode: 'wrong_first',
    label: '错题优先',
    description: '优先显示之前答错的题目'
  }
]
```

## 🚀 部署指南

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### 环境变量配置
```bash
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret
```

## 📈 性能优化

- ✅ 服务端渲染 (SSR)
- ✅ 静态资源优化
- ✅ 数据库连接池
- ✅ API 路由缓存
- ✅ 图片懒加载

## 🔒 安全特性

- 🔐 密码哈希加密
- 🛡️ CSRF 保护
- 🚫 SQL 注入防护
- ⏱️ 会话超时管理
- 🔑 环境变量加密

## 📱 响应式设计

- 📱 移动端优化
- 💻 桌面端适配
- 🎨 现代化 UI/UX
- ♿ 无障碍访问

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 发起 Pull Request

## 📄 许可证

MIT License

## 🆕 最新更新

### v2.0.0 (最新版)
- ✅ **全新答题规则**: 判断题40题 + 单选题40题 + 多选题20题，每题1分
- ✅ **多种答题模式**: 随机模式、未答题优先、错题优先
- ✅ **智能题目排序**: 根据用户历史记录优化学习路径
- ✅ **灵活答题机制**: 选择即算作答，交卷前可修改答案
- ✅ **优化用户体验**: 全新模式选择界面，更直观的进度显示

### 📊 版本功能对比

| 功能特性 | v1.0.0 | v2.0.0 (最新) |
|---------|--------|-------------|
| 题目总数 | 80题 | **100题** |
| 答题模式 | 仅随机模式 | **3种智能模式** |
| 分值规则 | 复杂计分 | **统一1分制** |
| 答题机制 | 确认后锁定 | **灵活修改** |
| 学习路径 | 固定顺序 | **个性化推荐** |
| 错题复习 | 基础功能 | **智能优先** |

### v1.0.0
- ✅ 基础考试系统
- ✅ 用户认证
- ✅ 题库管理
- ✅ 成绩统计

## 🔄 升级指南

如果您使用的是旧版本，请按以下步骤升级：

1. 拉取最新代码
2. 运行数据库迁移（如需要）
3. 重启应用服务

## 👨‍💻 作者

范小兵

---

**⚡ 立即开始您的安全C证考试准备之旅！选择适合您的答题模式，让学习更高效！**
