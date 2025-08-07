'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ExamHistory {
  id: string
  startTime: string
  duration: number
  score: number
  totalQuestions: number
  passed: boolean
  wrongAnswersCount: number
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [examHistory, setExamHistory] = useState<ExamHistory[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchExamHistory()
    }
  }, [status, router])

  const fetchExamHistory = async () => {
    try {
      const response = await fetch('/api/exam/history')
      if (response.ok) {
        const data = await response.json()
        setExamHistory(data.history)
      }
    } catch (error) {
      console.error('获取考试历史失败:', error)
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                安全C证模拟考试系统
              </h1>
              <p className="text-gray-600 mt-1">
                欢迎，{session.user.username}
              </p>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 考试信息卡片 */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                考试规则
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">100</div>
                  <div className="text-sm text-gray-600">题目总数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">90</div>
                  <div className="text-sm text-gray-600">考试时长(分钟)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">60</div>
                  <div className="text-sm text-gray-600">合格分数</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-purple-50 p-3 rounded">
                  <div className="font-semibold text-purple-800">判断题 (40题)</div>
                  <div className="text-purple-600">每题1分，共40分</div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-semibold text-blue-800">单选题 (40题)</div>
                  <div className="text-blue-600">每题1分，共40分</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="font-semibold text-green-800">多选题 (20题)</div>
                  <div className="text-green-600">每题1分，共20分</div>
                </div>
              </div>

              <Link
                href="/exam/mode"
                className="block w-full bg-blue-600 text-white text-lg font-semibold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                开始新考试
              </Link>
            </div>
          </div>

          {/* 考试历史 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                考试记录
              </h3>
              
              {examHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无考试记录</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          考试时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用时
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          分数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          结果
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          错题数
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {examHistory.map((exam) => (
                        <tr key={exam.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(exam.startTime).toLocaleString('zh-CN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDuration(exam.duration)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.score}分
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              exam.passed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {exam.passed ? '通过' : '未通过'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.wrongAnswersCount}题
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/exam/results/${exam.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              查看详情
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}