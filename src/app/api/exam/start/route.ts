import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { createExamSession, getRandomQuestions } from '../../../../../lib/exam'

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

    // 创建新的考试会话
    const examSessionId = await createExamSession(session.user.id)
    
    // 获取随机题目
    const questions = getRandomQuestions()
    
    return NextResponse.json({
      sessionId: examSessionId,
      questions: questions,
      config: {
        timeLimit: 5400, // 90分钟
        totalQuestions: 100
      }
    })
  } catch (error) {
    console.error('开始考试错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}