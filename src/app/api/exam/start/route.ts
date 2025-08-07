import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { createExamSession, getRandomQuestions, getExamQuestions } from '../../../../../lib/exam'

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

    let body
    let existingSessionId
    let examMode = 'random' // 默认随机模式
    
    try {
      body = await request.json()
      existingSessionId = body.sessionId
      examMode = body.mode || 'random'
    } catch {
      // 如果没有请求体，就创建新的考试会话
      existingSessionId = null
    }

    let examSessionId: string
    let questions

    let timeLimit = 5400 // 默认90分钟

    // 如果提供了sessionId，尝试获取已存在的题目
    if (existingSessionId) {
      questions = await getExamQuestions(existingSessionId)
      if (questions) {
        examSessionId = existingSessionId
        
        // 获取考试会话信息来计算剩余时间
        const { getExamSession } = await import('../../../../../lib/exam')
        const examSession = await getExamSession(existingSessionId)
        
        if (examSession && !examSession.isCompleted) {
          // 计算已用时间
          const elapsedTime = Math.floor((Date.now() - examSession.startTime.getTime()) / 1000)
          timeLimit = Math.max(0, examSession.timeLimit - elapsedTime)
          
          // 如果时间已经用完，标记考试完成
          if (timeLimit <= 0) {
            const { completeExam } = await import('../../../../../lib/exam')
            await completeExam(existingSessionId)
            return NextResponse.json({
              error: '考试时间已结束',
              timeExpired: true
            }, { status: 400 })
          }
        }
      } else {
        // 会话不存在或没有题目，创建新的
        questions = await getRandomQuestions(examMode as any, session.user.id)
        examSessionId = await createExamSession(session.user.id, questions)
      }
    } else {
      // 创建新的考试会话和题目
      questions = await getRandomQuestions(examMode as any, session.user.id)
      examSessionId = await createExamSession(session.user.id, questions)
    }
    
    return NextResponse.json({
      sessionId: examSessionId,
      questions: questions,
      config: {
        timeLimit: timeLimit,
        totalQuestions: 80
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