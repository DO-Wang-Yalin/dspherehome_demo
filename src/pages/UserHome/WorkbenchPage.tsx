import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  FileText,
  PieChart,
  ShoppingCart,
  ScrollText,
  Settings,
  ArrowLeftRight,
} from 'lucide-react'
import { INITIAL_ORDERS } from '../../data/mockOrders'
import { useGlobal } from '../../context/GlobalContext'
import { LONGHU_JINGCHENFU_DEMO_LEAD_ID } from '../../services/leads/savedLeadsStorage'
import {
  computePendingDecisionsFromOrders,
  type PendingDecisionItem,
} from '../../utils/pendingDecisionsFromOrders'
import {
  getResolvedPendingKeys,
  PENDING_RESOLVED_EVENT,
  addResolvedPendingKey,
} from '../../utils/pendingDecisionResolvedStorage'
import { RequirementsDoc } from './workbench/RequirementsDoc'
import { OrderManagementSection } from './workbench/WorkbenchOrderManagementSection'
import { WorkbenchBudgetSection } from './workbench/WorkbenchBudgetSection'
import { ContractsSection } from './workbench/WorkbenchContractsSection'
import { ComingSoon } from './workbench/WorkbenchComingSoon'
import { DreamOneLogo } from '../../components/DreamOneLogo'

type NavKey = 'requirements' | 'budget' | 'orders' | 'contracts'

export interface WorkbenchPageProps {
  userDisplayName?: string
  projectName?: string
  contractAccepted?: boolean
  contractSignatureData?: string
  contractCustomText?: string
  /** 工作台侧栏初始页；`home` / `designFeedback` 会视为 `orders` */
  initialTab?: NavKey | 'home' | 'designFeedback'
  onExit?: () => void
  onGoToContract?: () => void
  /** 返回项目列表（从项目页进入工作台时使用） */
  onBackToProjects?: () => void
  onViewOrderDetail?: (orderId: string) => void
}

const LEGACY_PENDING_DISMISSED = 'workbench:pendingDismissed:v2'

