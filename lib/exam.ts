import questionsData from '../src/output/questions.json'

export interface Question {
  id: number
  question: string
  type: 'single' | 'multiple' | 'judge'
  options?: {
    A: string
    B: string
    C: string
    D: string
    E?: string
  }
  correctAnswer: string | string[] | boolean
}

export interface ExamConfig {
  singleChoiceCount: number
  multipleChoiceCount: number
  judgeCount: number
  timeLimit: number // 秒
  totalQuestions: number
}

export const EXAM_CONFIG: ExamConfig = {
  singleChoiceCount: 30,
  multipleChoiceCount: 20,
  judgeCount: 30, // 30道判断题，总共80题
  timeLimit: 5400, // 90分钟
  totalQuestions: 80
}

export function getRandomQuestions(): Question[] {
  const { singleChoice, multipleChoice, judge } = questionsData.questions
  
  // 随机选择题目并进行类型转换
  const selectedSingle = getRandomItems(singleChoice, EXAM_CONFIG.singleChoiceCount).map(q => ({
    ...q,
    type: 'single' as const
  }))
  const selectedMultiple = getRandomItems(multipleChoice, EXAM_CONFIG.multipleChoiceCount).map(q => ({
    ...q,
    type: 'multiple' as const
  }))
  const selectedJudge = getRandomItems(judge, EXAM_CONFIG.judgeCount).map(q => ({
    ...q,
    type: 'judge' as const
  }))
  
  // 按题型顺序排列：先单选，再多选，最后判断题
  const allQuestions: Question[] = [
    ...selectedSingle,
    ...selectedMultiple,
    ...selectedJudge
  ]
  
  // 不再打乱顺序，保持题型分组
  return allQuestions
}

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray([...array])
  return shuffled.slice(0, count)
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function calculateScore(
  questionType: string,
  userAnswer: string | string[],
  correctAnswer: string | string[] | boolean
): { isCorrect: boolean; score: number } {
  switch (questionType) {
    case 'single':
    case 'judge':
      const isCorrect = userAnswer === correctAnswer
      return {
        isCorrect,
        score: isCorrect ? (questionType === 'single' ? 1 : 1) : 0
      }
    
    case 'multiple':
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : []
      const correctAnswers = Array.isArray(correctAnswer) ? correctAnswer : []
      
      // 检查是否有错选
      const hasWrongSelection = userAnswers.some(ans => !correctAnswers.includes(ans))
      if (hasWrongSelection) {
        return { isCorrect: false, score: 0 }
      }
      
      // 计算少选扣分
      const correctCount = correctAnswers.length
      const userCount = userAnswers.length
      
      if (userCount === correctCount) {
        return { isCorrect: true, score: 2 }
      } else if (userCount < correctCount) {
        const missedCount = correctCount - userCount
        const score = Math.max(0, 2 - (missedCount * 0.5))
        return { isCorrect: false, score }
      }
      
      return { isCorrect: false, score: 0 }
    
    default:
      return { isCorrect: false, score: 0 }
  }
}

export async function createExamSession(userId: string, questions: Question[]): Promise<string> {
  const { db } = await import('./db')
  
  const session = await db.examSession.create({
    data: {
      userId,
      totalQuestions: EXAM_CONFIG.totalQuestions,
      timeLimit: EXAM_CONFIG.timeLimit,
      questions: JSON.stringify(questions) // 保存题目列表
    }
  })
  
  return session.id
}

export async function getExamSession(sessionId: string) {
  const { db } = await import('./db')
  
  return await db.examSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: true,
      user: true
    }
  })
}

export async function getExamQuestions(sessionId: string): Promise<Question[] | null> {
  const session = await getExamSession(sessionId)
  if (!session || !session.questions) {
    return null
  }
  
  try {
    return JSON.parse(session.questions) as Question[]
  } catch (error) {
    console.error('解析题目数据失败:', error)
    return null
  }
}

export async function saveAnswer(
  sessionId: string,
  questionId: number,
  questionType: string,
  userAnswer: string | string[],
  correctAnswer: string | string[] | boolean
) {
  const { db } = await import('./db')
  const { isCorrect, score } = calculateScore(questionType, userAnswer, correctAnswer)
  
  await db.examAnswer.upsert({
    where: {
      sessionId_questionId: {
        sessionId,
        questionId
      }
    },
    update: {
      userAnswer: JSON.stringify(userAnswer),
      correctAnswer: JSON.stringify(correctAnswer),
      isCorrect,
      score,
      answeredAt: new Date()
    },
    create: {
      sessionId,
      questionId,
      questionType,
      userAnswer: JSON.stringify(userAnswer),
      correctAnswer: JSON.stringify(correctAnswer),
      isCorrect,
      score,
      answeredAt: new Date()
    }
  })
}

export async function completeExam(sessionId: string) {
  const { db } = await import('./db')
  
  const session = await db.examSession.findUnique({
    where: { id: sessionId },
    include: { answers: true }
  })
  
  if (!session) throw new Error('考试会话不存在')
  
  const totalScore = session.answers.reduce((sum, answer) => sum + answer.score, 0)
  
  await db.examSession.update({
    where: { id: sessionId },
    data: {
      isCompleted: true,
      endTime: new Date(),
      score: totalScore
    }
  })
  
  return totalScore
}