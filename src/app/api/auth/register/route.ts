import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // 动态导入数据库，避免构建时初始化
    const { db } = await import('../../../../../lib/db')
    
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
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}