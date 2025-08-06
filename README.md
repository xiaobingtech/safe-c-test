# 🛡️ 安全C证模拟考试系统

一个专业的建筑施工安全员C证考试模拟系统，基于真实考试题库，提供完整的在线考试体验。

## ✨ 项目特色

- 📚 **完整题库**: 包含 2286 道真实考试题目
- 🎯 **三种题型**: 单选题、多选题、判断题
- ⏰ **真实考试**: 90分钟限时，80道题目
- 🔒 **严格规则**: 一次确认制，防止修改答案
- 📊 **详细统计**: 答题进度、分数统计、错题分析
- 💾 **数据持久**: 考试记录、用户进度自动保存

## 🎮 考试规则

### 题目构成
- **单选题**: 30道，每题1分
- **多选题**: 20道，每题2分（错选0分，漏选扣0.5分）
- **判断题**: 30道，每题1分
- **总分**: 100分，60分合格

### 考试流程
1. 用户注册/登录
2. 开始新考试（随机出题）
3. 按题型顺序答题：单选 → 多选 → 判断
4. 确认答案后无法修改
5. 提交考试，查看成绩
6. 支持查看历史考试记录和错题

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
- 随机题目生成
- 实时计时器
- 答案确认机制
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
  singleChoiceCount: 30,
  multipleChoiceCount: 20,
  judgeCount: 30,
  timeLimit: 5400, // 90分钟
  totalQuestions: 80
}
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

## 👨‍💻 作者

AI 编程助手 & 开发团队

---

**⚡ 立即开始您的安全C证考试准备之旅！**
