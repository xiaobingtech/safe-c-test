import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../../lib/auth'
import { db } from '../../../../../../lib/db'
import questionsData from '../../../../../output/questions.json'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const { sessionId } = params

    // 获取考试会话详情
    const examSession = await db.examSession.findUnique({
      where: {
        id: sessionId,
        userId: session.user.id // 确保只能查看自己的考试记录
      },
      include: {
        answers: true,
        user: true
      }
    })

    if (!examSession) {
      return NextResponse.json(
        { error: '考试记录不存在' },
        { status: 404 }
      )
    }

    // 获取题目数据用于显示详细信息
    const allQuestions = [
      ...questionsData.questions.singleChoice,
      ...questionsData.questions.multipleChoice,
      ...questionsData.questions.judge
    ]

    // 构建答题详情
    const answerDetails = examSession.answers.map(answer => {
      const question = allQuestions.find(q => q.id === answer.questionId)
      
      return {
        questionId: answer.questionId,
        question: question?.question || '题目未找到',
        questionType: answer.questionType,
        options: question && 'options' in question ? question.options : undefined,
        userAnswer: answer.userAnswer ? JSON.parse(answer.userAnswer) : null,
        correctAnswer: answer.correctAnswer ? JSON.parse(answer.correctAnswer) : null,
        isCorrect: answer.isCorrect,
        score: answer.score,
        answeredAt: answer.answeredAt
      }
    })

    // 计算统计信息
    const stats = {
      totalQuestions: examSession.totalQuestions,
      answeredQuestions: examSession.answers.length,
      correctAnswers: examSession.answers.filter(a => a.isCorrect).length,
      wrongAnswers: examSession.answers.filter(a => !a.isCorrect).length,
      totalScore: examSession.score || 0,
      passed: (examSession.score || 0) >= 60,
      duration: examSession.endTime 
        ? Math.floor((examSession.endTime.getTime() - examSession.startTime.getTime()) / 1000)
        : 0
    }

    // 按题型分类统计
    const typeStats = {
      single: {
        total: answerDetails.filter(a => a.questionType === 'single').length,
        correct: answerDetails.filter(a => a.questionType === 'single' && a.isCorrect).length,
        score: answerDetails.filter(a => a.questionType === 'single').reduce((sum, a) => sum + a.score, 0)
      },
      multiple: {
        total: answerDetails.filter(a => a.questionType === 'multiple').length,
        correct: answerDetails.filter(a => a.questionType === 'multiple' && a.isCorrect).length,
        score: answerDetails.filter(a => a.questionType === 'multiple').reduce((sum, a) => sum + a.score, 0)
      },
      judge: {
        total: answerDetails.filter(a => a.questionType === 'judge').length,
        correct: answerDetails.filter(a => a.questionType === 'judge' && a.isCorrect).length,
        score: answerDetails.filter(a => a.questionType === 'judge').reduce((sum, a) => sum + a.score, 0)
      }
    }

    return NextResponse.json({
      examSession: {
        id: examSession.id,
        startTime: examSession.startTime,
        endTime: examSession.endTime,
        isCompleted: examSession.isCompleted,
        timeLimit: examSession.timeLimit
      },
      stats,
      typeStats,
      answerDetails: answerDetails.sort((a, b) => a.questionId - b.questionId)
    })
  } catch (error) {
    console.error('获取考试结果错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}