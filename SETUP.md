# 安全C证模拟考试系统 - 安装部署指南

## 项目概述

这是一个完整的PC端模拟考试系统，包含用户注册、登录、随机出题、计时答题、成绩记录等功能。

## 功能特性

### 🎯 考试功能
- **随机出题**: 每次考试从题库中随机选取100道题
- **题型分布**: 单选题30道(1分/题)、多选题20道(2分/题)、判断题50道(1分/题)
- **计时考试**: 90分钟考试时长，自动交卷
- **即时反馈**: 确认答案后立即显示正误和得分
- **答题进度**: 实时显示答题进度和未答题数量

### 📊 成绩管理
- **详细统计**: 总分、分题型得分、正确率统计
- **错题查看**: 支持只查看错题功能
- **历史记录**: 保存所有考试记录和详细结果

### 👤 用户系统
- **注册登录**: 简单的用户名密码注册登录
- **个人记录**: 每个用户独立的考试记录

## 安装步骤

### 1. 环境准备
确保您的系统已安装：
- Node.js 18+ 
- npm 或 yarn

### 2. 创建环境变量文件
在项目根目录创建 `.env` 文件，内容如下：

```env
DATABASE_URL="postgresql://neondb_owner:npg_0NjAKgl4IaiR@ep-raspy-union-a1lxo76h-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-2025
```

### 3. 安装依赖
```bash
npm install
```

### 4. 初始化数据库
```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库schema
npx prisma db push
```

### 5. 启动项目
```bash
npm run dev
```

项目将在 http://localhost:3000 启动

## 使用说明

### 首次使用
1. 打开 http://localhost:3000
2. 点击"立即注册"创建账户
3. 登录后即可开始考试

### 考试流程
1. 在首页点击"开始新考试"
2. 系统随机生成100道题目
3. 左侧显示答题进度，右侧显示题目内容
4. 选择答案后点击"确认答案"查看结果
5. 可以通过题号按钮快速跳转到任意题目
6. 完成所有题目或时间到达后提交试卷
7. 查看详细的考试结果和错题分析

### 计分规则
- **单选题**: 1分/题，答对得1分，答错或不答得0分
- **多选题**: 2分/题，完全正确得2分，有错选得0分，少选每个扣0.5分
- **判断题**: 1分/题，答对得1分，答错或不答得0分
- **合格标准**: 60分及以上为合格

## 项目结构

```
safe-c-test/
├── src/
│   ├── app/                 # Next.js App Router页面
│   │   ├── api/            # API路由
│   │   ├── auth/           # 认证页面
│   │   ├── exam/           # 考试相关页面
│   │   └── page.tsx        # 首页
│   └── output/             # 题库JSON文件
├── lib/                    # 工具库
│   ├── auth.ts            # 认证配置
│   ├── db.ts              # 数据库连接
│   └── exam.ts            # 考试逻辑
├── prisma/                # 数据库配置
│   └── schema.prisma      # 数据库表结构
├── components/            # React组件
└── types/                 # TypeScript类型定义
```

## 数据库表结构

### users (用户表)
- id: 主键
- username: 用户名(唯一)
- password: 加密密码
- createdAt: 创建时间
- updatedAt: 更新时间

### exam_sessions (考试会话表)
- id: 主键
- userId: 用户ID(外键)
- startTime: 开始时间
- endTime: 结束时间
- isCompleted: 是否完成
- score: 总分
- totalQuestions: 题目总数
- timeLimit: 时间限制(秒)

### exam_answers (答题记录表)
- id: 主键
- sessionId: 考试会话ID(外键)
- questionId: 题目ID
- questionType: 题目类型
- userAnswer: 用户答案(JSON)
- correctAnswer: 正确答案(JSON)
- isCorrect: 是否正确
- score: 得分
- answeredAt: 答题时间

## 题库说明

题库文件位于 `src/output/questions.json`，包含：
- **单选题**: 901道
- **多选题**: 464道  
- **判断题**: 921道
- **总计**: 2,286道题目

每次考试会从题库中随机选择指定数量的题目，确保每次考试内容都不同。

## 技术栈

- **前端框架**: Next.js 14 + React 18
- **UI框架**: Tailwind CSS
- **认证**: NextAuth.js
- **数据库**: PostgreSQL (Neon)
- **ORM**: Prisma
- **TypeScript**: 完整类型支持

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `.env` 文件中的 `DATABASE_URL` 是否正确
   - 确保网络连接正常

2. **Prisma 生成失败**
   - 删除 `node_modules/.prisma` 文件夹
   - 重新运行 `npx prisma generate`

3. **页面无法加载**
   - 检查 `NEXTAUTH_URL` 和 `NEXTAUTH_SECRET` 是否设置正确
   - 确保端口3000未被占用

4. **题目显示异常**
   - 确认 `src/output/questions.json` 文件存在且格式正确

### 开发工具

```bash
# 查看数据库内容
npx prisma studio

# 重置数据库
npx prisma db push --force-reset

# 查看数据库状态
npx prisma db pull
```

## 系统要求

### 最低配置
- CPU: 双核 2.0GHz
- 内存: 4GB RAM
- 硬盘: 1GB 可用空间
- 网络: 稳定的互联网连接

### 推荐配置
- CPU: 四核 2.5GHz+
- 内存: 8GB+ RAM
- 硬盘: SSD 存储
- 网络: 宽带连接

## 支持的浏览器

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

如有问题，请检查控制台错误信息或联系开发者。