import React from 'react'
import { useNavigate } from 'react-router-dom'
import { RequirementsDoc } from './WorkbenchPage'

/** 展示页：使用写死的示例数据，用于设计演示与参考 */
export default function RequirementsShowcasePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#FFFDF3]">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            ← 返回项目中心
          </button>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            示例展示
          </span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <RequirementsDoc
          isShowcase
          projectName="龙湖璟宸府"
          ownerDisplayName="张雅雯"
          onBackHome={() => navigate('/home')}
        />
      </main>
    </div>
  )
}
