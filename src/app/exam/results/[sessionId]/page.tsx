'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface AnswerDetail {
  questionId: number
  question: string
  questionType: string
  options?: any
  userAnswer: any
  correctAnswer: any
  isCorrect: boolean
  score: number
  answeredAt: string | null
}

interface ExamResults {
  examSession: {
    id: string
    startTime: string
    endTime: string
    isCompleted: boolean
    timeLimit: number
  }
  stats: {
    totalQuestions: number
    answeredQuestions: number
    correctAnswers: number
    wrongAnswers: number
    totalScore: number
    passed: boolean
    duration: number
  }
  typeStats: {
    single: { total: number; correct: number; score: number }
    multiple: { total: number; correct: number; score: number }
    judge: { total: number; correct: number; score: number }
  }
  answerDetails: AnswerDetail[]
}

export default function ExamResultsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string
  
  const [results, setResults] = useState<ExamResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWrongOnly, setShowWrongOnly] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    fetchResults()
  }, [session, sessionId, router])

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/exam/results/${sessionId}`)
      
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      } else {
        alert('获取考试结果失败')
        router.push('/')
      }
    } catch (error) {
      console.error('获取考试结果失败:', error)
      alert('获取考试结果失败')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}时${minutes}分${secs}秒`
    }
    return `${minutes}分${secs}秒`
  }

  const formatAnswer = (answer: any, questionType: string) => {
    if (questionType === 'judge') {
      return answer ? '正确' : '错误'
    }
    if (Array.isArray(answer)) {
      return answer.join(', ')
    }
    return answer || '未答'
  }

  const renderQuestionDetail = (detail: AnswerDetail, index: number) => {
    const isWrong = !detail.isCorrect

    return (
      <div key={detail.questionId} className={`border rounded-lg p-6 ${isWrong ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">
            第 {index + 1} 题 
            ({detail.questionType === 'single' ? '单选题' : 
              detail.questionType === 'multiple' ? '多选题' : '判断题'})
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-sm font-semibold rounded ${
              detail.isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {detail.isCorrect ? '正确' : '错误'}
            </span>
            <span className="text-sm text-gray-600">
              得分: {detail.score}分
            </span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-900 mb-4">{detail.question}</p>
          
          {detail.options && (
            <div className="space-y-2 mb-4">
              {Object.entries(detail.options).map(([key, value]: [string, any]) => (
                <div key={key} className="text-sm">
                  <strong>{key}.</strong> {value}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-700">您的答案: </span>
            <span className={detail.isCorrect ? 'text-green-600' : 'text-red-600'}>
              {formatAnswer(detail.userAnswer, detail.questionType)}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">正确答案: </span>
            <span className="text-green-600">
              {formatAnswer(detail.correctAnswer, detail.questionType)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载考试结果中...</div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">无法加载考试结果</div>
      </div>
    )
  }

  const filteredAnswers = showWrongOnly 
    ? results.answerDetails.filter(detail => !detail.isCorrect)
    : results.answerDetails

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              考试结果
            </h1>
            <Link
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 总体结果 */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center mb-6">
                <div className={`text-6xl font-bold mb-2 ${results.stats.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {results.stats.totalScore}分
                </div>
                <div className={`text-2xl font-semibold ${results.stats.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {results.stats.passed ? '考试通过' : '考试未通过'}
                </div>
                <div className="text-gray-600 mt-2">
                  合格线: 60分
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {results.stats.answeredQuestions}/{results.stats.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">答题数/总题数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {results.stats.correctAnswers}
                  </div>
                  <div className="text-sm text-gray-600">正确答案</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {results.stats.wrongAnswers}
                  </div>
                  <div className="text-sm text-gray-600">错误答案</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatDuration(results.stats.duration)}
                  </div>
                  <div className="text-sm text-gray-600">用时</div>
                </div>
              </div>
            </div>
          </div>

          {/* 分题型统计 */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                分题型统计
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {results.typeStats.single.score}分
                    </div>
                    <div className="text-sm text-blue-600">单选题得分</div>
                    <div className="text-xs text-gray-600 mt-1">
                      正确: {results.typeStats.single.correct}/{results.typeStats.single.total}
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {results.typeStats.multiple.score}分
                    </div>
                    <div className="text-sm text-green-600">多选题得分</div>
                    <div className="text-xs text-gray-600 mt-1">
                      正确: {results.typeStats.multiple.correct}/{results.typeStats.multiple.total}
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {results.typeStats.judge.score}分
                    </div>
                    <div className="text-sm text-purple-600">判断题得分</div>
                    <div className="text-xs text-gray-600 mt-1">
                      正确: {results.typeStats.judge.correct}/{results.typeStats.judge.total}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 答题详情 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  答题详情
                </h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showWrongOnly}
                      onChange={(e) => setShowWrongOnly(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">只显示错题</span>
                  </label>
                  <span className="text-sm text-gray-600">
                    显示 {filteredAnswers.length} 道题
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredAnswers.map((detail, index) => renderQuestionDetail(detail, index))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}