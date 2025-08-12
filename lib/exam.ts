// 默认载入C类题库，其他类别按需从磁盘读取
import cQuestionsData from '../src/output/questions.json'
import * as fs from 'fs'
import * as path from 'path'

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

export type ExamMode = 'random' | 'unanswered_first' | 'wrong_first'
export type ExamCategory = 'A' | 'B' | 'C'

export interface ExamModeConfig {
  mode: ExamMode
  label: string
  description: string
}

export const EXAM_CONFIG: ExamConfig = {
  singleChoiceCount: 40,
  multipleChoiceCount: 20,
  judgeCount: 40, // 40道判断题，总共100题
  timeLimit: 5400, // 90分钟
  totalQuestions: 100
}

export const EXAM_MODES: ExamModeConfig[] = [
  {
    mode: 'random',
    label: '随机模式',
    description: '题目完全随机排列'
  },
  {
    mode: 'unanswered_first',
    label: '未答题优先',
    description: '优先显示未答的题目'
  },
  {
    mode: 'wrong_first',
    label: '错题优先',
    description: '优先显示之前答错的题目'
  }
]

export async function getRandomQuestions(
  mode: ExamMode = 'random',
  userId?: string,
  category: ExamCategory = 'C'
): Promise<Question[]> {
  const data = await loadQuestionsByCategory(category)
  const { singleChoice, multipleChoice, judge } = data.questions
  
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
  
  // 按题型顺序排列：先判断题，再单选，最后多选
  const allQuestions: Question[] = [
    ...selectedJudge,
    ...selectedSingle,
    ...selectedMultiple
  ]
  
  // 根据模式排序题目
  return await sortQuestionsByMode(allQuestions, mode, userId)
}

interface QuestionsFileMetadata {
  totalQuestions: number
  singleChoiceCount: number
  multipleChoiceCount: number
  judgeCount: number
  parseDate: string
  [key: string]: any
}

interface QuestionsFile {
  metadata: QuestionsFileMetadata
  questions: {
    singleChoice: Question[]
    multipleChoice: Question[]
    judge: Question[]
  }
}

async function loadQuestionsByCategory(category: ExamCategory): Promise<QuestionsFile> {
  try {
    switch (category) {
      case 'A':
        return readQuestionsFromDisk('questions_A.json')
      case 'B':
        return readQuestionsFromDisk('questions_B.json')
      case 'C':
        {
          const disk = readQuestionsFromDisk('questions_C.json')
          // 如果磁盘没有，回退到打包内置的 questions.json
          return (disk?.questions ? disk : (cQuestionsData as QuestionsFile))
        }
      default:
        return cQuestionsData as QuestionsFile
    }
  } catch (error) {
    console.error(`载入题库失败: ${category}`, error)
    // 回退到C类
    return cQuestionsData as QuestionsFile
  }
}

function readQuestionsFromDisk(fileName: string): QuestionsFile {
  const filePath = path.join(process.cwd(), 'src', 'output', fileName)
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as QuestionsFile
  } catch (error) {
    console.error(`读取题库文件失败: ${filePath}`, error)
    // 兜底到C类
    return cQuestionsData as QuestionsFile
  }
}

async function sortQuestionsByMode(questions: Question[], mode: ExamMode, userId?: string): Promise<Question[]> {
  // 严格保持题型分组顺序：judge -> single -> multiple
  const judgeGroup = questions.filter(q => q.type === 'judge')
  const singleGroup = questions.filter(q => q.type === 'single')
  const multipleGroup = questions.filter(q => q.type === 'multiple')

  if (mode === 'random') {
    // 随机模式：仅在各分组内打乱，保持分组顺序
    return [
      ...shuffleArray(judgeGroup),
      ...shuffleArray(singleGroup),
      ...shuffleArray(multipleGroup)
    ]
  }

  if (mode === 'unanswered_first' && userId) {
    const answeredQuestionIds = await getUserAnsweredQuestions(userId)
    const sortByUnanswered = (group: Question[]) => {
      const unanswered = group.filter(q => !answeredQuestionIds.has(q.id))
      const answered = group.filter(q => answeredQuestionIds.has(q.id))
      return [...shuffleArray(unanswered), ...shuffleArray(answered)]
    }
    return [
      ...sortByUnanswered(judgeGroup),
      ...sortByUnanswered(singleGroup),
      ...sortByUnanswered(multipleGroup)
    ]
  }

  if (mode === 'wrong_first' && userId) {
    const wrongQuestionIds = await getUserWrongQuestions(userId)
    const sortByWrongFirst = (group: Question[]) => {
      const wrong = group.filter(q => wrongQuestionIds.has(q.id))
      const others = group.filter(q => !wrongQuestionIds.has(q.id))
      return [...shuffleArray(wrong), ...shuffleArray(others)]
    }
    return [
      ...sortByWrongFirst(judgeGroup),
      ...sortByWrongFirst(singleGroup),
      ...sortByWrongFirst(multipleGroup)
    ]
  }

  // 默认：保持原有（已分组）顺序
  return [...judgeGroup, ...singleGroup, ...multipleGroup]
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

async function getUserAnsweredQuestions(userId: string): Promise<Set<number>> {
  try {
    const { db } = await import('./db')
    const sessions = await db.examSession.findMany({
      where: { userId },
      include: { answers: true }
    })
    
    const answeredQuestionIds = new Set<number>()
    sessions.forEach(session => {
      session.answers.forEach(answer => {
        answeredQuestionIds.add(answer.questionId)
      })
    })
    
    return answeredQuestionIds
  } catch (error) {
    console.error('获取用户答题历史失败:', error)
    return new Set()
  }
}

async function getUserWrongQuestions(userId: string): Promise<Set<number>> {
  try {
    const { db } = await import('./db')
    const sessions = await db.examSession.findMany({
      where: { userId },
      include: { 
        answers: {
          where: { isCorrect: false }
        }
      }
    })
    
    const wrongQuestionIds = new Set<number>()
    sessions.forEach(session => {
      session.answers.forEach(answer => {
        wrongQuestionIds.add(answer.questionId)
      })
    })
    
    return wrongQuestionIds
  } catch (error) {
    console.error('获取用户错题历史失败:', error)
    return new Set()
  }
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
      
      // 多选题必须完全正确才得分（1分）
      const isMultipleCorrect = userAnswers.length === correctAnswers.length &&
        userAnswers.every(ans => correctAnswers.includes(ans))
      
      return {
        isCorrect: isMultipleCorrect,
        score: isMultipleCorrect ? 1 : 0
      }
    
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