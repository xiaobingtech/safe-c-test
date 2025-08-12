import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { createExamSession, getRandomQuestions, getExamQuestions, ExamCategory } from '../../../../../lib/exam'

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
    let category: ExamCategory = 'C'
    
    try {
      body = await request.json()
      existingSessionId = body.sessionId
      examMode = body.mode || 'random'
      if (body.category && ['A','B','C'].includes(body.category)) {
        category = body.category
      }
    } catch {
      // 如果没有请求体，就创建新的考试会话
      existingSessionId = null
    }

    let examSessionId: string
    let questions

    // 使用配置常量，避免硬编码
    const { EXAM_CONFIG } = await import('../../../../../lib/exam')
    let timeLimit = EXAM_CONFIG.timeLimit

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

        // 保障旧会话的题型顺序：判断→单选→多选（仅在顺序不符合时重排并回写）
        try {
          const isGroupedOrder = (qs: any[]) => {
            const types = qs.map(q => q.type)
            const first40 = types.slice(0, 40).every(t => t === 'judge')
            const next40 = types.slice(40, 80).every(t => t === 'single')
            const last20 = types.slice(80, 100).every(t => t === 'multiple')
            return first40 && next40 && last20
          }

          if (!isGroupedOrder(questions)) {
            const judge = questions.filter((q: any) => q.type === 'judge')
            const single = questions.filter((q: any) => q.type === 'single')
            const multiple = questions.filter((q: any) => q.type === 'multiple')
            const regrouped = [...judge, ...single, ...multiple].slice(0, 100)

            // 仅当数量满足100题时进行重排回写
            if (regrouped.length === 100) {
              const { db } = await import('../../../../../lib/db')
              await db.examSession.update({
                where: { id: existingSessionId },
                data: { questions: JSON.stringify(regrouped) }
              })
              questions = regrouped
            }
          }
        } catch {}
      } else {
        // 会话不存在或没有题目，创建新的
        questions = await getRandomQuestions(examMode as any, session.user.id, category)
        examSessionId = await createExamSession(session.user.id, questions)
      }
    } else {
      // 创建新的考试会话和题目
      questions = await getRandomQuestions(examMode as any, session.user.id, category)
      examSessionId = await createExamSession(session.user.id, questions)
    }
    
    return NextResponse.json({
      sessionId: examSessionId,
      questions: questions,
      config: {
        timeLimit: timeLimit,
        totalQuestions: EXAM_CONFIG.totalQuestions
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