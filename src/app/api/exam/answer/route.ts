import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { saveAnswer, calculateScore } from '../../../../../lib/exam'

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

    const { sessionId, questionId, questionType, userAnswer, correctAnswer } = await request.json()

    if (!sessionId || questionId === undefined || !questionType || userAnswer === undefined) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 保存答案
    await saveAnswer(sessionId, questionId, questionType, userAnswer, correctAnswer)
    
    // 计算分数
    const result = calculateScore(questionType, userAnswer, correctAnswer)
    
    return NextResponse.json({
      isCorrect: result.isCorrect,
      score: result.score,
      message: result.isCorrect ? '答案正确！' : '答案错误'
    })
  } catch (error) {
    console.error('保存答案错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}