import React from 'react'
import BudgetSankey from './BudgetSankey'
import BudgetSankeyByEPE from './BudgetSankeyByEPE'

type BudgetSankeyTab = 'flow' | 'epe'

export function BudgetConfirmPanel() {
  const mockVersion = '3'
  const mockBumMin = 45
  const mockBumMax = 50
  const [sankeyTab, setSankeyTab] = React.useState<BudgetSankeyTab>('flow')

  const summary = {
    totalBudget: 50.0,
    won: 15.5,
    notWon: 34.5,
    totalIncome: 26.0,
    get remainingIncome() { return this.totalIncome - this.won }
  }

  return (
    <div className="space-y-6">
      {/* 1. 财务概览卡片 */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">项目总预算</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{summary.totalBudget.toFixed(1)}</span>
              <span className="text-xs text-gray-500 font-medium">万</span>
            </div>
          </div>
          <div className="space-y-1.5 sm:border-l border-gray-100 sm:pl-6">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">已成交金额</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#4887FF]">{summary.won.toFixed(1)}</span>
              <span className="text-xs text-gray-500 font-medium">万</span>
            </div>
          </div>
          <div className="space-y-1.5 sm:border-l border-gray-100 sm:pl-6">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">未成交金额</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-400">{summary.notWon.toFixed(1)}</span>
              <span className="text-xs text-gray-500 font-medium">万</span>
            </div>
          </div>
          <div className="space-y-1.5 sm:border-l border-gray-100 sm:pl-6">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">项目总入金</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#FBBF24]">{summary.totalIncome.toFixed(1)}</span>
              <span className="text-xs text-gray-500 font-medium">万</span>
            </div>
          </div>
          <div className="space-y-1.5 sm:border-l border-gray-100 sm:pl-6">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">入金剩余金额</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#F97316]">{summary.remainingIncome.toFixed(1)}</span>
              <span className="text-xs text-gray-500 font-medium">万</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 预算流动可视化 (Sankey) - 挪到顶部 */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="text-sm font-semibold text-gray-900">预算流动可视化</div>
          <div className="text-xs text-gray-400">示意图 · 与 dsphr 桑基图布局对齐</div>
        </div>
        <div className="mb-3">
          <div className="flex rounded-xl border border-gray-200 p-0.5 bg-gray-50 w-fit">
            <button
              type="button"
              onClick={() => setSankeyTab('flow')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${sankeyTab === 'flow' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              订单预算拆解
            </button>
            <button
              type="button"
              onClick={() => setSankeyTab('epe')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${sankeyTab === 'epe' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              EPC预算拆解
            </button>
          </div>
        </div>
        {sankeyTab === 'flow' ? <BudgetSankey /> : <BudgetSankeyByEPE />}
      </section>

      {/* 3. 其他卡片内容 - 挪到底部 */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">预算方案确认</h1>
          <p className="mt-1 text-sm text-gray-600">
            对预算区间与分配方案进行复核，确认无误后作为本项目当前生效的预算基线；如需调整可先提交反馈。
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">当前版本</div>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-600 px-3 py-1 text-xs font-medium border border-blue-100"
          >
            <span>v{mockVersion}</span>
          </button>
        </div>
      </section>

      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5">
        <div className="text-sm font-semibold text-gray-900 mb-3">预算池状态</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">最近确认时间</div>
            <div className="text-sm text-gray-900">—</div>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">本期已确认金额</div>
            <div className="text-sm text-gray-900">—</div>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3">
            <div className="text-xs text-gray-500 mb-1">剩余可调预算</div>
            <div className="text-sm text-gray-900">—</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs font-semibold text-[#EF6B00] mb-1">预算区间</div>
                <p className="text-sm text-gray-500">
                  结合同类项目经验与当前配置，为你估算的合理预算区间；区间内可灵活调优子项配置。
                </p>
              </div>
              <div className="text-xs text-gray-400">单位：万元</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-blue-50 px-4 py-3">
                <div className="text-xs text-blue-700 mb-1">在区间内（BUM_min）</div>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-semibold text-blue-700">{mockBumMin}</span>
                  <span className="text-xs text-blue-700 mb-1">万元</span>
                </div>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                <div className="text-xs text-emerald-700 mb-1">区间上限（BUM_max）</div>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-semibold text-emerald-700">{mockBumMax}</span>
                  <span className="text-xs text-emerald-700 mb-1">万元</span>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600 leading-relaxed">
              BUM 区间用于平衡体验、耐用性与预算可控；若你希望进一步优化成本，我们也可以在不破坏整体体验的前提下，对部分配置进行微调。
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm font-semibold text-gray-900 mb-2">分配方案说明</div>
            <p className="text-xs text-gray-600 leading-relaxed">
              预算会在「前期设计 / 主材设备 / 施工安装 / 软装家私」等多个节点之间进行分配。右侧的预算流向图会展示从总包预算到各子类目的流动结构，帮助你理解每一笔费用的大致去向。
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm font-semibold text-gray-900 mb-2">当前操作</div>
            <p className="text-xs text-gray-600 mb-4">
              这是一个静态演示界面，用于在「项目预算」分页中体验预算确认页的布局与信息层级，不会写入真实订单或预算数据。
            </p>
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#EF6B00] text-white text-sm font-medium px-4 py-3 hover:bg-[#D85F00] transition-colors"
            >
              确认当前预算方案（示意）
            </button>
            <button
              type="button"
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-sm font-medium px-4 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              提交反馈，调整预算结构（示意）
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm font-semibold text-gray-900 mb-2">版本历史</div>
            <p className="text-xs text-gray-600 leading-relaxed">
              正式环境下，这里会展示每次预算调整后的版本记录（例如 v1 / v2 / v3），包含创建时间与操作说明，方便对比与追溯。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-emerald-50 border border-emerald-100 rounded-3xl px-6 py-3 text-xs text-emerald-800 flex items-center justify-between">
        <span>正式环境下，这里会显示「已生效预算方案」与最近一次确认时间。</span>
        <span className="font-medium">演示版本 · 不写入任何真实数据</span>
      </section>
    </div>
  )
}