export function WorkbenchPage({
  userDisplayName,
  projectName,
  contractAccepted,
  contractSignatureData,
  contractCustomText,
  initialTab,
  onExit,
  onGoToContract,
  onBackToProjects,
  onViewOrderDetail: _onViewOrderDetail,
}: WorkbenchPageProps) {
  const { data, updateData, activeProjectLeadId } = useGlobal()

  /** 仅龙湖璟宸府演示项目在订单为空时回填演示订单；其他项目保持空列表以引导补充/签约下单 */
  React.useEffect(() => {
    if (
      activeProjectLeadId === LONGHU_JINGCHENFU_DEMO_LEAD_ID &&
      (!data.orders || data.orders.length === 0)
    ) {
      updateData({ orders: [...INITIAL_ORDERS] })
    }
  }, [activeProjectLeadId, data.orders?.length, updateData])

  const ordersToDisplay =
    activeProjectLeadId === LONGHU_JINGCHENFU_DEMO_LEAD_ID
      ? data.orders && data.orders.length > 0
        ? data.orders
        : INITIAL_ORDERS
      : activeProjectLeadId
        ? data.orders ?? []
        : []

  const [pendingResolvedVersion, setPendingResolvedVersion] = React.useState(0)
  React.useEffect(() => {
    const fn = () => setPendingResolvedVersion((v) => v + 1)
    window.addEventListener(PENDING_RESOLVED_EVENT, fn)
    return () => window.removeEventListener(PENDING_RESOLVED_EVENT, fn)
  }, [])

  React.useEffect(() => {
    if (activeProjectLeadId !== LONGHU_JINGCHENFU_DEMO_LEAD_ID) return
    try {
      const raw = localStorage.getItem(`${LEGACY_PENDING_DISMISSED}:${activeProjectLeadId}`)
      if (!raw) return
      const arr = JSON.parse(raw) as string[]
      if (Array.isArray(arr)) {
        for (const k of arr) addResolvedPendingKey(activeProjectLeadId, k)
      }
      localStorage.removeItem(`${LEGACY_PENDING_DISMISSED}:${activeProjectLeadId}`)
    } catch {
      /* ignore */
    }
  }, [activeProjectLeadId])

  const effectiveResolvedPendingKeys = React.useMemo(
    () => getResolvedPendingKeys(activeProjectLeadId),
    [activeProjectLeadId, pendingResolvedVersion],
  )

  const sidebarPendingDecisionCount = React.useMemo(() => {
    if (activeProjectLeadId !== LONGHU_JINGCHENFU_DEMO_LEAD_ID) return 0
    return computePendingDecisionsFromOrders(ordersToDisplay, effectiveResolvedPendingKeys).length
  }, [activeProjectLeadId, ordersToDisplay, effectiveResolvedPendingKeys])

  const navigate = useNavigate()
  const normalizeWorkbenchTab = (t?: NavKey | 'home' | 'designFeedback'): NavKey => {
    if (!t || t === 'home' || t === 'designFeedback') return 'orders'
    return t
  }
  const [active, setActive] = React.useState<NavKey>(() => normalizeWorkbenchTab(initialTab))
  React.useEffect(() => {
    if (initialTab !== undefined) setActive(normalizeWorkbenchTab(initialTab))
  }, [initialTab])

  const mainScrollRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [active])

  const projectBudgetRaw = data.projectBudget
  const budgetStatus = React.useMemo(() => {
    const status = projectBudgetRaw?.status ?? 'unconfirmed'
    const confirmedAt = projectBudgetRaw?.confirmedAt
    const adjustmentHistory = projectBudgetRaw?.adjustmentHistory ?? []

    if (status === 'confirmed' && confirmedAt && adjustmentHistory.length > 0) {
      const confirmedMs = new Date(confirmedAt).getTime()
      const hasNewerAdjustment = adjustmentHistory.some(
        (h) => new Date(h.at).getTime() > confirmedMs,
      )
      if (hasNewerAdjustment) {
        return { status: 'unconfirmed' as const, confirmedAt, adjustmentHistory }
      }
    }

    return { status, confirmedAt, adjustmentHistory }
  }, [projectBudgetRaw])

  const isBudgetConfirmed = budgetStatus.status === 'confirmed'
  const SIDEBAR_WIDTH_KEY = 'ai-studio:workbench:sidebarWidth:v1'
  const SIDEBAR_COLLAPSED_KEY = 'ai-studio:workbench:sidebarCollapsed:v1'
  const MIN_SIDEBAR_WIDTH = 220
  const MAX_SIDEBAR_WIDTH = 360
  const COLLAPSE_THRESHOLD = 120

  const [sidebarWidth, setSidebarWidth] = React.useState<number>(() => {
    try {
      const raw = localStorage.getItem(SIDEBAR_WIDTH_KEY)
      const n = raw ? Number(raw) : 264
      if (!Number.isFinite(n)) return 264
      return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, n))
    } catch {
      return 264
    }
  })
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })

  React.useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth))
    } catch {
      // ignore
    }
  }, [sidebarWidth])

  React.useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? '1' : '0')
    } catch {
      // ignore
    }
  }, [sidebarCollapsed])

  const displayName = userDisplayName?.trim() || '张雅雯'
  const currentProjectName =
    projectName?.trim() ||
    (activeProjectLeadId === LONGHU_JINGCHENFU_DEMO_LEAD_ID ? '龙湖璟宸府' : '当前项目')
  const hasSignedContract = !!contractAccepted && !!contractSignatureData

  const navItems: Array<{ key: NavKey; label: string; icon: React.ElementType }> = [
    { key: 'contracts', label: '项目协议', icon: ScrollText },
    { key: 'requirements', label: '用户需求', icon: FileText },
    { key: 'budget', label: '预算资金', icon: PieChart },
    { key: 'orders', label: '订单方案', icon: ShoppingCart },
  ]

  const activeLabel = navItems.find((n) => n.key === active)?.label || '订单方案'

  const startResize = (e: React.MouseEvent) => {
    if (sidebarCollapsed) return
    e.preventDefault()
    const startX = e.clientX
    const startWidth = sidebarWidth
    const onMove = (ev: MouseEvent) => {
      const next = startWidth + (ev.clientX - startX)
      if (next < COLLAPSE_THRESHOLD) {
        setSidebarCollapsed(true)
      } else {
        setSidebarWidth(Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, next)))
      }
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div className="h-[100dvh] min-h-0 bg-[#FFFDF3] text-gray-900 font-sans flex overflow-hidden motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
      {/* Sidebar */}
      <aside
        className="hidden md:flex shrink-0 flex-col bg-white border-r border-gray-100 py-6 relative h-full min-h-0 overflow-y-auto"
        style={{ width: sidebarCollapsed ? 80 : sidebarWidth }}
      >
        <div className="px-5 min-w-0">
          <button
            type="button"
            onClick={onExit}
            className="w-full flex items-center justify-start min-w-0 px-2 text-left rounded-2xl hover:bg-black/5 transition-colors py-2 -my-2"
          >
            <span className="flex w-full min-w-0 items-center justify-center py-0.5">
              <DreamOneLogo
                trimExcessCanvas
                wrapperClassName={
                  sidebarCollapsed
                    ? 'h-9 w-[72px] shrink-0 sm:h-10'
                    : 'h-10 w-full max-w-[min(100%,268px)] sm:h-11'
                }
                className="h-full w-full"
                alt="DREAM.ONE"
              />
            </span>
          </button>
        </div>

        <nav className="mt-6 space-y-1 px-5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.key
            const showPendingBadge =
              item.key === 'orders' && sidebarPendingDecisionCount > 0
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(item.key)}
                className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm transition-colors transition-transform active:scale-[0.99] ${
                  isActive ? 'bg-[#FF9C3E]/10 text-gray-900' : 'text-gray-600 hover:bg-black/5'
                }`}
                title={
                  sidebarCollapsed
                    ? showPendingBadge
                      ? `${item.label}（${sidebarPendingDecisionCount} 项待定决策）`
                      : item.label
                    : undefined
                }
              >
                <span className="relative shrink-0">
                  <Icon size={18} className={isActive ? 'text-[#FF9C3E]' : 'text-gray-400'} />
                  {showPendingBadge && sidebarCollapsed ? (
                    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white">
                      {sidebarPendingDecisionCount > 9 ? '9+' : sidebarPendingDecisionCount}
                    </span>
                  ) : null}
                </span>
                {!sidebarCollapsed && (
                  <span className="flex min-w-0 flex-1 items-center justify-between gap-2 font-medium">
                    <span className="truncate">{item.label}</span>
                    {showPendingBadge ? (
                      <span
                        className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white tabular-nums"
                        aria-label={`${sidebarPendingDecisionCount} 项待定决策`}
                      >
                        {sidebarPendingDecisionCount > 99 ? '99+' : sidebarPendingDecisionCount}
                      </span>
                    ) : null}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto pt-6 px-5">
          <button
            type="button"
            onClick={onExit}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm text-gray-600 hover:bg-black/5 transition-colors"
            title={sidebarCollapsed ? '设置' : undefined}
          >
            <Settings size={18} className="text-gray-400" />
            {!sidebarCollapsed && <span className="font-medium">设置</span>}
          </button>
        </div>

        {/* 展开时：拖拽调整宽度，拖到很窄即收起；收起时：右侧条悬停浮窗提示「展开导航」，点击或拖右展开 */}
        {sidebarCollapsed ? (
          <div
            className="absolute top-0 right-0 h-full w-3 cursor-pointer group/expand flex items-center justify-center hover:bg-black/5 transition-colors"
            onClick={() => setSidebarCollapsed(false)}
            role="button"
            tabIndex={0}
            aria-label="展开导航"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setSidebarCollapsed(false)
              }
            }}
          >
            <span className="absolute right-full mr-2 px-2 py-1 text-[11px] font-medium text-white bg-slate-700/90 rounded-md whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover/expand:opacity-100 group-focus-visible/expand:opacity-100 z-50 shadow-sm">
              展开导航
            </span>
          </div>
        ) : (
          <div
            onMouseDown={startResize}
            className="absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-[#FF9C3E]/10 transition-colors"
            title="拖拽调整宽度"
          />
        )}
      </aside>

      {/* Main：仅内容区滚动，侧栏与顶栏固定于视口内 */}
      <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="shrink-0 w-full px-5 md:px-10 py-6 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="group/tooltip relative">
                <button
                  type="button"
                  onClick={onExit}
                  className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center shrink-0 hover:bg-[#FF9C3E]/15 transition"
                  title="返回欢迎页"
                  aria-label="返回欢迎页"
                >
                  <Home size={18} />
                </button>
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1 text-xs font-medium text-white bg-slate-800 rounded-lg whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 z-50">
                  返回欢迎页
                </span>
              </div>
              <div className="min-w-0 flex items-center gap-2">
                <div className="min-w-0">
                  <div className="text-xs text-gray-500">当前项目</div>
                  <div className="text-base font-semibold truncate">{currentProjectName}</div>
                </div>
                {onBackToProjects && (
                  <div className="group/tooltip relative shrink-0">
                    <button
                      type="button"
                      onClick={onBackToProjects}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                      title="切换项目"
                      aria-label="切换项目"
                    >
                      <ArrowLeftRight size={18} />
                    </button>
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1 text-xs font-medium text-white bg-slate-800 rounded-lg whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 z-50">
                      切换项目
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-2xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-[#FF9C3E]/10 flex items-center justify-center text-[#C87800] font-semibold">
                  {displayName.slice(0, 1)}
                </span>
                <span className="font-medium">{displayName}</span>
              </button>
            </div>
          </div>
        </div>

        <div
          ref={mainScrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain"
        >
          <div className="px-5 md:px-10 py-8">
            <div className="max-w-6xl mx-auto">
            <div
              key={active}
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-300"
            >
              {active === 'requirements' ? (
                <RequirementsDoc
                  data={data}
                  updateData={updateData}
                  projectName={currentProjectName}
                  ownerDisplayName={displayName}
                  onBackHome={() => setActive('orders')}
                  onGoToStyleEval={() => navigate('/style-eval?from=requirements')}
                  supplementDeepEvalPath={
                    activeProjectLeadId &&
                    activeProjectLeadId !== LONGHU_JINGCHENFU_DEMO_LEAD_ID
                      ? `/deep-eval?leadId=${encodeURIComponent(activeProjectLeadId)}`
                      : undefined
                  }
                />
              ) : active === 'orders' ? (
                <OrderManagementSection
                  orders={ordersToDisplay}
                  effectiveResolvedPendingKeys={effectiveResolvedPendingKeys}
                  isDemoLonghuProject={activeProjectLeadId === LONGHU_JINGCHENFU_DEMO_LEAD_ID}
                  deepEvalPath={
                    activeProjectLeadId &&
                    activeProjectLeadId !== LONGHU_JINGCHENFU_DEMO_LEAD_ID
                      ? `/deep-eval?leadId=${encodeURIComponent(activeProjectLeadId)}`
                      : undefined
                  }
                  onSelectOrder={(id) => navigate(`/order/${id}`)}
                  onPendingDecisionItemAction={(item: PendingDecisionItem) => {
                    const orderTitle =
                      ordersToDisplay.find((o: { id: string }) => o.id === item.orderId)?.title ?? ''
                    if (item.action === 'feedback') {
                      navigate('/feedback', {
                        state: {
                          orderNumber: item.orderId,
                          openViewerDirectly: true,
                          fromPendingDecision: true,
                          pendingItemKeyOnReturnHome: item.key.endsWith('-scheme-s01')
                            ? item.key
                            : undefined,
                        },
                      })
                    } else if (item.action === 'quotation') {
                      const ver = item.quotationVer ?? 'V2'
                      navigate(`/quotation/${encodeURIComponent(item.orderId)}/${ver}`, {
                        state: {
                          orderTitle,
                          quotationTitle:
                            item.quotationVer === 'V3' ? '交付报价单' : '订购报价单',
                          pendingResolveKey: item.key,
                        },
                      })
                    } else if (item.action === 'settlement') {
                      navigate(`/settlement/${encodeURIComponent(item.orderId)}`, {
                        state: {
                          orderNumber: item.orderId,
                          orderTitle,
                          settlementTitle: 'EPC 项目最终结算单',
                          pendingResolveKey: item.key,
                        },
                      })
                    } else {
                      navigate(`/order/${item.orderId}`, {
                        state: { acknowledgePendingKey: item.key },
                      })
                    }
                  }}
                />
              ) : active === 'budget' ? (
                <WorkbenchBudgetSection
                  isBudgetConfirmed={isBudgetConfirmed}
                  confirmedAt={budgetStatus.confirmedAt}
                />
              ) : active === 'contracts' ? (
                <ContractsSection
                  projectName={currentProjectName}
                  hasSigned={hasSignedContract}
                  signatureData={contractSignatureData}
                  customText={contractCustomText}
                  onGoToContractStep={onGoToContract}
                />
              ) : (
                <ComingSoon title={activeLabel} onBackHome={() => setActive('orders')} />
              )}
            </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
