import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getDb } from '../../../../../lib/db-safe'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // 使用安全的数据库连接
    const db = getDb()
    
    // 测试数据库连接
    await db.$connect()
    
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      )
    }

    // 检查用户是否已存在
    const existingUser = await db.user.findUnique({
      where: {
        username: username
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建用户
    const user = await db.user.create({
      data: {
        username: username,
        password: hashedPassword
      }
    })

    return NextResponse.json(
      { message: '注册成功', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('注册错误:', error)
    
    // 更详细的错误信息用于调试
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    console.error('详细错误信息:', errorMessage)
    
    return NextResponse.json(
      { 
        error: '服务器错误',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}