import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { completeExam } from '../../../../../lib/exam'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少会话ID' },
        { status: 400 }
      )
    }

    // 完成考试并计算总分
    const totalScore = await completeExam(sessionId)
    
    return NextResponse.json({
      totalScore,
      passed: totalScore >= 60,
      message: totalScore >= 60 ? '恭喜，考试通过！' : '很遗憾，考试未通过'
    })
  } catch (error) {
    console.error('完成考试错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}