import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Search, Wrench } from 'lucide-react'
import BudgetSankeyWorkbench from '../../../components/BudgetSankeyWorkbench'
import { buildBudgetSankeyFromDisplayOrders } from '../../../utils/ordersToBudgetSankey'
import { getOrderStatusColor, STATUS_BAR_COLORS, STATUS_BADGE_COLORS } from '../../../utils/orderStatus'
import {
  computePendingDecisionsFromOrders,
  type PendingDecisionItem,
  type PendingDecisionKind,
} from '../../../utils/pendingDecisionsFromOrders'

const PENDING_DECISION_TABS: {
  kind: PendingDecisionKind
  label: string
  description: string
}[] = [
  { kind: 'scheme_feedback', label: '方案待反馈', description: '走完全部反馈页并提交后自动完成' },
  { kind: 'quotation_pending', label: '报价待确认', description: '订购/交付报价单：签字确认或提交调整反馈后即完成' },
  { kind: 'settlement_confirm', label: '结算待确认', description: '结算单签字确认或意见反馈后即完成' },
]
export function OrderManagementSection({
  orders,
  isDemoLonghuProject,
  effectiveResolvedPendingKeys,
  deepEvalPath,
  onSelectOrder,
  onPendingDecisionItemAction,
}: {
  orders: any[]
  /** 龙湖璟宸府演示：按产品规则从订单列表推导待定决策 */
  isDemoLonghuProject: boolean
  effectiveResolvedPendingKeys: Set<string>
  /** 非演示项目且无订单时，引导去深度测评或联系顾问 */
  deepEvalPath?: string
  onSelectOrder?: (id: string) => void
  onPendingDecisionItemAction?: (item: PendingDecisionItem) => void
}) {
  const navigateOrders = useNavigate()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedPhases, setSelectedPhases] = React.useState<string[]>([])
  /** 0 = 桑基图（先），1 = 订单列表（后） */
  const [orderPresentationPage, setOrderPresentationPage] = React.useState<0 | 1>(0)

  const PHASES = [
    { id: 'intention', label: '意向期' },
    { id: 'ordering', label: '订购期' },
    { id: 'delivery', label: '交付期' },
    { id: 'acceptance', label: '验收期' },
    { id: 'maintenance', label: '维保期' },
  ];

  const togglePhase = (phaseId: string) => {
    setSelectedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const filteredOrders = React.useMemo(() => {
    let result = [...orders];
    
    // Search query filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
      );
    }

    // Phase filter
    if (selectedPhases.length > 0) {
      result = result.filter(o => {
        const phase = getOrderStatusColor(o.status);
        return selectedPhases.includes(phase);
      });
    }

    return result;
  }, [searchQuery, selectedPhases, orders])

  const sankeyData = React.useMemo(
    () => buildBudgetSankeyFromDisplayOrders(orders),
    [orders]
  )

  const pendingItems = React.useMemo(() => {
    if (!isDemoLonghuProject) return []
    return computePendingDecisionsFromOrders(orders, effectiveResolvedPendingKeys)
  }, [isDemoLonghuProject, orders, effectiveResolvedPendingKeys])
  const pendingCount = pendingItems.length

  const pendingByKind = React.useMemo(() => {
    const m: Record<PendingDecisionKind, PendingDecisionItem[]> = {
      scheme_feedback: [],
      quotation_pending: [],
      settlement_confirm: [],
    }
    for (const it of pendingItems) {
      m[it.kind].push(it)
    }
    return m
  }, [pendingItems])

  const [pendingTab, setPendingTab] = React.useState<PendingDecisionKind>('scheme_feedback')
  const pendingListSignature = pendingItems.map((i) => i.key).join('|')

  /** 仅待办列表变化时：若当前类已空，自动切到首个仍有事项的类（不干预用户主动点的空类标签） */
  React.useEffect(() => {
    if (pendingItems.length === 0) return
    if (pendingByKind[pendingTab].length > 0) return
    const first = PENDING_DECISION_TABS.find((t) => pendingByKind[t.kind].length > 0)?.kind
    if (first) setPendingTab(first)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅在列表变更时纠偏当前 tab
  }, [pendingListSignature])

  const tabItems = pendingByKind[pendingTab]

  return (
    <div className="space-y-6">
      {/* 待定决策：3 类标签（方案 / 报价单 / 结算） */}
      <section aria-live="polite">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="w-1 h-4 rounded-full bg-[#EF6B00] shrink-0" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-900">待定决策</h2>
        </div>
        {pendingCount > 0 ? (
          <p className="text-xs text-gray-500 -mt-2 mb-3 leading-relaxed">
            方案：走完全部反馈页并提交后完成。报价单（订购/交付）：在报价单页<strong>签字确认</strong>或<strong>提交调整反馈</strong>后即完成。结算：在结算单页签字或反馈后即完成。
          </p>
        ) : null}
        {pendingCount > 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <nav
              className="flex overflow-x-auto scrollbar-thin border-b border-gray-100 bg-gray-50/80 px-1 sm:px-2"
              aria-label="待定决策类型"
            >
              {PENDING_DECISION_TABS.map(({ kind, label, description }) => {
                const n = pendingByKind[kind].length
                const active = pendingTab === kind
                return (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => setPendingTab(kind)}
                    title={description}
                    className={`relative shrink-0 flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                      active
                        ? 'border-[#EF6B00] text-gray-900 bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-white/60'
                    }`}
                  >
                    <span>{label}</span>
                    {n > 0 ? (
                      <span className="inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white tabular-nums">
                        {n > 99 ? '99+' : n}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-gray-300 tabular-nums">0</span>
                    )}
                  </button>
                )
              })}
            </nav>
            <div className="p-4 sm:p-6">
              <p className="text-xs text-gray-500 mb-4">
                {PENDING_DECISION_TABS.find((t) => t.kind === pendingTab)?.description}
              </p>
              {tabItems.length > 0 ? (
                <div className="space-y-3">
                  {tabItems.map((item) => (
                    <div
                      key={item.key}
                      className="rounded-2xl border border-gray-100 bg-gray-50/40 p-5 sm:p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-[#FF9C3E]/10 flex items-center justify-center text-[#FF9C3E] shrink-0">
                            <Wrench size={18} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-[#C87800] bg-[#FF9C3E]/10 px-2 py-0.5 rounded-full">
                              {item.badgeLabel}
                            </span>
                            <div className="text-base font-semibold text-gray-900 mt-2">{item.title}</div>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onPendingDecisionItemAction?.(item)}
                          className="md:w-[200px] w-full shrink-0 inline-flex items-center justify-center rounded-2xl bg-[#FF9C3E] text-white font-semibold py-3 hover:brightness-95 active:scale-[0.99] transition"
                        >
                          {item.action === 'feedback'
                            ? '去反馈'
                            : item.action === 'quotation'
                              ? '去报价单'
                              : item.action === 'settlement'
                                ? '去结算单'
                                : '去处理'}
                          <ChevronRight size={18} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-12 text-center text-sm text-gray-500">
                  该类型当前暂无待处理事项，可切换其他标签查看
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 py-10 text-center text-sm text-gray-500">
            当前暂无待处理事项
          </div>
        )}
      </section>

      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
        <h2 className="text-lg font-semibold">订单方案</h2>
      </div>

      {/* 呈现方式：低调文案切换 */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100">
        <nav className="flex gap-6" aria-label="订单方案呈现方式">
          <button
            type="button"
            onClick={() => setOrderPresentationPage(0)}
            className={`pb-2.5 text-sm transition-colors border-b-2 -mb-px ${
              orderPresentationPage === 0
                ? 'border-gray-800 text-gray-900 font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            预算树（桑基图）
          </button>
          <button
            type="button"
            onClick={() => setOrderPresentationPage(1)}
            className={`pb-2.5 text-sm transition-colors border-b-2 -mb-px ${
              orderPresentationPage === 1
                ? 'border-gray-800 text-gray-900 font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            订单列表
          </button>
        </nav>
        {orderPresentationPage === 1 ? (
          <span className="pb-2 text-xs text-gray-400 hidden sm:inline">支持搜索与阶段筛选</span>
        ) : (
          <span className="pb-2 text-xs text-gray-400 hidden sm:inline">展示全部订单</span>
        )}
      </div>

      {orderPresentationPage === 0 ? (
        orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-200/80 bg-amber-50/30 py-14 px-6 text-center space-y-4">
            <p className="text-sm font-medium text-gray-800">暂无订单数据</p>
            <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              方案确认并签约下单后，订单与预算树将在此同步。请先完善需求信息，或联系项目顾问推进方案与报价。
            </p>
            {deepEvalPath ? (
              <button
                type="button"
                onClick={() => navigateOrders(deepEvalPath)}
                className="inline-flex items-center justify-center rounded-2xl bg-[#EF6B00] text-white text-sm font-semibold px-5 py-2.5 hover:brightness-95"
              >
                去深度测评
              </button>
            ) : null}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden max-h-[min(72vh,1200px)] overflow-y-auto">
            {sankeyData ? (
              <BudgetSankeyWorkbench
                data={sankeyData}
                title="订单预算树"
                subtitle={`共 ${orders.length} 笔订单 · 金额由列表展示换算为万元`}
              />
            ) : null}
          </div>
        )
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-200/80 bg-amber-50/30 py-14 px-6 text-center space-y-4">
          <p className="text-sm font-medium text-gray-800">暂无订单数据</p>
          <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            方案确认并签约下单后，订单列表将在此展示。可先完善需求或联系顾问推进报价与下单。
          </p>
          {deepEvalPath ? (
            <button
              type="button"
              onClick={() => navigateOrders(deepEvalPath)}
              className="inline-flex items-center justify-center rounded-2xl bg-[#EF6B00] text-white text-sm font-semibold px-5 py-2.5 hover:brightness-95"
            >
              去深度测评
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {/* 列表页：搜索与阶段筛选 */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索订单标题、订单编号"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF9C3E]/20 focus:border-[#FF9C3E]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">阶段筛选:</span>
              {PHASES.map((phase) => (
                <button
                  key={phase.id}
                  type="button"
                  onClick={() => togglePhase(phase.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedPhases.includes(phase.id)
                      ? `${STATUS_BADGE_COLORS[phase.id as keyof typeof STATUS_BADGE_COLORS]} border-current`
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {phase.label}
                </button>
              ))}
              {selectedPhases.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedPhases([])}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 ml-2"
                >
                  清除全部
                </button>
              )}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 text-center text-sm text-gray-500">
              当前筛选下暂无订单，请调整搜索或阶段筛选
            </div>
          ) : (
            <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => onSelectOrder?.(order.id)}
              className="bg-white border border-gray-100 rounded-2xl flex gap-4 py-5 px-4 hover:border-gray-200 hover:shadow-sm transition-all group cursor-pointer"
            >
              <div className={`w-1 rounded-full shrink-0 self-stretch min-h-[60px] ${STATUS_BAR_COLORS[getOrderStatusColor(order.status)]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium mb-1.5 border ${STATUS_BADGE_COLORS[getOrderStatusColor(order.status)]}`}
                    >
                      {order.status}
                    </span>
                    <div className="font-semibold text-gray-900 truncate">
                      {order.id} · {order.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div className="text-base font-semibold text-gray-900">{order.amount}</div>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
