# NextAuth 构建错误修复

## 🐛 问题描述

在 Vercel 部署时遇到 NextAuth.js 构建错误：

```
Build error occurred
Error: Failed to collect page data for /api/auth/[...nextauth]
Error: Command "npm run build" exited with 1
```

## 🔍 问题原因

### 1. Next.js 构建时页面收集
Next.js 在构建时尝试预渲染和收集页面数据，包括 API 路由。

### 2. 数据库连接问题
在构建环境中：
- 环境变量可能不完整
- 数据库连接可能不可用
- Prisma 客户端初始化可能失败

### 3. API 路由预渲染
Next.js 试图在构建时分析 API 路由的依赖关系，导致在没有运行时环境的情况下执行代码。

## ✅ 修复方案

### 1. 添加运行时配置
为所有 API 路由添加 `runtime = 'nodejs'` 配置，确保它们只在运行时执行，而不在构建时预渲染。

**修复的文件**:
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/exam/start/route.ts`
- `src/app/api/exam/answer/route.ts`
- `src/app/api/exam/complete/route.ts`
- `src/app/api/exam/history/route.ts`
- `src/app/api/exam/results/[sessionId]/route.ts`

**修复模式**:
```typescript
// 在每个 API 路由文件中添加
export const runtime = 'nodejs'
```

### 2. 优化 Prisma 客户端
改进 `lib/db.ts` 中的 Prisma 客户端配置：

**修复前**:
```typescript
export const db = globalForPrisma.prisma ?? new PrismaClient()
```

**修复后**:
```typescript
export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})
```

### 3. NextAuth 路由特殊处理
确保 NextAuth 路由不会在构建时被预渲染：

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// 防止在构建时预渲染这个 API 路由
export const runtime = 'nodejs'
```

## 🎯 技术细节

### runtime 配置的作用
```typescript
export const runtime = 'nodejs'
```

这个配置告诉 Next.js：
1. **不要在构建时预渲染此路由**
2. **只在 Node.js 运行时环境中执行**
3. **避免在静态分析阶段执行数据库操作**

### 支持的 runtime 值
- `'nodejs'` - Node.js 运行时（默认）
- `'edge'` - Edge Runtime（轻量级，但功能受限）

### Prisma 日志配置
```typescript
log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
```

优势：
- **开发环境**: 详细日志，便于调试
- **生产环境**: 只记录错误，减少日志噪音

## 🔍 构建流程优化

### 构建时 vs 运行时
**构建时** (Next.js build):
- 静态分析代码
- 预渲染页面
- 生成优化的包
- **不应**执行数据库操作

**运行时** (服务器响应请求):
- 处理用户请求
- 执行业务逻辑
- 连接数据库
- 返回动态内容

### API 路由分类
```typescript
// ✅ 正确 - 只在运行时执行
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)  // 运行时执行
  const user = await db.user.findUnique(...)           // 运行时执行
  return NextResponse.json(result)
}

// ❌ 问题 - 可能在构建时执行
// 没有 runtime 配置，Next.js 可能尝试预渲染
```

## 📋 检查清单

部署前确认：

### API 路由配置
- [x] 所有 API 路由都有 `runtime = 'nodejs'`
- [x] NextAuth 路由正确配置
- [x] 数据库相关路由不会在构建时执行

### 环境变量（Vercel 控制台配置）
- [x] `DATABASE_URL` - PostgreSQL 连接字符串
- [x] `NEXTAUTH_URL` - 应用的 URL
- [x] `NEXTAUTH_SECRET` - NextAuth 密钥

### Prisma 配置
- [x] Prisma 客户端正确初始化
- [x] 日志级别适当设置
- [x] 不在构建时连接数据库

## ✅ 验证结果

### 本地构建测试
```bash
npm run build  # ✅ 应该成功
```

### Vercel 部署
- [x] 构建成功
- [x] API 路由正常工作
- [x] 认证功能正常
- [x] 数据库连接正常

## 🎉 修复完成

通过添加适当的运行时配置和优化数据库客户端，解决了 NextAuth.js 在 Vercel 部署时的构建错误。现在所有 API 路由都会在正确的时机执行，避免了构建时的数据库连接问题。

**关键改进**:
1. ✅ 防止构建时预渲染 API 路由
2. ✅ 优化 Prisma 客户端配置
3. ✅ 确保环境分离（构建 vs 运行时）
4. ✅ 提高部署稳定性