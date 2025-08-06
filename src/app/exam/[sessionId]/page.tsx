'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'

interface Question {
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

interface AnswerResult {
  isCorrect: boolean
  score: number
  message: string
}

export default function ExamPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[] | boolean>>({})
  const [timeLeft, setTimeLeft] = useState(5400) // 90分钟
  const [loading, setLoading] = useState(true)
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())
  const [confirmedQuestions, setConfirmedQuestions] = useState<Set<number>>(new Set())
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    fetchExamData()
    startTimer()
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [session, sessionId, router])

  const fetchExamData = async () => {
    try {
      const response = await fetch('/api/exam/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: sessionId // 传递sessionId以获取已保存的题目
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
        setTimeLeft(data.config.timeLimit)
      } else {
        const errorData = await response.json()
        if (errorData.timeExpired) {
          alert('考试时间已结束，正在跳转到结果页面')
          router.push(`/exam/results/${sessionId}`)
        } else {
          alert('获取考试数据失败')
          router.push('/')
        }
      }
    } catch (error) {
      console.error('获取考试数据失败:', error)
      alert('获取考试数据失败')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // 页面获得焦点时同步时间
  useEffect(() => {
    if (loading) return // 避免在初始加载时重复调用

    const handleFocus = () => {
      // 重新获取最新的考试数据和剩余时间
      fetchExamData()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // 页面重新可见时同步时间
        handleFocus()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loading, sessionId])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatCorrectAnswer = (question: Question) => {
    if (question.type === 'judge') {
      return question.correctAnswer ? '正确' : '错误'
    }
    
    if (question.type === 'single') {
      return question.correctAnswer as string
    }
    
    if (question.type === 'multiple') {
      const answers = question.correctAnswer as string[]
      return answers.join(', ')
    }
    
    return String(question.correctAnswer)
  }

  const handleAnswerChange = (questionId: number, answer: string | string[] | boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
    setAnswerResult(null) // 选择新答案时清除之前的反馈
  }

  const handleConfirmAnswer = async () => {
    const currentQuestion = questions[currentQuestionIndex]
    const userAnswer = answers[currentQuestion.id]
    
    if (userAnswer === undefined || userAnswer === null) {
      alert('请选择答案')
      return
    }

    try {
      const response = await fetch('/api/exam/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          questionType: currentQuestion.type,
          userAnswer,
          correctAnswer: currentQuestion.correctAnswer
        })
      })

      if (response.ok) {
        const result = await response.json()
        setAnswerResult(result)
        setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id))
        setConfirmedQuestions(prev => new Set(prev).add(currentQuestion.id))
      } else {
        alert('保存答案失败')
      }
    } catch (error) {
      console.error('保存答案失败:', error)
      alert('保存答案失败')
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setAnswerResult(null) // 清除答案反馈
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setAnswerResult(null) // 清除答案反馈
    }
  }

  const handleSubmitExam = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    const unansweredCount = questions.length - answeredQuestions.size
    if (unansweredCount > 0) {
      const confirm = window.confirm(`还有${unansweredCount}道题未答，确定要交卷吗？`)
      if (!confirm) return
    }

    try {
      const response = await fetch('/api/exam/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/exam/results/${sessionId}`)
      } else {
        alert('交卷失败')
      }
    } catch (error) {
      console.error('交卷失败:', error)
      alert('交卷失败')
    }
  }

  const renderQuestionOptions = (question: Question) => {
    const userAnswer = answers[question.id]
    const isConfirmed = confirmedQuestions.has(question.id)

    if (question.type === 'judge') {
      return (
        <div className="space-y-3">
          <label className={`flex items-center space-x-3 ${isConfirmed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
            <input
              type="radio"
              name={`question-${question.id}`}
              value="true"
              checked={userAnswer === true}
              onChange={() => !isConfirmed && handleAnswerChange(question.id, true)}
              disabled={isConfirmed}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-lg">正确</span>
          </label>
          <label className={`flex items-center space-x-3 ${isConfirmed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
            <input
              type="radio"
              name={`question-${question.id}`}
              value="false"
              checked={userAnswer === false}
              onChange={() => !isConfirmed && handleAnswerChange(question.id, false)}
              disabled={isConfirmed}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-lg">错误</span>
          </label>
        </div>
      )
    }

    if (question.type === 'single') {
      return (
        <div className="space-y-3">
          {Object.entries(question.options!).map(([key, value]) => (
            <label key={key} className={`flex items-start space-x-3 ${isConfirmed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name={`question-${question.id}`}
                value={key}
                checked={userAnswer === key}
                onChange={() => !isConfirmed && handleAnswerChange(question.id, key)}
                disabled={isConfirmed}
                className="w-4 h-4 text-blue-600 mt-1"
              />
              <span className="text-lg">
                <strong>{key}.</strong> {value}
              </span>
            </label>
          ))}
        </div>
      )
    }

    if (question.type === 'multiple') {
      const selectedAnswers = Array.isArray(userAnswer) ? userAnswer : []
      
      return (
        <div className="space-y-3">
          {Object.entries(question.options!).map(([key, value]) => (
            <label key={key} className={`flex items-start space-x-3 ${isConfirmed ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                value={key}
                checked={selectedAnswers.includes(key)}
                onChange={(e) => {
                  if (!isConfirmed) {
                    const newAnswers = e.target.checked
                      ? [...selectedAnswers, key]
                      : selectedAnswers.filter(a => a !== key)
                    handleAnswerChange(question.id, newAnswers)
                  }
                }}
                disabled={isConfirmed}
                className="w-4 h-4 text-blue-600 mt-1"
              />
              <span className="text-lg">
                <strong>{key}.</strong> {value}
              </span>
            </label>
          ))}
        </div>
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载考试中...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">无法加载考试题目</div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              安全C证模拟考试
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-lg font-semibold text-red-600">
                剩余时间: {formatTime(timeLeft)}
              </div>
              <button
                onClick={handleSubmitExam}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                交卷
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 左侧进度栏 */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">答题进度</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>进度</span>
                  <span>{currentQuestionIndex + 1}/{questions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              {/* 按题型分组显示 */}
              <div className="space-y-4">
                {/* 单选题 */}
                <div>
                  <div className="text-sm font-medium text-blue-600 mb-2">单选题 (1-30)</div>
                  <div className="grid grid-cols-10 gap-2">
                    {questions.slice(0, 30).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentQuestionIndex(index)
                          setAnswerResult(null) // 切换题目时清除答案反馈
                        }}
                        className={`w-10 h-10 text-sm font-medium rounded ${
                          index === currentQuestionIndex
                            ? 'bg-blue-600 text-white'
                            : confirmedQuestions.has(questions[index].id)
                            ? 'bg-green-500 text-white'
                            : answeredQuestions.has(questions[index].id)
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-gray-200 text-gray-600'
                        } hover:opacity-80 transition-colors`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 多选题 */}
                <div>
                  <div className="text-sm font-medium text-green-600 mb-2">多选题 (31-50)</div>
                  <div className="grid grid-cols-10 gap-2">
                    {questions.slice(30, 50).map((_, index) => {
                      const actualIndex = index + 30;
                      return (
                        <button
                          key={actualIndex}
                          onClick={() => {
                            setCurrentQuestionIndex(actualIndex)
                            setAnswerResult(null) // 切换题目时清除答案反馈
                          }}
                          className={`w-10 h-10 text-sm font-medium rounded ${
                            actualIndex === currentQuestionIndex
                              ? 'bg-green-600 text-white'
                              : confirmedQuestions.has(questions[actualIndex]?.id)
                              ? 'bg-green-500 text-white'
                              : answeredQuestions.has(questions[actualIndex]?.id)
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-gray-200 text-gray-600'
                          } hover:opacity-80 transition-colors`}
                        >
                          {actualIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 判断题 */}
                <div>
                  <div className="text-sm font-medium text-purple-600 mb-2">判断题 (51-80)</div>
                  <div className="grid grid-cols-10 gap-2">
                    {questions.slice(50, 80).map((_, index) => {
                      const actualIndex = index + 50;
                      return (
                        <button
                          key={actualIndex}
                          onClick={() => {
                            setCurrentQuestionIndex(actualIndex)
                            setAnswerResult(null) // 切换题目时清除答案反馈
                          }}
                          className={`w-10 h-10 text-sm font-medium rounded ${
                            actualIndex === currentQuestionIndex
                              ? 'bg-purple-600 text-white'
                              : confirmedQuestions.has(questions[actualIndex]?.id)
                              ? 'bg-green-500 text-white'
                              : answeredQuestions.has(questions[actualIndex]?.id)
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-gray-200 text-gray-600'
                          } hover:opacity-80 transition-colors`}
                        >
                          {actualIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm">
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                  <span>已确认: {confirmedQuestions.size}</span>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-yellow-200 rounded mr-2"></div>
                  <span>已答题: {answeredQuestions.size - confirmedQuestions.size}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  <span>未答题: {questions.length - answeredQuestions.size}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧题目区域 */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    第 {currentQuestionIndex + 1} 题
                    {currentQuestion.type === 'single' && ` (单选题 ${currentQuestionIndex + 1}/30)`}
                    {currentQuestion.type === 'multiple' && ` (多选题 ${currentQuestionIndex - 29}/20)`}
                    {currentQuestion.type === 'judge' && ` (判断题 ${currentQuestionIndex - 49}/30)`}
                  </h2>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    currentQuestion.type === 'single' ? 'bg-blue-100 text-blue-800' :
                    currentQuestion.type === 'multiple' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {currentQuestion.type === 'single' && '1分'}
                    {currentQuestion.type === 'multiple' && '2分'}
                    {currentQuestion.type === 'judge' && '1分'}
                  </span>
                </div>
                
                <div className="text-lg mb-6 leading-relaxed">
                  {currentQuestion.question}
                </div>

                {renderQuestionOptions(currentQuestion)}
              </div>

              {answerResult && (
                <div className={`p-4 rounded-md mb-6 ${
                  answerResult.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`font-semibold mb-2 ${
                    answerResult.isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {answerResult.message} (得分: {answerResult.score}分)
                  </div>
                  {!answerResult.isCorrect && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">正确答案: </span>
                      <span className="text-green-600 font-medium">
                        {formatCorrectAnswer(currentQuestion)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    上一题
                  </button>
                  
                  <button
                    onClick={handleConfirmAnswer}
                    disabled={answers[currentQuestion.id] === undefined || confirmedQuestions.has(currentQuestion.id)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {confirmedQuestions.has(currentQuestion.id) ? '已确认' : '确认答案'}
                  </button>
                  
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    下一题
                  </button>
                </div>
                
                {currentQuestionIndex === questions.length - 1 && (
                  <button
                    onClick={handleSubmitExam}
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    提交试卷
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}