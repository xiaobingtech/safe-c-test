import { PrismaClient } from '@prisma/client'

// 安全的数据库连接，适用于 Vercel 部署
let prisma: PrismaClient | undefined

export function getDb() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error'],
      // 添加连接配置以提高稳定性
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    })
  }
  return prisma
}

// 优雅关闭
export async function closeDb() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = undefined
  }
}

// 确保在 process 退出时关闭连接
if (typeof process !== 'undefined') {
  process.on('beforeExit', closeDb)
  process.on('SIGINT', closeDb)
  process.on('SIGTERM', closeDb)
}