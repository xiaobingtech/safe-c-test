import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // 动态导入数据库，避免构建时初始化
    const { db } = await import('../../../../../lib/db')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    // 获取用户的考试记录
    const examSessions = await db.examSession.findMany({
      where: {
        userId: session.user.id,
        isCompleted: true
      },
      include: {
        answers: true
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    const history = examSessions.map(exam => {
      const duration = exam.endTime 
        ? Math.floor((exam.endTime.getTime() - exam.startTime.getTime()) / 1000)
        : 0
      
      const wrongAnswers = exam.answers.filter(answer => !answer.isCorrect)
      
      return {
        id: exam.id,
        startTime: exam.startTime,
        endTime: exam.endTime,
        duration,
        score: exam.score,
        totalQuestions: exam.totalQuestions,
        passed: (exam.score || 0) >= 60,
        wrongAnswersCount: wrongAnswers.length
      }
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error('获取考试历史错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}