'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ExamModeConfig {
  mode: string
  label: string
  description: string
}

const EXAM_MODES: ExamModeConfig[] = [
  {
    mode: 'random',
    label: '随机模式',
    description: '题目完全随机排列，模拟真实考试环境'
  },
  {
    mode: 'unanswered_first',
    label: '未答题优先',
    description: '优先显示您之前未答过的题目，提高学习效率'
  },
  {
    mode: 'wrong_first',
    label: '错题优先',
    description: '优先显示您之前答错的题目，针对性复习薄弱环节'
  }
]

export default function ExamModePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState('random')
  const [loading, setLoading] = useState(false)

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const handleStartExam = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/exam/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: selectedMode
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/exam/${data.sessionId}`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || '开始考试失败')
      }
    } catch (error) {
      console.error('开始考试失败:', error)
      alert('开始考试失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            选择答题模式
          </h1>
          <p className="text-lg text-gray-600">
            根据您的学习需求选择合适的答题模式
          </p>
        </div>

        {/* 考试信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">考试规则</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">40题</div>
              <div className="text-sm text-gray-600">判断题 (每题1分)</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">40题</div>
              <div className="text-sm text-gray-600">单选题 (每题1分)</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">20题</div>
              <div className="text-sm text-gray-600">多选题 (每题1分)</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-lg font-semibold text-blue-900">
              总计: 100题 100分 | 考试时间: 90分钟 | 合格分数: 60分
            </div>
          </div>
        </div>

        {/* 模式选择 */}
        <div className="space-y-4 mb-8">
          {EXAM_MODES.map((mode) => (
            <div
              key={mode.mode}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                selectedMode === mode.mode
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setSelectedMode(mode.mode)}
            >
              <div className="flex items-start">
                <input
                  type="radio"
                  name="mode"
                  value={mode.mode}
                  checked={selectedMode === mode.mode}
                  onChange={() => setSelectedMode(mode.mode)}
                  className="mt-1 mr-4"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {mode.label}
                  </h3>
                  <p className="text-gray-600">
                    {mode.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center space-x-4">
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            返回首页
          </Link>
          <button
            onClick={handleStartExam}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '开始中...' : '开始考试'}
          </button>
        </div>
      </div>
    </div>
  )
}