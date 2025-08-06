# Prisma CLI 命令未找到错误修复

## 🐛 错误信息
```
sh: line 1: prisma: command not found
Error: Command "npm install && prisma generate" exited with 127
```

## 🔍 问题原因

**依赖项分类错误**: Prisma CLI (`prisma`) 被放在了 `devDependencies` 中，但 Vercel 生产构建时默认不安装开发依赖项。

### 修复前的错误配置
```json
{
  "dependencies": {
    "@prisma/client": "^5.8.1"
  },
  "devDependencies": {
    "prisma": "^5.8.1"  // ❌ 错误位置
  }
}
```

## ✅ 修复方案

### 1. 将 Prisma CLI 移动到生产依赖
```json
{
  "dependencies": {
    "@prisma/client": "^5.8.1",
    "prisma": "^5.8.1"  // ✅ 正确位置
  },
  "devDependencies": {
    // prisma 已移除
  }
}
```

### 2. 简化构建配置

**package.json 脚本**:
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"  // 自动在安装后生成
  }
}
```

**vercel.json 配置**:
```json
{
  "functions": {
    "app/api/**/*.ts": { "maxDuration": 30 }
  },
  "env": {
    "PRISMA_CLI_BINARY_TARGETS": "native,rhel-openssl-1.0.x"
  }
}
```

## 🎯 为什么这样修复

### Prisma 依赖项说明

| 包名 | 用途 | 应该放在 |
|------|------|----------|
| `@prisma/client` | 运行时客户端 | `dependencies` |
| `prisma` | CLI 工具 | `dependencies` (Vercel需要) |

### Vercel 构建流程

1. **Install Phase**: 只安装 `dependencies`
2. **Build Phase**: 运行 `prisma generate` (需要 CLI)
3. **Deploy Phase**: 使用生成的客户端

如果 `prisma` 在 `devDependencies` 中：
- ❌ Install Phase: 没有安装 CLI
- ❌ Build Phase: `prisma: command not found`

## 🚀 修复后的部署流程

### 自动流程
1. **npm install** → 安装包括 `prisma` CLI
2. **postinstall hook** → 自动运行 `prisma generate`
3. **npm run build** → 再次运行 `prisma generate && next build`
4. **Deploy** → 使用最新生成的客户端

### 双重保险
- `postinstall`: 确保安装后立即生成
- `build` 脚本: 构建前再次确保最新客户端

## 📋 验证步骤

### 1. 推送代码重新部署
```bash
git add .
git commit -m "fix: move prisma to dependencies for Vercel"
git push
```

### 2. 检查 Vercel 构建日志
应该看到：
```
Running "npm install"
Running "prisma generate" (via postinstall)
✔ Generated Prisma Client

Running "npm run build"  
Running "prisma generate && next build"
✔ Generated Prisma Client
```

### 3. 测试功能
- ✅ 注册新用户
- ✅ 登录用户
- ✅ 访问考试功能

## 🔧 最佳实践

### Prisma + Vercel 部署清单
- ✅ `prisma` 在 `dependencies` 中
- ✅ `@prisma/client` 在 `dependencies` 中
- ✅ `postinstall` 脚本包含 `prisma generate`
- ✅ `build` 脚本包含 `prisma generate`
- ✅ 环境变量正确设置

### 常见陷阱
- ❌ 将 `prisma` 放在 `devDependencies`
- ❌ 忘记 `postinstall` 脚本
- ❌ 构建脚本中遗漏 `prisma generate`

## 🎉 预期结果

修复完成后，Vercel 部署应该：
1. ✅ 成功安装 Prisma CLI
2. ✅ 正确生成 Prisma 客户端
3. ✅ 构建成功
4. ✅ 注册和登录功能正常

这个修复解决了 Vercel 环境中 Prisma CLI 不可用的根本问题！