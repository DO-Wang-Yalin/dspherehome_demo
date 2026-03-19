import React from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import type { RequirementsMember, MemberSpaceItem, RequirementDocRevisionEntry } from '../../types'
import { initialFormData } from '../../types'
import { buildRevisionSnapshotFormData, parseDocSnapshotJson } from '../../utils/requirementDocRevisionSnapshot'
import {
  Home,
  FileText,
  PieChart,
  ShoppingCart,
  ScrollText,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  History,
  Wrench,
  BarChart3,
  Package,
  Construction,
  Cpu,
  LayoutGrid,
  Users,
  Sparkles,
  ListChecks,
  Sofa,
  BedDouble,
  ChefHat,
  Bath,
  Sun,
  Wind,
  Ruler,
  Volume2,
  Upload,
  Image as ImageIcon,
  Video,
  Thermometer,
  AirVent,
  Wifi,
  Lightbulb,
  ShieldCheck,
  Blinds,
  Mic,
  Music,
  Zap,
  Lock,
  Waves,
  Trash2,
  Flame,
  Bot,
  Utensils,
  Archive,
  Compass,
  ArrowLeftRight,
  Search,
  Hourglass,
  Copy,
  Plus,
  Eye,
} from 'lucide-react'
/** 可添加的空间类型选项（下拉选择，与核心空间及常见扩展一致） */
const ADDABLE_SPACE_TYPE_OPTIONS = [
  '客厅', '餐厅', '开放厨房', '封闭厨房', '主卧室', '次卧室', '小孩卧室', '老人卧室', '主卫浴室', '公卫浴室', '次卫浴室', '书房', '花园',
  '衣帽间', '玄关', '阳台', '储物间', '健身区', '影音室', '保姆间', '家政间', '洗衣房',
]

/** 核心空间「添加空间类型」一行：下拉选项 + 添加按钮 */
function AddSpaceTypeRow({ onAdd, existingNames }: { onAdd: (name: string) => void; existingNames: string[] }) {
  const available = ADDABLE_SPACE_TYPE_OPTIONS.filter((o) => !existingNames.includes(o))
  const [value, setValue] = React.useState('')
  const handleAdd = () => {
    if (!value || existingNames.includes(value)) return
    onAdd(value)
    setValue('')
  }
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm min-w-[140px]"
      >
        <option value="">选择要添加的空间类型</option>
        {available.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <button type="button" onClick={handleAdd} disabled={!value} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-[#FFFDF3] hover:border-[#FF9C3E]/30 transition-colors disabled:opacity-50 disabled:pointer-events-none">
        <Plus size={14} /> 添加空间类型
      </button>
    </div>
  )
}
import BudgetSankey from '../../components/BudgetSankey'
import { BudgetConfirmPanel } from '../../components/BudgetConfirmPanel'
import { buildBudgetSankeyFromDisplayOrders } from '../../utils/ordersToBudgetSankey'
import { ContractDetailModal } from '../../components/ContractDetailModal'
import { getPaymentAccountCopyText } from '../../constants/contract'

const LOGO_SRC = '/img/logo.png'

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

import { getOrderStatusColor, STATUS_BAR_COLORS, STATUS_BADGE_COLORS } from '../../utils/orderStatus'
import { INITIAL_ORDERS } from '../../data/mockOrders'
import { useGlobal } from '../../context/GlobalContext'
import { LONGHU_JINGCHENFU_DEMO_LEAD_ID } from '../../services/leads/savedLeadsStorage'
import { getLonghuJingchenfuFullFormData } from '../../services/leads/longhuJingchenfuDemo'
import {
  computePendingDecisionsFromOrders,
  type PendingDecisionItem,
  type PendingDecisionKind,
} from '../../utils/pendingDecisionsFromOrders'
import {
  getResolvedPendingKeys,
  PENDING_RESOLVED_EVENT,
  addResolvedPendingKey,
} from '../../utils/pendingDecisionResolvedStorage'

const LEGACY_PENDING_DISMISSED = 'workbench:pendingDismissed:v2'

const PENDING_DECISION_TABS: {
  kind: PendingDecisionKind
  label: string
  description: string
}[] = [
  { kind: 'scheme_feedback', label: '方案待反馈', description: '走完全部反馈页并提交后自动完成' },
  { kind: 'quotation_pending', label: '报价待确认', description: '订购/交付报价单：签字确认或提交调整反馈后即完成' },
  { kind: 'settlement_confirm', label: '结算待确认', description: '结算单签字确认或意见反馈后即完成' },
]

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
  onViewOrderDetail,
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
    <div className="min-h-screen bg-[#FFFDF3] text-gray-900 font-sans flex motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500">
      {/* Sidebar */}
      <aside
        className="hidden md:flex shrink-0 flex-col bg-white border-r border-gray-100 py-6 relative"
        style={{ width: sidebarCollapsed ? 80 : sidebarWidth }}
      >
        <div className="px-5 min-w-0">
          <button
            type="button"
            onClick={onExit}
            className="w-full flex items-center justify-start min-w-0 px-2 text-left rounded-2xl hover:bg-black/5 transition-colors py-2 -my-2"
          >
            <span className="h-8 w-full min-w-0 overflow-hidden flex items-center">
              <img
                src={LOGO_SRC}
                alt="DREAM.ONE"
                className="w-full h-auto min-h-full object-contain object-center"
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

      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="w-full px-5 md:px-10 py-6 bg-white border-b border-gray-100">
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
                      navigate('/quotation', {
                        state: {
                          orderNumber: item.orderId,
                          orderTitle,
                          ver: item.quotationVer ?? 'V2',
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
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-1 h-4 rounded-full bg-[#EF6B00] shrink-0" aria-hidden />
                      <h2 className="text-lg font-semibold text-gray-900">预算资金</h2>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border shrink-0 ${
                        isBudgetConfirmed
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {isBudgetConfirmed ? '已确认' : '未确认'}
                    </span>
                    {isBudgetConfirmed && budgetStatus.confirmedAt ? (
                      <span className="text-xs text-gray-400 w-full sm:w-auto sm:ml-0">
                        确认于 {new Date(budgetStatus.confirmedAt).toLocaleString('zh-CN')}
                      </span>
                    ) : null}
                  </div>
                  <BudgetConfirmPanel />
                </div>
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
      </main>
    </div>
  )
}


function OrderManagementSection({
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
                去深度测评补充需求
              </button>
            ) : null}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 shadow-sm overflow-hidden max-h-[min(72vh,1200px)] overflow-y-auto">
            {sankeyData ? (
              <BudgetSankey
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
              去深度测评补充需求
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

function FeatureCard({
  icon,
  title,
  desc,
  action,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  action: string
  onClick?: () => void
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 flex flex-col">
      <div className="w-12 h-12 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed flex-1">{desc}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#FF9C3E] hover:underline underline-offset-4"
      >
        {action}
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

function ComingSoon({ title, onBackHome }: { title: string; onBackHome: () => void }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-10 md:p-14">
      <div className="max-w-md mx-auto text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
          <Construction size={22} />
        </div>
        <h2 className="mt-5 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">功能开发中，敬请期待；你可以先返回「订单方案」查看订单与待定决策事项。</p>
        <button
          type="button"
          onClick={onBackHome}
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#FF9C3E] text-white font-semibold px-6 py-3 hover:brightness-95 active:scale-[0.99] transition"
        >
          返回订单方案
          <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  )
}

function ContractsSection({
  projectName,
  hasSigned,
  signatureData,
  customText,
  onGoToContractStep,
}: {
  projectName: string
  hasSigned: boolean
  signatureData?: string
  customText?: string
  onGoToContractStep?: () => void
}) {
  const [showDetailModal, setShowDetailModal] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(getPaymentAccountCopyText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
          <h2 className="text-lg font-semibold">项目协议</h2>
        </div>
        <button
          type="button"
          onClick={handleCopyAccount}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Copy size={16} />
          {copied ? '已复制' : '一键复制账户信息'}
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="min-w-0 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FF9C3E]/10 px-3 py-1">
            <ScrollText size={14} className="text-[#FF9C3E]" />
            <span className="text-xs font-semibold text-[#C87800]">项目服务框架协议</span>
          </div>
          <div className="text-base md:text-lg font-semibold text-gray-900 truncate">
            {projectName || '当前项目'} · 意向金服务合同
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                hasSigned
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {hasSigned ? '已签署' : '待签署'}
            </span>
            <span className="text-gray-500">
              {customText
                ? customText
                : hasSigned
                  ? '您已在注册流程中完成本合同的电子签署，本页展示的是您的签署记录示意。'
                  : '完成注册意向金流程并签署合同后，本页将展示您的签署记录。'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="relative w-32 h-24 md:w-40 md:h-28 rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] flex items-center justify-center overflow-hidden">
            <div className="w-[85%] h-[80%] border border-gray-200 rounded-xl bg-white shadow-[0_6px_18px_rgba(0,0,0,0.04)] flex items-center justify-center">
              <span className="text-[11px] text-gray-500">合同正文</span>
            </div>
            {hasSigned && signatureData && (
              <div className="absolute -bottom-3 -right-2">
                <div className="w-16 h-16 rounded-full border-2 border-[#EF6B00]/80 bg-[#FFF4E0] flex items-center justify-center rotate-[-15deg] shadow-sm">
                  <img
                    src={signatureData}
                    alt="签名印记"
                    className="w-12 h-12 object-contain opacity-95"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowDetailModal(true)}
            className="md:w-[180px] w-full inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            查看合同详情
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
      <ContractDetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        signatureData={signatureData}
        hasSigned={hasSigned}
        onGoToSign={onGoToContractStep}
      />
    </div>
  )
}

type RequirementDocPayloadShape = {
  // 项目概览（含项目现状 Q2-5）
  projectLocation?: string
  projectType?: string
  projectArea?: string
  budgetStandard?: string
  timeline?: string
  houseUsage?: string
  lighting?: string
  ceilingHeight?: string
  ventilation?: string
  noise?: string

  smartHomeOptions?: string[]
  devices?: string[]
  otherNeeds?: string
  comfortSystems?: string[]
  fengshui?: string
  storageFocus?: string[]
  spaceOtherNote?: string
  livingRoomNote?: string
  diningNote?: string
  kitchenNote?: string
  bathroomNote?: string
  coreSpaces?: string
  customCoreSpaceOptions?: string[]
  childGrowth?: string
  guestStay?: string
  futureChanges?: string
  requirementsMembers?: RequirementsMember[]
  floorPlanImages?: Array<{ name: string; url: string }>
  siteMedia?: Array<{ name: string; url: string; kind?: string }>
  customSpaceItems?: Array<{ name: string; description?: string }>
}

function fingerprintRequirementDocPayload(p: RequirementDocPayloadShape): Record<string, string> {
  const trim = (x?: string) => String(x ?? '').trim()
  return {
    projectOverview: [
      trim(p.projectLocation),
      trim(p.projectType),
      trim(p.projectArea),
      trim(p.budgetStandard),
      trim(p.timeline),
      trim(p.houseUsage),
      trim(p.lighting),
      trim(p.ceilingHeight),
      trim(p.ventilation),
      trim(p.noise),
    ].join('\u0001'),
    spacePlanning: [
      trim(p.coreSpaces),
      JSON.stringify([...(p.customCoreSpaceOptions ?? [])].map((s) => String(s ?? '').trim()).sort()),
      trim(p.childGrowth),
      trim(p.guestStay),
      trim(p.futureChanges),
    ].join('\u0002'),
    smartHome: [...(p.smartHomeOptions ?? [])].sort().join('\u0001'),
    devices: [...(p.devices ?? [])].sort().join('\u0001'),
    otherNeeds: p.otherNeeds ?? '',
    comfort: [...(p.comfortSystems ?? [])].sort().join('\u0001'),
    fengshui: p.fengshui ?? '',
    storage: JSON.stringify([...(p.storageFocus ?? [])].sort()),
    spaceOther: p.spaceOtherNote ?? '',
    living: p.livingRoomNote ?? '',
    dining: p.diningNote ?? '',
    kitchen: p.kitchenNote ?? '',
    bath: p.bathroomNote ?? '',
    coreSpaces: p.coreSpaces ?? '',
    customCore: JSON.stringify([...(p.customCoreSpaceOptions ?? [])].sort()),
    child: p.childGrowth ?? '',
    guest: p.guestStay ?? '',
    future: p.futureChanges ?? '',
    members: JSON.stringify(
      (p.requirementsMembers ?? []).map((m) => ({
        id: m.id,
        n: m.name,
        age: m.age ?? '',
        prof: m.profession ?? '',
        o: m.otherActivityNote ?? '',
        sp: (m.spaces ?? []).map((s) => ({ n: s.name, d: s.description ?? '' })),
      })),
    ),
    fpMeta: `${(p.floorPlanImages ?? []).length}\u0002${[...(p.floorPlanImages ?? []).map((x) => x.name)].sort().join('\u0001')}`,
    smMeta: `${(p.siteMedia ?? []).length}\u0002${[...(p.siteMedia ?? []).map((x) => x.name)].sort().join('\u0001')}`,
    customSpaces: JSON.stringify(
      (p.customSpaceItems ?? []).map((x) => ({ n: x.name, d: x.description ?? '' })),
    ),
  }
}

const REQUIREMENT_DOC_FINGERPRINT_LABELS: Record<string, string> = {
  projectOverview: '项目概览',
  spacePlanning: '空间规划',
  smartHome: '智能家居',
  devices: '全屋设备',
  otherNeeds: '其他需求说明',
  comfort: '系统设备',
  fengshui: '风水与禁忌',
  storage: '收纳重点',
  spaceOther: '空间其他说明',
  living: '客厅需求',
  dining: '餐厅需求',
  kitchen: '厨房需求',
  bath: '卫生间需求',
  coreSpaces: '核心空间配置',
  customCore: '自定义核心空间',
  child: '儿童成长',
  guest: '访客留宿',
  future: '未来变动',
  members: '成员画像',
  fpMeta: '户型图',
  smMeta: '现场照片/视频',
  customSpaces: '自定义空间需求',
}

function diffRequirementDocFingerprints(
  before: Record<string, string> | null,
  after: Record<string, string>,
): string[] {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after)])
  const out: string[] = []
  for (const k of keys) {
    if ((before?.[k] ?? '') !== (after[k] ?? '')) {
      const lb = REQUIREMENT_DOC_FINGERPRINT_LABELS[k]
      if (lb) out.push(lb)
    }
  }
  return out
}

/** 字段级/逐项比较：判断两个 payload 在指定模块下是否有差异（用于决定是否展示该模块卡片） */
function payloadModuleHasChange(
  label: string,
  before: RequirementDocPayloadShape | null,
  after: RequirementDocPayloadShape,
): boolean {
  const b = before
  const a = after

  const listEqual = (x?: string[], y?: string[]) => {
    const nx = [...(x ?? [])].map((s) => String(s ?? '').trim()).sort()
    const ny = [...(y ?? [])].map((s) => String(s ?? '').trim()).sort()
    return JSON.stringify(nx) === JSON.stringify(ny)
  }

  const strEqual = (x?: string, y?: string) => String(x ?? '').trim() === String(y ?? '').trim()

  switch (label) {
    case '项目概览':
      return (
        !strEqual(b?.projectLocation, a.projectLocation) ||
        !strEqual(b?.projectType, a.projectType) ||
        !strEqual(b?.projectArea, a.projectArea) ||
        !strEqual(b?.budgetStandard, a.budgetStandard) ||
        !strEqual(b?.timeline, a.timeline) ||
        !strEqual(b?.houseUsage, a.houseUsage) ||
        !strEqual(b?.lighting, a.lighting) ||
        !strEqual(b?.ceilingHeight, a.ceilingHeight) ||
        !strEqual(b?.ventilation, a.ventilation) ||
        !strEqual(b?.noise, a.noise)
      )

    case '空间规划':
      return (
        !strEqual(b?.coreSpaces, a.coreSpaces) ||
        !listEqual(b?.customCoreSpaceOptions, a.customCoreSpaceOptions) ||
        !strEqual(b?.childGrowth, a.childGrowth) ||
        !strEqual(b?.guestStay, a.guestStay) ||
        !strEqual(b?.futureChanges, a.futureChanges)
      )

    case '智能家居':
      return !listEqual(b?.smartHomeOptions, a.smartHomeOptions)
    case '全屋设备':
      return !listEqual(b?.devices, a.devices)
    case '系统设备':
      return !listEqual(b?.comfortSystems, a.comfortSystems)
    case '收纳重点':
      return !listEqual(b?.storageFocus, a.storageFocus)
    case '其他需求说明':
      return !strEqual(b?.otherNeeds, a.otherNeeds)
    case '风水与禁忌':
      return !strEqual(b?.fengshui, a.fengshui)
    case '空间其他说明':
      return !strEqual(b?.spaceOtherNote, a.spaceOtherNote)
    case '客厅需求':
      return !strEqual(b?.livingRoomNote, a.livingRoomNote)
    case '餐厅需求':
      return !strEqual(b?.diningNote, a.diningNote)
    case '厨房需求':
      return !strEqual(b?.kitchenNote, a.kitchenNote)
    case '卫生间需求':
      return !strEqual(b?.bathroomNote, a.bathroomNote)
    case '核心空间配置':
      return !strEqual(b?.coreSpaces, a.coreSpaces)
    case '自定义核心空间':
      return !listEqual(b?.customCoreSpaceOptions, a.customCoreSpaceOptions)
    case '儿童成长':
      return !strEqual(b?.childGrowth, a.childGrowth)
    case '访客留宿':
      return !strEqual(b?.guestStay, a.guestStay)
    case '未来变动':
      return !strEqual(b?.futureChanges, a.futureChanges)
    case '成员画像': {
      const toMembersKey = (members: RequirementsMember[] | undefined) =>
        JSON.stringify(
          (members ?? []).map((m) => ({
            id: m.id,
            name: m.name,
            displayName: m.displayName ?? '',
            age: m.age ?? '',
            profession: m.profession ?? '',
            otherActivityNote: m.otherActivityNote ?? '',
            spaces: (m.spaces ?? []).map((s) => ({ name: s.name, description: s.description ?? '' })),
          })),
        )
      return toMembersKey(b?.requirementsMembers) !== toMembersKey(a.requirementsMembers)
    }
    case '户型图': {
      const toFpKey = (arr: RequirementDocPayloadShape['floorPlanImages']) =>
        JSON.stringify([...(arr ?? [])].map((x) => x.name).sort())
      return toFpKey(b?.floorPlanImages) !== toFpKey(a.floorPlanImages)
    }
    case '现场照片/视频': {
      const toSmKey = (arr: RequirementDocPayloadShape['siteMedia']) =>
        JSON.stringify(
          [...(arr ?? [])].map((x) => `${x.name}|${(x.kind ?? '').trim() || 'image'}`).sort(),
        )
      return toSmKey(b?.siteMedia) !== toSmKey(a.siteMedia)
    }
    case '自定义空间需求': {
      const toCsKey = (arr: RequirementDocPayloadShape['customSpaceItems']) =>
        JSON.stringify(
          (arr ?? []).map((x) => ({ name: x.name ?? '', description: x.description ?? '' })),
        )
      return toCsKey(b?.customSpaceItems) !== toCsKey(a.customSpaceItems)
    }
    default:
      return false
  }
}

/** 基于字段级比较得到有变化的模块列表（替代原指纹 diff，确保不遗漏） */
function getDiffLabelsFromPayloads(
  before: RequirementDocPayloadShape | null,
  after: RequirementDocPayloadShape | null,
  allLabels: readonly string[],
  hasAfterNonEmpty: (label: string) => boolean,
): string[] {
  if (!after) return []
  if (!before) return allLabels.filter((lb) => hasAfterNonEmpty(lb))
  return allLabels.filter((lb) => payloadModuleHasChange(lb, before, after))
}

/** 将需求书 payload 格式化为可读的「变更前/变更后」详情文本 */
function formatRequirementPayloadAsDetail(p: RequirementDocPayloadShape): string {
  const lines: string[] = []
  const pushListBlock = (title: string, items: string[] | undefined) => {
    const list = (items ?? []).filter((x) => String(x ?? '').trim())
    if (!list.length) return
    lines.push(`${title}：`)
    for (const it of list) lines.push(`- ${String(it)}`)
  }
  const pushTextBlock = (title: string, text: string | undefined) => {
    const v = String(text ?? '').trim()
    if (!v) return
    lines.push(`${title}：`)
    lines.push(v)
  }

  const pushKeyValLines = (title: string, rows: Array<{ k: string; v?: string }>) => {
    const filtered = rows
      .map((r) => ({ k: r.k, v: String(r.v ?? '').trim() }))
      .filter((r) => Boolean(r.v))
    if (!filtered.length) return
    lines.push(`${title}：`)
    for (const r of filtered) lines.push(`- ${r.k}：${r.v}`)
  }

  pushKeyValLines('项目概览', [
    { k: '项目城市', v: p.projectLocation },
    { k: '项目类型', v: p.projectType },
    { k: '实际面积（㎡）', v: p.projectArea },
    { k: '预算范围', v: p.budgetStandard },
    { k: '入住周期', v: p.timeline },
    { k: '房屋用途', v: p.houseUsage },
    { k: '采光', v: p.lighting },
    { k: '通风', v: p.ventilation },
    { k: '层高', v: p.ceilingHeight },
    { k: '噪音', v: p.noise },
  ])

  pushKeyValLines('空间规划', [
    { k: '核心空间配置', v: p.coreSpaces },
    { k: '自定义核心空间', v: (p.customCoreSpaceOptions ?? []).map((x) => String(x ?? '').trim()).filter(Boolean).join('、') },
    { k: '儿童成长', v: p.childGrowth },
    { k: '访客留宿', v: p.guestStay },
    { k: '未来变动', v: p.futureChanges },
  ])

  pushListBlock('智能家居', p.smartHomeOptions)
  pushListBlock('全屋设备', p.devices)
  pushListBlock('系统设备', p.comfortSystems)
  pushListBlock('收纳重点', p.storageFocus)

  pushTextBlock('其他需求', p.otherNeeds)
  pushTextBlock('风水与禁忌', p.fengshui)
  pushTextBlock('空间其他说明', p.spaceOtherNote)
  pushTextBlock('客厅', p.livingRoomNote)
  pushTextBlock('餐厅', p.diningNote)
  pushTextBlock('厨房', p.kitchenNote)
  pushTextBlock('卫生间', p.bathroomNote)
  pushTextBlock('核心空间', p.coreSpaces)
  pushTextBlock('儿童成长', p.childGrowth)
  pushTextBlock('访客留宿', p.guestStay)
  pushTextBlock('未来变动', p.futureChanges)

  if ((p.requirementsMembers ?? []).length) {
    lines.push('成员画像：')
    for (const m of p.requirementsMembers ?? []) {
      const head = `- ${m.name}${m.displayName ? `（${m.displayName}）` : ''}`
      lines.push(head)
      if (m.age?.trim()) lines.push(`  年龄：${m.age.trim()}`)
      if (m.profession?.trim()) lines.push(`  身份/职业：${m.profession.trim()}`)
      if ((m.spaces ?? []).length) {
        lines.push('  空间：')
        for (const s of m.spaces ?? []) {
          const desc = s.description?.trim() ? `：${s.description.trim()}` : ''
          lines.push(`  - ${s.name}${desc}`)
        }
      }
      if (m.otherActivityNote?.trim()) {
        lines.push(`  其他说明：${m.otherActivityNote.trim()}`)
      }
    }
  }

  if ((p.customSpaceItems ?? []).length) {
    lines.push('自定义空间：')
    for (const x of p.customSpaceItems ?? []) {
      const desc = x.description?.trim() ? `：${x.description.trim()}` : ''
      lines.push(`- ${x.name}${desc}`)
    }
  }

  if ((p.floorPlanImages ?? []).length) {
    lines.push('户型图：')
    for (const x of p.floorPlanImages ?? []) lines.push(`- ${x.name}`)
  }

  if ((p.siteMedia ?? []).length) {
    lines.push('现场媒体：')
    for (const x of p.siteMedia ?? []) {
      const kind = (x.kind ?? '').trim()
      lines.push(`- ${x.name}${kind ? `（${kind}）` : ''}`)
    }
  }

  return lines.length ? lines.join('\n') : '（无）'
}

/** 从 FormData 构建与 RequirementDocPayloadShape 同结构的对象，用于生成「变更前」详情 */
function requirementPayloadFromFormData(d: import('../../types').FormData): RequirementDocPayloadShape {
  return {
    projectLocation: (d.projectLocation ?? '').trim(),
    projectType: (d.projectType ?? '').trim(),
    projectArea: (d.projectArea ?? '').trim(),
    budgetStandard: (d.budgetStandard ?? '').trim(),
    timeline: (d.timeline ?? '').trim(),
    houseUsage: (d.houseUsage ?? '').trim(),
    lighting: (d.lighting ?? '').trim(),
    ceilingHeight: (d.ceilingHeight ?? '').trim(),
    ventilation: (d.ventilation ?? '').trim(),
    noise: (d.noise ?? '').trim(),

    smartHomeOptions: d.smartHomeOptions ?? [],
    devices: d.devices ?? [],
    otherNeeds: d.otherNeeds ?? '',
    comfortSystems: d.comfortSystems ?? [],
    fengshui: (d.fengshui ?? '').trim(),
    storageFocus: d.storageFocus ?? [],
    spaceOtherNote: d.spaceOtherNote ?? '',
    livingRoomNote: d.livingRoomNote ?? '',
    diningNote: d.diningNote ?? '',
    kitchenNote: d.kitchenNote ?? '',
    bathroomNote: d.bathroomNote ?? '',
    coreSpaces: d.coreSpaces ?? '',
    customCoreSpaceOptions: d.customCoreSpaceOptions ?? [],
    childGrowth: d.childGrowth ?? '',
    guestStay: d.guestStay ?? '',
    futureChanges: d.futureChanges ?? '',
    requirementsMembers: d.requirementsMembers ?? [],
    floorPlanImages: d.floorPlanImages ?? [],
    siteMedia: d.siteMedia ?? [],
    customSpaceItems: d.customSpaceItems ?? [],
  }
}

function formatAutoRevisionSummary(changedLabels: string[]): string {
  if (changedLabels.length === 0) {
    return '本次编辑相对进入编辑时未检测到字段差异（若刚保存过，可能已与基准一致）'
  }
  if (changedLabels.length >= 12) return '大范围更新项目需求书（多项模块均有调整）'
  if (changedLabels.length <= 6) return `更新：${changedLabels.join('、')}`
  return `更新：${changedLabels.slice(0, 6).join('、')}等共${changedLabels.length}处`
}

const BASELINE_ROLE_LABELS: Record<string, string> = { A: '男主人', B: '女主人', C: '长辈/长住家属' }
const BASELINE_MEMBER_LABELS: Record<string, string> = { daughter: '女儿', son: '儿子', cat: '猫猫', dog: '狗狗' }

/** 与进入编辑时保存的数据一致，用于生成对比基准指纹（成员空间与测评字段 daughterSpaces 等一致） */
function fingerprintFromSavedFormData(d: import('../../types').FormData): Record<string, string> {
  const memberSpaces: Record<string, string[]> = {
    daughter: d.daughterSpaces ?? [],
    son: d.sonSpaces ?? [],
    cat: d.catSpaces ?? [],
    dog: d.dogSpaces ?? [],
  }
  let requirementsMembers: RequirementsMember[]
  if (d.requirementsMembers?.length) {
    requirementsMembers = d.requirementsMembers
  } else {
    const list: RequirementsMember[] = []
    if (d.role) {
      list.push({
        id: 'role',
        name: BASELINE_ROLE_LABELS[d.role] || d.role,
        age: '',
        profession: '',
        spaces: (d.favoriteSpace ?? []).map((name) => ({ name, description: '' })),
      })
    }
    ;(d.additionalMembers ?? []).forEach((memberId) => {
      list.push({
        id: memberId,
        name: BASELINE_MEMBER_LABELS[memberId] ?? memberId,
        age: '',
        profession: '',
        spaces: (memberSpaces[memberId] ?? []).map((name) => ({ name, description: '' })),
      })
    })
    requirementsMembers = list
  }
  return fingerprintRequirementDocPayload({
    projectLocation: (d.projectLocation ?? '').trim(),
    projectType: (d.projectType ?? '').trim(),
    projectArea: (d.projectArea ?? '').trim(),
    budgetStandard: (d.budgetStandard ?? '').trim(),
    timeline: (d.timeline ?? '').trim(),
    houseUsage: (d.houseUsage ?? '').trim(),
    lighting: (d.lighting ?? '').trim(),
    ceilingHeight: (d.ceilingHeight ?? '').trim(),
    ventilation: (d.ventilation ?? '').trim(),
    noise: (d.noise ?? '').trim(),
    smartHomeOptions: d.smartHomeOptions ?? [],
    devices: d.devices ?? [],
    otherNeeds: d.otherNeeds ?? '',
    comfortSystems: d.comfortSystems ?? [],
    fengshui: (d.fengshui ?? '').trim(),
    storageFocus: d.storageFocus ?? [],
    spaceOtherNote: d.spaceOtherNote ?? '',
    livingRoomNote: d.livingRoomNote ?? '',
    diningNote: d.diningNote ?? '',
    kitchenNote: d.kitchenNote ?? '',
    bathroomNote: d.bathroomNote ?? '',
    coreSpaces: d.coreSpaces ?? '',
    customCoreSpaceOptions: d.customCoreSpaceOptions ?? [],
    childGrowth: d.childGrowth ?? '',
    guestStay: d.guestStay ?? '',
    futureChanges: d.futureChanges ?? '',
    requirementsMembers,
    floorPlanImages: d.floorPlanImages ?? [],
    siteMedia: d.siteMedia ?? [],
    customSpaceItems: d.customSpaceItems ?? [],
  })
}

export function RequirementsDoc({
  projectName,
  ownerDisplayName,
  houseUsage,
  data,
  updateData,
  isShowcase,
  onBackHome,
  onGoToStyleEval,
  supplementDeepEvalPath,
  snapshotEmbedded,
  snapshotOnClose,
  snapshotRevisionLabel,
}: {
  projectName: string
  ownerDisplayName: string
  houseUsage?: string
  data?: import('../../types').FormData
  /** 编辑后持久化到全局 FormData；预览场景可不传 */
  updateData?: (partial: Partial<import('../../types').FormData>) => void
  isShowcase?: boolean
  onBackHome: () => void
  /** 需求书为空时：风格测评 → 深度测评（线索已在入项时采集，不经过线索/合同页） */
  onGoToStyleEval?: () => void
  /** 非演示项目：跳转深度测评（带 leadId）以补充需求 */
  supplementDeepEvalPath?: string
  /** 修订快照弹窗内：与主需求书同版式只读展示 */
  snapshotEmbedded?: boolean
  snapshotOnClose?: () => void
  snapshotRevisionLabel?: string
}) {
  const navigateReq = useNavigate()
  const useMock = isShowcase === true && !snapshotEmbedded
  const d = snapshotEmbedded ? data ?? null : useMock ? null : data

  React.useEffect(() => {
    if (snapshotEmbedded) setIsEditing(false)
  }, [snapshotEmbedded])

  if (snapshotEmbedded && !data) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-800">
        无法加载需求书快照
      </div>
    )
  }
  const empty = (v: string) => !v || !String(v).trim()
  const val = (v: string, fallback = '未填写') => (empty(v) ? fallback : String(v).trim())

  const [isEditing, setIsEditing] = React.useState(false)
  const [editHint, setEditHint] = React.useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = React.useState(false)
  const [showSubmitModal, setShowSubmitModal] = React.useState(false)
  const [showFinishRevisionModal, setShowFinishRevisionModal] = React.useState(false)
  const [showNoChangesModal, setShowNoChangesModal] = React.useState(false)
  const [snapshotModalEntry, setSnapshotModalEntry] = React.useState<RequirementDocRevisionEntry | null>(null)
  const [revisionUpdaterInput, setRevisionUpdaterInput] = React.useState('')
  const [revisionSummaryInput, setRevisionSummaryInput] = React.useState('')
  const [revisionSectionNoteInput, setRevisionSectionNoteInput] = React.useState('')
  const [spaceTab, setSpaceTab] = React.useState<string>('living')
  /** 需求书正文 vs 变更记录 */
  const [requirementsDocPage, setRequirementsDocPage] = React.useState<'content' | 'revisions'>('content')
  const [revisionTablePage, setRevisionTablePage] = React.useState(1)
  /** 详细变更记录中当前展开条目的 id */
  const [expandedRevisionId, setExpandedRevisionId] = React.useState<string | null>(null)
  /** 弹窗内快照：仅展示该版需求书正文，不提供「变更记录」 */
  const showRevisionTabs = !snapshotEmbedded
  const showDocContent = snapshotEmbedded || requirementsDocPage !== 'revisions'

  /** 与 Q2-9 核心空间一致，用于自定义空间名称选项 */
  const CORE_SPACE_OPTIONS = ['客厅', '餐厅', '开放厨房', '封闭厨房', '主卧室', '次卧室', '小孩卧室', '老人卧室', '主卫浴室', '公卫浴室', '次卫浴室', '书房', '花园']
  /** 成员画像：角色选项（与 Q2-6、Q2-6-1 一致，选后仅展示该角色对应的年龄段/身份/活动选项） */
  const MEMBER_ROLE_OPTIONS = ['男主人', '女主人', '长辈/长住家属', '女儿', '儿子', '猫猫', '狗狗', '其他']
  /** 按角色映射「年龄段」选项：成人不用学龄前/小学等，儿童不用 20-30 岁等 */
  const ROLE_TO_AGE_OPTIONS: Record<string, string[]> = {
    '男主人': ['20-30岁', '31-40岁', '41-50岁', '50岁以上', '其他'],
    '女主人': ['20-30岁', '31-40岁', '41-50岁', '50岁以上', '其他'],
    '长辈/长住家属': ['50岁以上', '41-50岁', '31-40岁', '其他'],
    '女儿': ['学龄前', '小学', '初中', '高中', '其他'],
    '儿子': ['学龄前', '小学', '初中', '高中', '其他'],
    '猫猫': ['幼年', '成年', '老年', '其他'],
    '狗狗': ['幼年', '成年', '老年', '其他'],
    '其他': ['20-30岁', '31-40岁', '41-50岁', '50岁以上', '学龄前', '小学', '初中', '高中', '其他'],
  }
  /** 按角色映射「身份/职业」选项：已选角色后不再出现其他角色名 */
  const ROLE_TO_PROFESSION_OPTIONS: Record<string, string[]> = {
    '男主人': ['金融从业', '教育', '医疗', '自由职业', '退休', '学生', '其他'],
    '女主人': ['金融从业', '教育', '医疗', '自由职业', '退休', '学生', '其他'],
    '长辈/长住家属': ['退休', '金融从业', '教育', '医疗', '自由职业', '其他'],
    '女儿': ['学龄前', '小学', '初中', '高中', '其他'],
    '儿子': ['学龄前', '小学', '初中', '高中', '其他'],
    '猫猫': ['其他'],
    '狗狗': ['其他'],
    '其他': ['金融从业', '教育', '医疗', '自由职业', '退休', '学生', '学龄前', '小学', '初中', '高中', '其他'],
  }
  const MEMBER_AGE_OPTIONS_FALLBACK = ROLE_TO_AGE_OPTIONS['其他']
  const MEMBER_PROFESSION_OPTIONS_FALLBACK = ROLE_TO_PROFESSION_OPTIONS['其他']
  /** 按角色映射「主要活动及空间」选项（与 Q2-6、Q2-6-1 题目一致） */
  const ROLE_TO_ACTIVITY_OPTIONS: Record<string, string[]> = {
    '男主人': ['智能书房', '客厅影音中心', '社交餐厨'],
    '女主人': ['梦幻衣帽间', '全能厨房', '主卧疗愈区'],
    '长辈/长住家属': ['阳光卧室', '茶室/宁静角', '独立卫浴'],
    '女儿': ['梦幻公主房', '独立书画区', '乐器练琴房', '超大储衣空间'],
    '儿子': ['乐高/积木区', '运动攀爬墙', '电脑电竞区', '独立手作台'],
    '猫猫': ['猫墙/跑道', '嵌入式猫砂盆', '阳台封窗', '独立喂食区'],
    '狗狗': ['进门洗脚池', '独立卧榻', '宠物互动区', '扫拖机器人基地'],
    '其他': [
      '智能书房', '客厅影音中心', '社交餐厨', '梦幻衣帽间', '全能厨房', '主卧疗愈区', '阳光卧室', '茶室/宁静角', '独立卫浴',
      '梦幻公主房', '独立书画区', '乐器练琴房', '超大储衣空间', '乐高/积木区', '运动攀爬墙', '电脑电竞区', '独立手作台',
      '猫墙/跑道', '嵌入式猫砂盆', '阳台封窗', '独立喂食区', '进门洗脚池', '独立卧榻', '宠物互动区', '扫拖机器人基地',
    ],
  }
  const MEMBER_ACTIVITY_SPACE_OPTIONS_FALLBACK = ROLE_TO_ACTIVITY_OPTIONS['其他']
  /** 风水要求选项（与 Q2-17 Step17 一致） */
  const FENGSHUI_OPTIONS = [
    '没讲究，怎么舒服怎么来',
    '避开大众忌讳就行',
    '有比较看重的特定要求',
    '我有专门的方案，需配合执行',
  ]
  const planInputId = React.useId()
  const mediaInputId = React.useId()
  const [planImages, setPlanImages] = React.useState<Array<{ name: string; url: string }>>([])
  const [mediaFiles, setMediaFiles] = React.useState<Array<{ name: string; url: string; kind: 'image' | 'video' }>>([])

  const displayHouseUsage = useMock ? (houseUsage?.trim() || '改善房') : val(d?.houseUsage ?? houseUsage ?? '')

  const infoRows: Array<{ label: string; value: string }> = useMock
    ? [
        { label: '项目城市', value: '上海' },
        { label: '项目类型', value: '平层公寓' },
        { label: '实际面积', value: '100.0 ㎡' },
        { label: '预算范围', value: '10.1 万/㎡' },
        { label: '入住周期', value: '3-6个月' },
      ]
    : [
        { label: '项目城市', value: val(d?.projectLocation ?? d?.userCity ?? '') },
        { label: '项目类型', value: val(d?.projectType ?? '') },
        { label: '实际面积', value: d?.projectArea ? `${d.projectArea} ㎡` : '未填写' },
        { label: '预算范围', value: val(d?.budgetStandard ?? d?.budgetSubStandard ?? '') },
        { label: '入住周期', value: val(d?.timeline ?? '') },
      ]

  const projectStatus = useMock
    ? { lighting: '良好，半天有阳光', ventilation: '南北通透', ceilingHeight: '2.6-2.8米 (标准)', noise: '偶有噪音' }
    : {
        lighting: val(d?.lighting ?? ''),
        ventilation: val(d?.ventilation ?? ''),
        ceilingHeight: val(d?.ceilingHeight ?? ''),
        noise: val(d?.noise ?? ''),
      }

  const statusCards: Array<{ icon: React.ElementType; title: string; value: string }> = [
    { icon: Sun, title: '采光', value: projectStatus.lighting },
    { icon: Wind, title: '通风', value: projectStatus.ventilation },
    { icon: Ruler, title: '层高', value: projectStatus.ceilingHeight },
    { icon: Volume2, title: '噪音', value: projectStatus.noise },
  ]

  const ROLE_LABELS: Record<string, string> = { A: '男主人', B: '女主人', C: '长辈/长住家属' }
  const MEMBER_LABELS: Record<string, string> = { daughter: '女儿', son: '儿子', cat: '猫猫', dog: '狗狗' }
  const MEMBER_SPACES: Record<string, string[]> = {
    daughter: d?.daughterSpaces ?? [],
    son: d?.sonSpaces ?? [],
    cat: d?.catSpaces ?? [],
    dog: d?.dogSpaces ?? [],
  }

  type PersonaRow = {
    name: string
    age: string
    profession: string
    height: string
    stylePersona: string | null
    mainActivitiesAndSpaces: string[]
    otherActivityNote?: string
    accent: 'amber' | 'slate'
    isStyleTaker?: boolean
    /** 有姓名时展示「角色 · xxx」 */
    roleTag?: string
    personaKey?: string
  }
  const displayPersonas = useMock
    ? [
        { name: '父亲', age: '42岁', profession: '金融从业', height: '178cm', stylePersona: '理性秩序派' as string | null, mainActivitiesAndSpaces: ['高效办公（书房/办公角）', '家庭放松（客厅）', '收纳管理（玄关/衣柜系统）'], accent: 'amber' as const, isStyleTaker: true },
        { name: '母亲', age: '39岁', profession: '品牌市场', height: '165cm', stylePersona: null, mainActivitiesAndSpaces: ['烹饪与备餐（厨房/轻食台）', '社交招待（餐厨/客厅）', '展示收纳（餐边/陈列区）'], accent: 'slate' as const, isStyleTaker: false },
        { name: '女儿', age: '8岁', profession: '小学生', height: '128cm', stylePersona: null, mainActivitiesAndSpaces: ['学习阅读（书桌/阅读角）', '游戏玩耍（客厅/儿童区）', '收纳整理（玩具/衣物储物）'], accent: 'amber' as const, isStyleTaker: false },
        { name: 'Mochi', age: '2岁', profession: '猫', height: '约25cm（肩高）', stylePersona: null, mainActivitiesAndSpaces: ['活动动线（猫墙/跑道）', '休息晒太阳（窗边/阳台）', '饮食如厕（喂食区/猫砂区）'], accent: 'slate' as const, isStyleTaker: false },
      ]
    : (() => {
        if (d?.requirementsMembers?.length) {
          return d.requirementsMembers.map((m, i) => {
            const isRole = MEMBER_ROLE_OPTIONS.includes(m.name)
            const role = isRole ? m.name : ''
            const dn = (m.displayName ?? '').trim()
            const legacy = !isRole && m.name?.trim() ? m.name.trim() : ''
            const displayTitle = dn || legacy || role || '成员'
            const roleTag = dn && role ? role : undefined
            return {
              name: displayTitle,
              roleTag,
              age: m.age ?? '',
              profession: m.profession ?? '',
              height: '',
              stylePersona: null,
              mainActivitiesAndSpaces: (m.spaces ?? []).map((s) =>
                s.description?.trim() ? `${s.name}：${s.description}` : s.name,
              ),
              otherActivityNote: m.otherActivityNote ?? '',
              accent: i % 2 === 0 ? 'amber' : 'slate',
              isStyleTaker: m.id === 'role',
              personaKey: m.id,
            }
          }) as PersonaRow[]
        }
        const list: PersonaRow[] = []
        if (d?.role) {
          const name = ROLE_LABELS[d.role] || d.role
          list.push({ name, age: '', profession: '', height: '', stylePersona: null, mainActivitiesAndSpaces: d?.favoriteSpace ?? [], otherActivityNote: '', accent: 'amber', isStyleTaker: true })
        }
        ;(d?.additionalMembers ?? []).forEach((memberId) => {
          const label = MEMBER_LABELS[memberId] ?? memberId
          const spaces = MEMBER_SPACES[memberId] ?? []
          list.push({ name: label, age: '', profession: '', height: '', stylePersona: null, mainActivitiesAndSpaces: spaces, otherActivityNote: '', accent: 'slate', isStyleTaker: false })
        })
        return list
      })()

  const personas = displayPersonas
  const hasMemberData = personas.length > 0

  const systemEquipments = [
    { key: 'fresh-air', title: '新风系统', desc: '全屋换气·除味净化', icon: Wind },
    { key: 'floor-heating', title: '全屋地暖', desc: '智能分区温控', icon: Thermometer },
    { key: 'central-ac', title: '中央空调', desc: '变频节能冷暖系统', icon: AirVent },
  ] as const

  /** 与 Q2-18 Step18 选项完全一致，用于正确展示测评结果 */
  const smartHomeOptions = [
    { key: 'wifi', label: '全屋网络覆盖', icon: Wifi },
    { key: 'scene', label: '一键场景控制', icon: Zap },
    { key: 'lighting', label: '氛围灯光调控', icon: Lightbulb },
    { key: 'bgm', label: '隐形背景音乐', icon: Music },
    { key: 'security', label: '24h 居家安防', icon: ShieldCheck },
    { key: 'linkage', label: '家电自动联动', icon: Cpu },
    { key: 'curtain', label: '遮阳自动系统', icon: Sun },
  ] as const

  /** 与 Q2-14 选项一致，用于需求书内收纳重点编辑 */
  const STORAGE_FOCUS_OPTIONS = [
    '衣帽间/衣柜系统',
    '厨房餐储收纳',
    '展示性收纳（书籍、收藏品）',
    '儿童玩具收纳',
    '清洁工具/家政柜',
  ] as const

  const specialDeviceOptions = [
    { key: 'smart-lock', label: '智能门锁', icon: Lock },
    { key: 'dishwasher', label: '洗碗机', icon: Waves },
    { key: 'garbage', label: '厨房垃圾处理器', icon: Trash2 },
    { key: 'smart-toilet', label: '智能马桶盖', icon: Bath },
    { key: 'steam-oven', label: '蒸烤箱', icon: Flame },
    { key: 'dryer', label: '干衣机', icon: Wind },
    { key: 'robot', label: '扫拖机器人', icon: Bot },
  ] as const

  const [smartHomeSelected, setSmartHomeSelected] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    smartHomeOptions.forEach((o) => {
      initial[o.key] = false
    })
    return initial
  })

  const [specialDeviceSelected, setSpecialDeviceSelected] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    specialDeviceOptions.forEach((o) => {
      initial[o.key] = false
    })
    return initial
  })

  const [customNeedsNote, setCustomNeedsNote] = React.useState('')
  const [spaceOtherNote, setSpaceOtherNote] = React.useState('')
  const [showInlinePreview, setShowInlinePreview] = React.useState(false)
  const [comfortSystemsEdit, setComfortSystemsEdit] = React.useState<string[]>([])
  const [fengshuiEdit, setFengshuiEdit] = React.useState('')
  const [storageFocusEdit, setStorageFocusEdit] = React.useState<string[]>([])
  const [membersEdit, setMembersEdit] = React.useState<RequirementsMember[]>([])
  const [customSpaceItemsEdit, setCustomSpaceItemsEdit] = React.useState<Array<{ name: string; description?: string }>>([])

  const fengshuiResult = useMock ? '避开大众忌讳就行' : val(d?.fengshui ?? '')
  const storageFocusResult = useMock ? ['衣帽间/衣柜系统', '厨房餐储收纳', '展示性收纳（书籍、收藏品）'] : (d?.storageFocus?.length ? d.storageFocus : [])

  const LIVING_LABELS: Record<string, string> = { media: '影音娱乐', kids: '亲子互动', work: '办公学习', social: '社交会客', fitness: '健身运动', relax: '冥想放松' }
  const livingItems = useMock ? ['影音娱乐', '社交会客', '冥想放松'] : ((d?.livingRoomFeature?.length ? d.livingRoomFeature.map((id) => LIVING_LABELS[id] || id) : []))
  const diningItems = useMock ? ['平时就餐：3-4人', '节假日最多：7-10人'] : [val(d?.diningCount ?? '', '') ? `平时就餐：${d!.diningCount}` : '', val(d?.festivalDiningCount ?? '', '') ? `节假日最多：${d!.festivalDiningCount}` : ''].filter(Boolean)
  const COOKING_HABIT_LABELS: Record<string, string> = { heavy: '经常做饭（重油烟）', light: '偶尔做饭（轻食/简餐）', none: '基本点外卖（外出就餐）' }
  const SECOND_KITCHEN_LABELS: Record<string, string> = { no: '不需要（一个厨房足够）', yes_split: '需要中西分厨', yes_light: '需要独立辅食区（轻食区）' }
  const DRY_WET_LABELS: Record<string, string> = { strict: '必须彻底干湿分离（洗手台外置）', normal: '常规干湿分离（淋浴房/浴帘）', none: '无特殊要求' }
  const kitchenItems = useMock ? ['烹饪习惯：经常做饭（重油烟）', '第二厨房：需要中西分厨'] : [val(d?.cookingHabit ?? '', '') ? `烹饪习惯：${COOKING_HABIT_LABELS[d!.cookingHabit] ?? d!.cookingHabit}` : '', val(d?.secondKitchen ?? '', '') ? `第二厨房：${SECOND_KITCHEN_LABELS[d!.secondKitchen] ?? d!.secondKitchen}` : ''].filter(Boolean)
  const bathroomItems = useMock ? ['必须彻底干湿分离（洗手台外置）'] : (val(d?.dryWetSeparation ?? '', '') ? [DRY_WET_LABELS[d!.dryWetSeparation] ?? d!.dryWetSeparation] : [])

  const spaceResultMap: Record<string, { title: string; q: string; icon: React.ElementType; items: string[] }> = {
    living: { title: '客厅', q: 'Q2-13', icon: Sofa, items: ['影音娱乐', '社交会客', '冥想放松'] },
    dining: { title: '餐厅', q: 'Q2-12', icon: Utensils, items: ['平时就餐：3-4人', '节假日最多：7-10人'] },
    kitchen: { title: '厨房', q: 'Q2-11', icon: ChefHat, items: ['烹饪习惯：经常做饭（重油烟）', '第二厨房：需要中西分厨'] },
    bathroom: { title: '卫生间', q: 'Q2-15', icon: Bath, items: ['必须彻底干湿分离（洗手台外置）'] },
  }

  const customSpaceDisplayItems = (d?.customSpaceItems ?? []).map((s) => (s.description?.trim() ? `${s.name}：${s.description}` : s.name))
  const customSpaceItemsForTabs = (isEditing && updateData && !useMock) ? customSpaceItemsEdit : (d?.customSpaceItems ?? [])

  const spaceTabsList: Array<{ key: string; label: string }> = [
    { key: 'living', label: '客厅' },
    { key: 'dining', label: '餐厅' },
    { key: 'kitchen', label: '厨房' },
    { key: 'bathroom', label: '卫生间' },
    ...customSpaceItemsForTabs.map((s, i) => ({ key: `custom-${i}`, label: s.name?.trim() || `空间${i + 1}` })),
  ]

  const activeSpace = spaceTab.startsWith('custom-')
    ? (() => {
        const i = parseInt(spaceTab.replace('custom-', ''), 10)
        const item = customSpaceItemsForTabs[i]
        return { title: item?.name?.trim() || '其他空间', q: '自定义', icon: LayoutGrid, items: item?.description?.trim() ? [item.description] : [] }
      })()
    : spaceResultMap[spaceTab] ?? spaceResultMap.living

  const activeSpaceItems =
    spaceTab === 'living'
      ? livingItems
      : spaceTab === 'dining'
        ? diningItems
        : spaceTab === 'kitchen'
          ? kitchenItems
          : spaceTab === 'bathroom'
            ? bathroomItems
            : spaceTab.startsWith('custom-')
              ? (() => {
                  const i = parseInt(spaceTab.replace('custom-', ''), 10)
                  const list = (isEditing && updateData && !useMock) ? customSpaceItemsEdit : (d?.customSpaceItems ?? [])
                  const item = list[i]
                  return item?.description?.trim() ? [item.description] : []
                })()
              : []

  const currentSpaceNote =
    spaceTab === 'living'
      ? (d?.livingRoomNote ?? '')
      : spaceTab === 'dining'
        ? (d?.diningNote ?? '')
        : spaceTab === 'kitchen'
          ? (d?.kitchenNote ?? '')
          : spaceTab === 'bathroom'
            ? (d?.bathroomNote ?? '')
            : spaceTab.startsWith('custom-')
              ? (() => {
                  const i = parseInt(spaceTab.replace('custom-', ''), 10)
                  const list = (isEditing && updateData && !useMock) ? customSpaceItemsEdit : (d?.customSpaceItems ?? [])
                  return list[i]?.description ?? ''
                })()
              : ''

  React.useEffect(() => {
    return () => {
      planImages.forEach((x) => { if (x.url.startsWith('blob:')) URL.revokeObjectURL(x.url) })
      mediaFiles.forEach((x) => { if (x.url.startsWith('blob:')) URL.revokeObjectURL(x.url) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const justExitedEditRef = React.useRef(false)
  const prevIsEditingRef = React.useRef(false)
  React.useEffect(() => {
    if (prevIsEditingRef.current && !isEditing) justExitedEditRef.current = true
    prevIsEditingRef.current = isEditing
  }, [isEditing])
  React.useEffect(() => {
    if (isEditing) return
    if (!d) return
    if (justExitedEditRef.current) {
      justExitedEditRef.current = false
      return
    }
    if (d.floorPlanImages) setPlanImages(d.floorPlanImages)
    if (d.siteMedia) setMediaFiles(d.siteMedia)
  }, [d?.floorPlanImages, d?.siteMedia, isEditing])

  const baselineFingerprintRef = React.useRef<Record<string, string> | null>(null)

  const prevEditingRef = React.useRef(false)
  React.useEffect(() => {
    const justEnteredEdit = isEditing && !prevEditingRef.current
    prevEditingRef.current = isEditing
    if (!justEnteredEdit || useMock || !d) return
    const fromSmart = (d.smartHomeOptions ?? []).reduce((acc, label) => {
      const o = smartHomeOptions.find((x) => x.label === label)
      if (o) acc[o.key] = true
      return acc
    }, {} as Record<string, boolean>)
    setSmartHomeSelected((prev) => ({ ...prev, ...fromSmart }))
    const fromDevices = (d.devices ?? []).reduce((acc, label) => {
      const o = specialDeviceOptions.find((x) => x.label === label)
      if (o) acc[o.key] = true
      return acc
    }, {} as Record<string, boolean>)
    setSpecialDeviceSelected((prev) => ({ ...prev, ...fromDevices }))
    setCustomNeedsNote((d.otherNeeds ?? '').trim())
    setComfortSystemsEdit(d.comfortSystems ?? [])
    setFengshuiEdit((d.fengshui ?? '').trim())
    setStorageFocusEdit(d.storageFocus ?? [])
    setSpaceOtherNote(d.spaceOtherNote ?? '')
    if (d.requirementsMembers?.length) {
      setMembersEdit(
        d.requirementsMembers.map((m) => {
          if (MEMBER_ROLE_OPTIONS.includes(m.name)) {
            return { ...m, displayName: m.displayName ?? '' }
          }
          return {
            ...m,
            displayName: (m.displayName ?? m.name ?? '').trim(),
            name: '',
          }
        }),
      )
    } else {
      const list: RequirementsMember[] = []
      if (d.role) {
        const r = ROLE_LABELS[d.role] || d.role
        const roleName = MEMBER_ROLE_OPTIONS.includes(r) ? r : '男主人'
        list.push({
          id: 'role',
          name: roleName,
          displayName: d.userName?.trim()
            ? `${d.userName.trim()}${d.userTitle?.trim() ? `（${d.userTitle.trim()}）` : ''}`
            : '',
          age: '',
          profession: '',
          spaces: (d.favoriteSpace ?? []).map((name) => ({ name, description: '' })),
        })
      }
      ;(d.additionalMembers ?? []).forEach((memberId) => {
        const roleNm = MEMBER_LABELS[memberId] ?? memberId
        list.push({
          id: memberId,
          name: MEMBER_ROLE_OPTIONS.includes(roleNm) ? roleNm : '其他',
          displayName: '',
          age: '',
          profession: '',
          spaces: (MEMBER_SPACES[memberId] ?? []).map((name) => ({ name, description: '' })),
        })
      })
      setMembersEdit(list)
    }
    setCustomSpaceItemsEdit(d.customSpaceItems ?? [])
  }, [isEditing, useMock, d])

  const onPickPlanFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setPlanImages((prev) => [...prev, { name: f.name, url: dataUrl }])
      }
      reader.readAsDataURL(f)
    })
  }

  const onPickMediaFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    Array.from(files).forEach((f) => {
      const kind: 'image' | 'video' | null = f.type.startsWith('video/') ? 'video' : f.type.startsWith('image/') ? 'image' : null
      if (!kind) return
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setMediaFiles((prev) => [...prev, { name: f.name, url: dataUrl, kind }])
      }
      reader.readAsDataURL(f)
    })
  }

  const notifyReadonly = (message = '当前为只读状态，请点击底部“编辑”后再修改。') => {
    setEditHint(message)
    window.setTimeout(() => setEditHint(null), 1800)
  }

  const selectedSmartHome = smartHomeOptions.filter((o) => smartHomeSelected[o.key])
  const selectedSpecialDevices = specialDeviceOptions.filter((o) => specialDeviceSelected[o.key])
  const displaySmartHomeLabels = useMock ? selectedSmartHome.map((o) => o.label) : (d?.smartHomeOptions ?? [])
  const displayDeviceLabels = useMock ? selectedSpecialDevices.map((o) => o.label) : (d?.devices ?? [])
  const displayComfortLabels = useMock ? systemEquipments.map((x) => x.title) : (d?.comfortSystems ?? [])
  const displaySmartHomeOptions = smartHomeOptions.filter((o) => displaySmartHomeLabels.includes(o.label))
  const displayDeviceOptions = specialDeviceOptions.filter((o) => displayDeviceLabels.includes(o.label))
  const displayComfortEquipments = systemEquipments.filter((x) => displayComfortLabels.includes(x.title))

  const showcaseRevisions: RequirementDocRevisionEntry[] = React.useMemo(() => {
    try {
      const fd = getLonghuJingchenfuFullFormData()
      return (fd.requirementDocRevisions ?? []) as RequirementDocRevisionEntry[]
    } catch {
      return []
    }
  }, [])
  const revisions: RequirementDocRevisionEntry[] = snapshotEmbedded
    ? []
    : useMock
      ? showcaseRevisions
      : (d?.requirementDocRevisions ?? [])

  const REVISIONS_PAGE_SIZE = 10
  const revisionTotalPages = Math.max(1, Math.ceil(revisions.length / REVISIONS_PAGE_SIZE))
  const revisionsPageSlice =
    revisions.length === 0 ? [] : revisions.slice(
      (revisionTablePage - 1) * REVISIONS_PAGE_SIZE,
      revisionTablePage * REVISIONS_PAGE_SIZE,
    )
  React.useEffect(() => {
    setRevisionTablePage(1)
  }, [requirementsDocPage, revisions.length])

  const buildRequirementDocEditsPayload = (): Partial<import('../../types').FormData> => {
    const smartLabels = smartHomeOptions.filter((o) => smartHomeSelected[o.key]).map((o) => o.label)
    const deviceLabels = specialDeviceOptions.filter((o) => specialDeviceSelected[o.key]).map((o) => o.label)
    return {
      smartHomeOptions: smartLabels,
      devices: deviceLabels,
      otherNeeds: customNeedsNote.trim() || (d?.otherNeeds ?? ''),
      comfortSystems: comfortSystemsEdit,
      fengshui: fengshuiEdit.trim(),
      storageFocus: storageFocusEdit,
      spaceOtherNote: spaceOtherNote.trim(),
      livingRoomNote: d?.livingRoomNote ?? '',
      diningNote: d?.diningNote ?? '',
      kitchenNote: d?.kitchenNote ?? '',
      bathroomNote: d?.bathroomNote ?? '',
      coreSpaces: d?.coreSpaces ?? '',
      customCoreSpaceOptions: d?.customCoreSpaceOptions ?? [],
      childGrowth: d?.childGrowth ?? '',
      guestStay: d?.guestStay ?? '',
      futureChanges: d?.futureChanges ?? '',
      requirementsMembers: membersEdit,
      floorPlanImages: planImages,
      siteMedia: mediaFiles,
      customSpaceItems: customSpaceItemsEdit,
    }
  }

  const confirmSaveRequirementWithRevision = () => {
    if (!updateData || useMock) {
      setShowFinishRevisionModal(false)
      setIsEditing(false)
      return
    }
    const payloadForSave = buildRequirementDocEditsPayload() as RequirementDocPayloadShape
    const fullAfterPayload = d
      ? requirementPayloadFromFormData({ ...d, ...payloadForSave } as import('../../types').FormData)
      : payloadForSave
    const fpAfter = fingerprintRequirementDocPayload(fullAfterPayload)
    const beforeFp =
      baselineFingerprintRef.current ?? (d ? fingerprintFromSavedFormData(d) : null)
    const labels = diffRequirementDocFingerprints(beforeFp, fpAfter)
    const autoSummary = formatAutoRevisionSummary(labels)
    const summary = revisionSummaryInput.trim() || autoSummary
    const sectionFromLabels = labels.length ? labels.join('、') : undefined
    const sectionNote = revisionSectionNoteInput.trim() || sectionFromLabels
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const beforePayload = d ? requirementPayloadFromFormData(d) : null
    const entry: RequirementDocRevisionEntry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rev-${Date.now()}`,
      date: dateStr,
      updater: revisionUpdaterInput.trim() || ownerDisplayName,
      summary,
      sectionNote: sectionNote || undefined,
      docSnapshotJson: JSON.stringify({
        v: 2,
        formData: buildRevisionSnapshotFormData(d!, payloadForSave as Partial<import('../../types').FormData>),
      }),
      changeDetailBefore: beforePayload ? formatRequirementPayloadAsDetail(beforePayload) : undefined,
      changeDetailAfter: formatRequirementPayloadAsDetail(fullAfterPayload),
    }
    updateData({
      ...(payloadForSave as Partial<import('../../types').FormData>),
      requirementDocRevisions: [entry, ...(d?.requirementDocRevisions ?? [])],
    })
    setShowFinishRevisionModal(false)
    setIsEditing(false)
    setRequirementsDocPage('revisions')
    setRevisionTablePage(1)
  }

  const isRequirementsEmpty =
    !useMock &&
    !hasMemberData &&
    (d?.comfortSystems ?? []).length === 0 &&
    (d?.smartHomeOptions ?? []).length === 0 &&
    !(d?.fengshui ?? '').trim() &&
    (d?.storageFocus ?? []).length === 0 &&
    livingItems.length === 0 &&
    diningItems.length === 0 &&
    kitchenItems.length === 0 &&
    bathroomItems.length === 0

  // 空状态时：内嵌预览示例，保留在需求书内而非跳转
  if (isRequirementsEmpty && showInlinePreview) {
    return (
      <div className="space-y-8 pb-24">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">项目交付 · 用户需求</div>
            <h1 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight">用户需求</h1>
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">{projectName}</span>
              <span className="mx-2 text-gray-300">/</span>
              <span>业主：{ownerDisplayName}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInlinePreview(false)}
            className="shrink-0 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            返回
          </button>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-2 text-sm text-amber-800">
          以下为示例效果，完成风格测评与线索收集、转为项目后，您将看到基于真实数据的用户需求文档。
        </div>
        <RequirementsDoc
          isShowcase
          projectName={projectName}
          ownerDisplayName={ownerDisplayName}
          onBackHome={() => setShowInlinePreview(false)}
        />
      </div>
    )
  }

  if (isRequirementsEmpty) {
    return (
      <div className="space-y-8 pb-24">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">项目交付 · 用户需求</div>
            <h1 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight">用户需求</h1>
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">{projectName}</span>
              <span className="mx-2 text-gray-300">/</span>
              <span>业主：{ownerDisplayName}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInlinePreview(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            预览示例
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-10 md:p-14">
          <div className="max-w-md mx-auto text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
              <FileText size={28} />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">暂无需求内容</h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              您已进入项目中心，项目概况与联系信息已由顾问录入。请依次完成<strong className="text-gray-800">家居风格测评</strong>与<strong className="text-gray-800">深度需求测评</strong>，即可生成并完善项目需求书（无需再填写线索或合同环节）。
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              {onGoToStyleEval && (
                <button
                  type="button"
                  onClick={onGoToStyleEval}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#FF9C3E] text-white font-semibold px-6 py-3 hover:brightness-95 active:scale-[0.99] transition"
                >
                  从风格测评开始
                  <ChevronRight size={18} className="ml-1" />
                </button>
              )}
              <button
                type="button"
                onClick={onBackHome}
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                返回
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={snapshotEmbedded ? 'space-y-6 pb-4' : 'space-y-8 pb-24'}>
      {snapshotEmbedded && snapshotOnClose ? (
        <div className="sticky top-0 z-20 -mx-1 flex items-center justify-between gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-[#FFF8ED] px-4 py-3 shadow-sm">
          <div className="min-w-0 text-sm">
            <span className="font-semibold text-amber-950">需求书快照</span>
            {snapshotRevisionLabel ? (
              <span className="block text-xs text-amber-800/80 mt-0.5 truncate">{snapshotRevisionLabel}</span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={snapshotOnClose}
            className="shrink-0 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 transition-colors"
          >
            关闭
          </button>
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-gray-500">
            {snapshotEmbedded ? (
              <span>
                修订快照（只读）
                {snapshotRevisionLabel ? (
                  <span className="text-gray-400 font-normal"> · {snapshotRevisionLabel}</span>
                ) : null}
              </span>
            ) : (
              <>项目交付 · {requirementsDocPage === 'revisions' ? '变更记录' : '用户需求'}</>
            )}
          </div>
          {showRevisionTabs ? (
            <div
              className="mt-3 relative z-10 inline-flex rounded-2xl bg-gradient-to-b from-stone-100/90 to-stone-50/95 p-[3px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-stone-200/70"
              role="tablist"
              aria-label="用户需求/变更记录切换"
            >
              <button
                type="button"
                role="tab"
                aria-selected={requirementsDocPage === 'content'}
                onClick={() => {
                  setSnapshotModalEntry(null)
                  setRequirementsDocPage('content')
                }}
                className={`relative flex items-center justify-center gap-2 min-w-[7.5rem] sm:min-w-[8.5rem] px-4 py-2.5 rounded-[13px] text-sm font-semibold transition-all duration-200 ease-out ${
                  requirementsDocPage === 'content'
                    ? 'bg-white text-[#b45309] shadow-[0_2px_12px_rgba(239,107,0,0.14),0_0_0_1px_rgba(251,191,36,0.25)]'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-white/35 active:scale-[0.99]'
                }`}
              >
                <FileText
                  size={18}
                  strokeWidth={requirementsDocPage === 'content' ? 2.25 : 2}
                  className={
                    requirementsDocPage === 'content' ? 'text-[#EF6B00]' : 'text-stone-400'
                  }
                />
                <span>用户需求</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={requirementsDocPage === 'revisions'}
                onClick={() => setRequirementsDocPage('revisions')}
                className={`relative flex items-center justify-center gap-2 min-w-[7.5rem] sm:min-w-[8.5rem] px-4 py-2.5 rounded-[13px] text-sm font-semibold transition-all duration-200 ease-out ${
                  requirementsDocPage === 'revisions'
                    ? 'bg-white text-[#b45309] shadow-[0_2px_12px_rgba(239,107,0,0.14),0_0_0_1px_rgba(251,191,36,0.25)]'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-white/35 active:scale-[0.99]'
                }`}
              >
                <History
                  size={18}
                  strokeWidth={requirementsDocPage === 'revisions' ? 2.25 : 2}
                  className={
                    requirementsDocPage === 'revisions' ? 'text-[#EF6B00]' : 'text-stone-400'
                  }
                />
                <span>变更记录</span>
                {revisions.length > 0 ? (
                  <span
                    className={`tabular-nums text-[11px] font-bold min-h-[1.375rem] min-w-[1.375rem] flex items-center justify-center rounded-full px-1.5 transition-colors ${
                      requirementsDocPage === 'revisions'
                        ? 'bg-gradient-to-br from-amber-400/90 to-orange-500/95 text-white shadow-sm'
                        : 'bg-stone-200/80 text-stone-600'
                    }`}
                  >
                    {revisions.length > 99 ? '99+' : revisions.length}
                  </span>
                ) : null}
              </button>
            </div>
          ) : null}
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{projectName}</span>
            <span className="mx-2 text-gray-300">/</span>
            <span>业主：{ownerDisplayName}</span>
          </div>
          {useMock ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              此为预览示例，仅支持查看与退出，不可编辑或提交。
            </div>
          ) : !isEditing ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-3 py-2 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9C3E]" />
              当前为只读状态；如需修改，请点击底部「编辑」。
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-[#FF9C3E]/20 bg-[#FF9C3E]/10 px-3 py-2 text-xs font-semibold text-[#C87800]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9C3E]" />
              编辑模式已开启
            </div>
          )}
          {editHint && !useMock ? (
            <div className="mt-2 text-xs font-semibold text-[#C87800]">{editHint}</div>
          ) : null}
        </div>
      </div>

      {supplementDeepEvalPath && !useMock ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3.5 text-sm text-amber-950 shadow-sm">
          <p className="font-medium text-amber-950">本项目按实际已填信息展示，标为「未填写」处请逐步补充。</p>
          <p className="mt-1 text-amber-900/80 text-xs leading-relaxed">
            线索仅含基础信息；完整需求请通过深度测评或下方「编辑」填写。
          </p>
          <button
            type="button"
            onClick={() => navigateReq(supplementDeepEvalPath)}
            className="mt-3 inline-flex items-center gap-1 rounded-xl bg-[#EF6B00] text-white text-xs font-semibold px-4 py-2 hover:brightness-95"
          >
            前往深度测评补充信息
            <ChevronRight size={14} />
          </button>
        </div>
      ) : null}

      {/* 用 hidden 切换而非条件卸载，避免切回「用户需求」时正文不渲染或视口异常 */}
      <div
        className={showDocContent ? 'space-y-8' : 'hidden'}
        aria-hidden={!showDocContent}
      >
      <section className="space-y-4">
        <SectionTitle title="项目概览" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
                <FileText size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{projectName}</div>
                <div className="text-xs text-gray-500">概览信息</div>
              </div>
            </div>

            <div className="space-y-3">
              {isEditing && updateData && !useMock ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">项目城市</label>
                    <input value={d?.projectLocation ?? ''} onChange={(e) => updateData({ projectLocation: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="项目城市" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">项目类型</label>
                    <select value={d?.projectType ?? ''} onChange={(e) => updateData({ projectType: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                      <option value="">请选择</option>
                      {['独栋别墅', '平层公寓', '复式联排'].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">实际面积（㎡）</label>
                    <input type="number" value={d?.projectArea ?? ''} onChange={(e) => updateData({ projectArea: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="面积" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">预算范围</label>
                    <select value={d?.budgetStandard ?? ''} onChange={(e) => updateData({ budgetStandard: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                      <option value="">请选择</option>
                      {[
                        { value: 'A', label: '精工全案高定 (5,000 - 8,000)' },
                        { value: 'B', label: '豪华奢享方案 (8,000 - 12,000)' },
                        { value: 'C', label: '顶奢私享空间 (12,000 - 20,000)' },
                        { value: 'D', label: '艺术殿堂级定制 (20,000 以上)' },
                        { value: 'E', label: '了解更多高性价比方案' },
                      ].map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">入住周期</label>
                    <select value={d?.timeline ?? ''} onChange={(e) => updateData({ timeline: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                      <option value="">请选择</option>
                      {['3个月内', '3-6个月', '半年到一年', '一年以上'].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">房屋用途</label>
                    <select value={d?.houseUsage ?? ''} onChange={(e) => updateData({ houseUsage: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                      <option value="">请选择</option>
                      {['改善房', '刚需房', '投资房', '度假房/第二居所'].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {infoRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">{row.label}</div>
                      <div className="text-sm font-semibold text-gray-900">{row.value}</div>
                    </div>
                  ))}
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm text-gray-600 pt-1">房屋用途</div>
                    <div className="text-sm font-semibold text-gray-900">{displayHouseUsage}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
              <div className="font-semibold">项目现状（Q2-5）</div>
            </div>

            {isEditing && updateData && !useMock ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'lighting' as const, label: '采光', options: ['极佳，全天有阳光', '良好，半天有阳光', '一般，需要开灯', '较差，采光受限'] },
                  { key: 'ventilation' as const, label: '通风', options: ['南北通透', '通风良好', '单面通风', '通风较差'] },
                  { key: 'ceilingHeight' as const, label: '层高', options: ['2.8米以上 (宽敞)', '2.6-2.8米 (标准)', '2.6米以下 (偏低)'] },
                  { key: 'noise' as const, label: '噪音', options: ['非常安静', '偶有噪音', '临街/较吵', '非常吵闹'] },
                ].map(({ key, label, options }) => (
                  <div key={key} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                    <label className="text-xs text-gray-500 block mb-2">{label}</label>
                    <select value={d?.[key] ?? ''} onChange={(e) => updateData({ [key]: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                      <option value="">请选择</option>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statusCards.map((c) => (
                  <div key={c.title} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-5">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#FF9C3E]">
                        <c.icon size={18} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{c.title}</div>
                        <div className="mt-1 text-sm text-gray-600 truncate">{c.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title="空间规划（Q2-9）" />
        {(useMock || d?.coreSpaces || d?.childGrowth || d?.guestStay || d?.futureChanges || (isEditing && updateData && !useMock)) ? (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
              <div className="font-semibold">核心空间与规划</div>
            </div>
            {(() => {
              const customNames = d?.customCoreSpaceOptions ?? []
              const baseOptions = ['客厅', '餐厅', '开放厨房', '封闭厨房', '主卧室', '次卧室', '小孩卧室', '老人卧室', '主卫浴室', '公卫浴室', '次卫浴室', '书房', '花园']
              const parseCounts = (str: string): Record<string, number> => {
                const counts: Record<string, number> = {}
                if (!str?.trim()) return counts
                const re = /(\d+)([^\d]+)/g
                let m: RegExpExecArray | null
                while ((m = re.exec(str)) !== null) counts[m[2]] = parseInt(m[1], 10)
                return counts
              }
              const raw = useMock ? '1客厅1餐厅1主卧室1次卧室1主卫浴室1公卫浴室' : (d?.coreSpaces ?? '')
              const counts = parseCounts(raw)
              const fullOptionList = Array.from(new Set([...baseOptions, ...customNames, ...Object.keys(counts)]))
              const entries = fullOptionList.filter((k) => (counts[k] ?? 0) > 0).map((k) => ({ name: k, count: counts[k] ?? 0 }))
              const updateCoreCount = (name: string, val: number) => {
                if (!updateData || useMock) return
                const next = { ...counts, [name]: Math.max(0, val) }
                const newStr = fullOptionList.filter((k) => (next[k] ?? 0) > 0).map((k) => `${next[k]}${k}`).join('')
                updateData({ coreSpaces: newStr })
              }
              const addCustomSpaceOption = (newName: string) => {
                if (!updateData || useMock || !newName?.trim()) return
                const next = [...customNames, newName.trim()]
                updateData({ customCoreSpaceOptions: next })
              }
              const isEditable = isEditing && updateData && !useMock
              return (
                <>
                  {isEditable ? (
                    <div className="mb-5">
                      <div className="text-xs font-semibold text-gray-500 mb-3">核心空间（数量可改，可添加空间类型）</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {fullOptionList.map((name) => (
                          <div key={name} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900 truncate" title={name}>{name}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button type="button" onClick={() => updateCoreCount(name, Math.max(0, (counts[name] ?? 0) - 1))} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm font-bold" aria-label="减少">−</button>
                              <input type="number" min={0} max={9} value={counts[name] ?? 0} onChange={(e) => updateCoreCount(name, parseInt(e.target.value, 10) || 0)} className="w-10 h-8 rounded-xl border border-gray-200 px-1 py-0 text-center text-sm font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              <button type="button" onClick={() => updateCoreCount(name, (counts[name] ?? 0) + 1)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm font-bold" aria-label="增加">+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <AddSpaceTypeRow onAdd={addCustomSpaceOption} existingNames={fullOptionList} />
                    </div>
                  ) : entries.length > 0 ? (
                    <div className="mb-5">
                      <div className="text-xs font-semibold text-gray-500 mb-3">核心空间</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {entries.map(({ name, count }) => (
                          <div key={name} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900">{name}</span>
                            <span className="w-8 h-8 rounded-xl bg-[#FF9C3E]/10 text-[#C87800] flex items-center justify-center text-sm font-bold shrink-0">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              )
            })()}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <SectionTitle title="项目图纸与视频" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-10 h-10 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center shrink-0">
                  <ImageIcon size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-base font-semibold truncate">户型图（Q2-4）</div>
                  <div className="text-xs text-gray-500">支持多张图片上传并预览</div>
                </div>
              </div>
              {isEditing ? (
                <>
                  <label
                    htmlFor={planInputId}
                    className="shrink-0 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload size={16} className="text-gray-400" />
                    上传
                  </label>
                  <input
                    id={planInputId}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onPickPlanFiles(e.target.files)}
                  />
                </>
              ) : null}
            </div>

            {planImages.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400">
                  <ImageIcon size={18} />
                </div>
                <div className="mt-3 text-sm font-semibold text-gray-800">暂无</div>
                <div className="mt-1 text-sm text-gray-600">
                  {!isEditing ? '进入编辑模式后可上传户型图' : '可在此上传多张户型图'}
                </div>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {planImages.map((img, index) => (
                  <div key={`${img.name}-${index}`} className="relative group/card">
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm"
                      title={img.name}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-28 object-cover group-hover/card:scale-[1.01] transition-transform" />
                      <div className="px-3 py-2 text-[11px] text-gray-600 truncate">{img.name}</div>
                    </a>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setPlanImages((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 text-white text-xs flex items-center justify-center"
                        title="删除"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-10 h-10 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center shrink-0">
                  <Video size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-base font-semibold truncate">现场视频 / 照片（Q2-4）</div>
                  <div className="text-xs text-gray-500">支持图片/视频上传并预览</div>
                </div>
              </div>
              {isEditing ? (
                <>
                  <label
                    htmlFor={mediaInputId}
                    className="shrink-0 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload size={16} className="text-gray-400" />
                    上传
                  </label>
                  <input
                    id={mediaInputId}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onPickMediaFiles(e.target.files)}
                  />
                </>
              ) : null}
            </div>

            {mediaFiles.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400">
                  <Video size={18} />
                </div>
                <div className="mt-3 text-sm font-semibold text-gray-800">暂无</div>
                <div className="mt-1 text-sm text-gray-600">
                  {!isEditing ? '进入编辑模式后可上传现场视频或照片' : '可在此上传现场视频或照片'}
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {mediaFiles.map((f) => (
                  <a
                    key={f.url}
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3 hover:bg-white transition-colors"
                    title={f.name}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 shrink-0">
                        {f.kind === 'video' ? <Video size={18} /> : <ImageIcon size={18} />}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{f.name}</div>
                        <div className="text-xs text-gray-500">{f.kind === 'video' ? '视频' : '图片'}</div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SectionTitle title="成员画像（Q2-6 核心成员）" />
          {hasMemberData && !(isEditing && updateData && !useMock) ? (
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
              <Users size={14} className="text-gray-400" />
              <span className="font-semibold text-gray-400">Q2-6</span>
              <span className="text-gray-300">·</span>
              {personas.length} 位成员
            </div>
          ) : null}
        </div>

        {isEditing && updateData && !useMock ? (
          <div className="space-y-5">
            {membersEdit.map((member, memberIdx) => (
              <div key={member.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-w-0">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">角色</label>
                      <select
                        value={member.name}
                        onChange={(e) => {
                          setMembersEdit((prev) => {
                            const next = [...prev]
                            const newRole = e.target.value
                            const allowedSpaces =
                              ROLE_TO_ACTIVITY_OPTIONS[newRole] ?? MEMBER_ACTIVITY_SPACE_OPTIONS_FALLBACK
                            const allowedAges = ROLE_TO_AGE_OPTIONS[newRole] ?? MEMBER_AGE_OPTIONS_FALLBACK
                            const allowedProfs =
                              ROLE_TO_PROFESSION_OPTIONS[newRole] ?? MEMBER_PROFESSION_OPTIONS_FALLBACK
                            const m = next[memberIdx]
                            const spaces = (m.spaces ?? []).filter((s) => allowedSpaces.includes(s.name))
                            const age = m.age && allowedAges.includes(m.age) ? m.age : ''
                            const profession =
                              m.profession && allowedProfs.includes(m.profession) ? m.profession : ''
                            next[memberIdx] = { ...m, name: newRole, spaces, age, profession }
                            return next
                          })
                        }}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      >
                        <option value="">请选择角色</option>
                        {MEMBER_ROLE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">姓名（选填，展示用）</label>
                      <input
                        value={member.displayName ?? ''}
                        onChange={(e) => {
                          setMembersEdit((prev) => {
                            const next = [...prev]
                            next[memberIdx] = { ...next[memberIdx], displayName: e.target.value }
                            return next
                          })
                        }}
                        placeholder="如：张明远、二宝昵称等"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMembersEdit((prev) => prev.filter((_, i) => i !== memberIdx))}
                    className="shrink-0 p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="删除成员"
                    aria-label="删除成员"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">年龄段</label>
                    <select
                      value={
                        member.name &&
                        (ROLE_TO_AGE_OPTIONS[member.name] ?? []).includes(member.age ?? '')
                          ? (member.age ?? '')
                          : ''
                      }
                      disabled={!member.name}
                      onChange={(e) => {
                        setMembersEdit((prev) => {
                          const next = [...prev]
                          next[memberIdx] = { ...next[memberIdx], age: e.target.value }
                          return next
                        })
                      }}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">{member.name ? '请选择' : '请先选择角色'}</option>
                      {(member.name ? ROLE_TO_AGE_OPTIONS[member.name] ?? [] : []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">身份/职业</label>
                    <select
                      value={
                        member.name &&
                        (ROLE_TO_PROFESSION_OPTIONS[member.name] ?? []).includes(member.profession ?? '')
                          ? (member.profession ?? '')
                          : ''
                      }
                      disabled={!member.name}
                      onChange={(e) => {
                        setMembersEdit((prev) => {
                          const next = [...prev]
                          next[memberIdx] = { ...next[memberIdx], profession: e.target.value }
                          return next
                        })
                      }}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">{member.name ? '请选择' : '请先选择角色'}</option>
                      {(member.name ? ROLE_TO_PROFESSION_OPTIONS[member.name] ?? [] : []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {member.id === 'role' && (d?.styleName?.trim()) && (
                  <div className="mt-4 rounded-2xl border border-[#FF9C3E]/20 bg-[#FF9C3E]/5 p-4">
                    <div className="text-xs font-semibold text-gray-500 mb-1">风格人格（本人做的测评）</div>
                    <div className="text-sm font-semibold text-[#C87800]">{d.styleName}</div>
                  </div>
                )}
                <div className="mt-4 rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                  <div className="text-xs font-semibold text-gray-700 mb-2">
                    主要活动及空间{member.name ? `（与「${member.name}」匹配的选项）` : '（请先选择角色）'}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(ROLE_TO_ACTIVITY_OPTIONS[member.name] ?? MEMBER_ACTIVITY_SPACE_OPTIONS_FALLBACK).map((spaceName) => {
                      const selected = (member.spaces ?? []).some((s) => s.name === spaceName)
                      return (
                        <button
                          key={spaceName}
                          type="button"
                          onClick={() => {
                            setMembersEdit((prev) => {
                              const next = [...prev]
                              const spaces = next[memberIdx].spaces ?? []
                              if (selected) next[memberIdx] = { ...next[memberIdx], spaces: spaces.filter((s) => s.name !== spaceName) }
                              else next[memberIdx] = { ...next[memberIdx], spaces: [...spaces, { name: spaceName }] }
                              return next
                            })
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${selected ? 'border-[#FF9C3E]/30 bg-[#FF9C3E]/10 text-[#C87800]' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'}`}
                        >
                          {selected ? <span className="w-4 h-4 rounded border-2 border-[#FF9C3E] bg-[#FF9C3E] flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-sm bg-white" /></span> : <span className="w-4 h-4 rounded border border-gray-200" />}
                          {spaceName}
                        </button>
                      )
                    })}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">其他说明</label>
                    <input
                      value={member.otherActivityNote ?? ''}
                      onChange={(e) => {
                        setMembersEdit((prev) => {
                          const next = [...prev]
                          next[memberIdx] = { ...next[memberIdx], otherActivityNote: e.target.value }
                          return next
                        })
                      }}
                      placeholder="可补充该成员的其他活动或空间需求..."
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setMembersEdit((prev) => [
                  ...prev,
                  {
                    id: `custom-${Date.now()}`,
                    name: '',
                    displayName: '',
                    age: '',
                    profession: '',
                    spaces: [],
                    otherActivityNote: '',
                  },
                ])
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 py-4 text-sm font-medium text-gray-600 hover:bg-[#FFFDF3] hover:border-[#FF9C3E]/30 transition-colors"
            >
              <Plus size={18} />
              添加成员
            </button>
          </div>
        ) : hasMemberData ? (
          <>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {personas.map((p, pi) => (
                <div
                  key={p.personaKey ?? `chip-${pi}`}
                  className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 shadow-sm px-3 py-2 text-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-[#FF9C3E]/10 text-[#C87800] flex items-center justify-center font-bold">
                    {p.name.slice(0, 1)}
                  </span>
                  <span className="flex flex-col items-start min-w-0">
                    <span className="font-semibold text-gray-800 truncate max-w-[8rem]">{p.name}</span>
                    {p.roleTag ? (
                      <span className="text-[10px] text-amber-800/90 font-medium">{p.roleTag}</span>
                    ) : null}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-600 shrink-0">{p.age}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {personas.map((p, pi) => (
                <div key={p.personaKey ?? `card-${pi}`} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-base font-semibold text-gray-900 truncate">{p.name}</div>
                      {p.roleTag ? (
                        <div className="mt-1 inline-flex items-center rounded-lg bg-amber-50 border border-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                          角色 · {p.roleTag}
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2 min-w-0 mt-2">
                        <div className="text-sm font-semibold text-gray-700 shrink-0">{p.age}</div>
                        {p.profession ? (
                          <>
                            <span className="text-xs text-gray-300">·</span>
                            <div className="text-sm text-gray-600 truncate">{p.profession}</div>
                          </>
                        ) : null}
                      </div>
                      {p.height ? (
                        <div className="mt-1 text-sm text-gray-600">
                          身高 {p.height}
                        </div>
                      ) : null}

                      {p.isStyleTaker && (useMock ? p.stylePersona : d?.styleName?.trim()) ? (
                        <div className="mt-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FF9C3E]/10 text-[#C87800]">
                            风格人格：{useMock ? p.stylePersona : d?.styleName}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <span className="w-10 h-10 rounded-2xl bg-[#FFFDF3] border border-gray-100 flex items-center justify-center text-gray-500 font-bold">
                      {p.name.slice(0, 1)}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                    <div className="text-xs font-semibold text-gray-700">主要活动及空间</div>
                    <ul className="mt-2 text-sm text-gray-600 leading-relaxed space-y-2">
                      {p.mainActivitiesAndSpaces.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    {p.otherActivityNote?.trim() ? (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-sm text-gray-600">
                        <span className="font-semibold text-gray-700">其他说明：</span>{p.otherActivityNote}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400">
              <Users size={18} />
            </div>
            <div className="mt-3 text-sm font-semibold text-gray-800">暂无成员信息</div>
            <div className="mt-1 text-sm text-gray-600">
              请先完成深度测评中的「核心成员」（Q2-6）与「家庭成员」（Q2-6-1），或进入编辑模式直接添加成员。
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle title="全屋需求" />

        <div className="space-y-5">
          {/* 系统设备 */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
                  <Wrench size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">系统设备</div>
                  <div className="text-xs text-gray-500">Q2-19 选项结果</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isEditing && updateData && !useMock ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {systemEquipments.map((x) => {
                    const checked = comfortSystemsEdit.includes(x.title)
                    return (
                      <button
                        key={x.key}
                        type="button"
                        onClick={() => {
                          setComfortSystemsEdit((prev) =>
                            checked ? prev.filter((t) => t !== x.title) : [...prev, x.title]
                          )
                        }}
                        className={`flex items-center gap-3 rounded-2xl border p-5 text-left transition-colors ${
                          checked ? 'border-[#FF9C3E]/30 bg-[#FF9C3E]/10' : 'border-gray-100 bg-[#FFFDF3] hover:bg-white'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${checked ? 'bg-[#FF9C3E] border-[#FF9C3E]' : 'bg-white border-gray-200'}`} aria-hidden="true">
                          {checked ? <span className="w-2.5 h-2.5 rounded-sm bg-white" /> : null}
                        </span>
                        <span className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#FF9C3E] shrink-0">
                          <x.icon size={18} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{x.title}</div>
                          <div className="mt-1 text-xs text-gray-500 truncate">{x.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : displayComfortLabels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {systemEquipments.filter((x) => displayComfortLabels.includes(x.title)).map((x) => (
                    <div key={x.key} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-5">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#FF9C3E] shrink-0">
                          <x.icon size={18} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{x.title}</div>
                          <div className="mt-1 text-xs text-gray-500 truncate">{x.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  暂无，请先完成深度测评（Q2-19）
                </div>
              )}
            </div>
          </div>

          {/* 智能家居系统 */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
                  <Sparkles size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">智能家居系统</div>
                  <div className="text-xs text-gray-500">Q2-18 选项结果</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {smartHomeOptions.map((o) => {
                    const checked = !!smartHomeSelected[o.key]
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setSmartHomeSelected((prev) => ({ ...prev, [o.key]: !prev[o.key] }))}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                          checked ? 'border-[#FF9C3E]/30 bg-[#FF9C3E]/10' : 'border-gray-100 bg-[#FFFDF3] hover:bg-white'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            checked ? 'bg-[#FF9C3E] border-[#FF9C3E]' : 'bg-white border-gray-200'
                          }`}
                          aria-hidden="true"
                        >
                          {checked ? <span className="w-2.5 h-2.5 rounded-sm bg-white" /> : null}
                        </span>
                        <span className="w-9 h-9 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 shrink-0">
                          <o.icon size={18} className={checked ? 'text-[#FF9C3E]' : 'text-gray-500'} />
                        </span>
                        <div className="text-sm font-semibold text-gray-800">{o.label}</div>
                      </button>
                    )
                  })}
                </div>
              ) : displaySmartHomeLabels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {smartHomeOptions.filter((o) => displaySmartHomeLabels.includes(o.label)).map((o) => (
                    <div key={o.key} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3">
                      <span className="w-9 h-9 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 shrink-0">
                        <o.icon size={18} className="text-[#FF9C3E]" />
                      </span>
                      <div className="text-sm font-semibold text-gray-800">{o.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  暂无，请先完成深度测评（Q2-18）
                </div>
              )}
            </div>
          </div>

          {/* 特殊设备需求 */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
                  <Package size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">全屋设备需求</div>
                  <div className="text-xs text-gray-500">Q2-20 选项结果</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {specialDeviceOptions.map((o) => {
                    const checked = !!specialDeviceSelected[o.key]
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setSpecialDeviceSelected((prev) => ({ ...prev, [o.key]: !prev[o.key] }))}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                          checked ? 'border-[#FF9C3E]/30 bg-[#FF9C3E]/10' : 'border-gray-100 bg-[#FFFDF3] hover:bg-white'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            checked ? 'bg-[#FF9C3E] border-[#FF9C3E]' : 'bg-white border-gray-200'
                          }`}
                          aria-hidden="true"
                        >
                          {checked ? <span className="w-2.5 h-2.5 rounded-sm bg-white" /> : null}
                        </span>
                        <span className="w-9 h-9 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 shrink-0">
                          <o.icon size={18} className={checked ? 'text-[#FF9C3E]' : 'text-gray-500'} />
                        </span>
                        <div className="text-sm font-semibold text-gray-800">{o.label}</div>
                      </button>
                    )
                  })}
                </div>
              ) : displayDeviceLabels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {specialDeviceOptions.filter((o) => displayDeviceLabels.includes(o.label)).map((o) => (
                    <div key={o.key} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3">
                      <span className="w-9 h-9 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 shrink-0">
                        <o.icon size={18} className="text-[#FF9C3E]" />
                      </span>
                      <div className="text-sm font-semibold text-gray-800">{o.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  暂无，请先完成深度测评（Q2-20）
                </div>
              )}
            </div>
          </div>

          {/* 风水要求（Q2-17） */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
                  <Compass size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">风水要求</div>
                  <div className="text-xs text-gray-500">Q2-17 选项结果</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isEditing && updateData && !useMock ? (
                <select
                  value={fengshuiEdit}
                  onChange={(e) => setFengshuiEdit(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#FFFDF3] px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#FF9C3E]/20"
                >
                  <option value="">请选择</option>
                  {[...FENGSHUI_OPTIONS, (fengshuiEdit?.trim() && !FENGSHUI_OPTIONS.includes(fengshuiEdit)) ? fengshuiEdit : null].filter(Boolean).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (useMock && fengshuiResult) || (d?.fengshui?.trim()) ? (
                <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 text-sm text-gray-700 leading-relaxed">
                  {fengshuiResult}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  暂无，请先完成深度测评（Q2-17）
                </div>
              )}
            </div>
          </div>

          {/* 收纳重点（Q2-14） */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
                  <Archive size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">收纳重点</div>
                  <div className="text-xs text-gray-500">Q2-14 选项结果</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isEditing && updateData && !useMock ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {STORAGE_FOCUS_OPTIONS.map((opt) => {
                    const checked = storageFocusEdit.includes(opt)
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setStorageFocusEdit((prev) =>
                            checked ? prev.filter((t) => t !== opt) : [...prev, opt]
                          )
                        }}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                          checked ? 'border-[#FF9C3E]/30 bg-[#FF9C3E]/10' : 'border-gray-100 bg-[#FFFDF3] hover:bg-white'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${checked ? 'bg-[#FF9C3E] border-[#FF9C3E]' : 'bg-white border-gray-200'}`} aria-hidden="true">
                          {checked ? <span className="w-2.5 h-2.5 rounded-sm bg-white" /> : null}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              ) : storageFocusResult.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {storageFocusResult.map((it) => (
                    <div key={it} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3 text-sm font-semibold text-gray-800">
                      {it}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  暂无，请先完成深度测评（Q2-14）
                </div>
              )}
            </div>
          </div>

          {/* 个性化定制说明 */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900">个性化定制说明</div>
              <div className="text-xs text-gray-500">Q2-16 底线与妥协 · Q2-21 其他需求</div>
            </div>
            <div className="p-6">
              {isEditing ? (
                <textarea
                  value={customNeedsNote}
                  onChange={(e) => setCustomNeedsNote(e.target.value)}
                  placeholder="请输入其他补充需求..."
                  className="w-full min-h-[140px] rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FF9C3E]/20"
                />
              ) : (() => {
                const fromData = !useMock && (
                  (d?.otherNeeds?.trim()) ||
                  (Array.isArray(d?.bottomLine) && d.bottomLine.length > 0)
                )
                const displayText = useMock
                  ? '其他补充：希望儿童房预留成长空间。\n\n底线与妥协：\n• 绝对要环保（哪怕多花钱，也要进场就能住，没味儿、没甲醛）\n• 收纳够强大（空间利用率要高，东西放得下、找得到）'
                  : fromData
                    ? [
                        d?.otherNeeds?.trim(),
                        (d?.bottomLine ?? []).length
                          ? '\n\n底线与妥协：\n' + (d.bottomLine as string[]).map((b) => '• ' + b).join('\n')
                          : '',
                      ].filter(Boolean).join('')
                    : ''
                return displayText.trim() ? (
                  <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {displayText}
                  </div>
                ) : customNeedsNote.trim() ? (
                  <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {customNeedsNote}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                    暂无
                    <div className="mt-1 text-xs text-gray-500">进入编辑模式后可补充说明，或完成 Q2-16、Q2-21 自动生成</div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title="空间需求" />

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
              <div className="font-semibold">
                {activeSpace.title}
                <span className="ml-2 text-xs font-semibold text-gray-500">（{activeSpace.q}）</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-[#FFFDF3] p-1 border border-gray-100 flex-wrap">
              {spaceTabsList.map((tab) => (
                <React.Fragment key={tab.key}>
                  <TabPill active={spaceTab === tab.key} onClick={() => setSpaceTab(tab.key)}>
                    {tab.label}
                  </TabPill>
                </React.Fragment>
              ))}
              {isEditing && updateData && !useMock && (
                <button type="button" onClick={() => { const len = customSpaceItemsEdit.length; setCustomSpaceItemsEdit((prev) => [...prev, { name: '', description: '' }]); setSpaceTab(`custom-${len}`) }} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-white hover:border-[#FF9C3E]/30 transition-colors">
                  <Plus size={14} /> 添加空间
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 rounded-2xl border border-gray-100 bg-[#FFFDF3] p-5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#FF9C3E]">
                <activeSpace.icon size={18} />
              </div>
              <div className="mt-3 text-sm font-semibold text-gray-900">需求说明</div>
              {isEditing && updateData && !useMock ? (
                <textarea
                  value={spaceTab.startsWith('custom-') ? (customSpaceItemsEdit[parseInt(spaceTab.replace('custom-', ''), 10)]?.description ?? '') : (spaceTab === 'living' ? (d?.livingRoomNote ?? '') : spaceTab === 'dining' ? (d?.diningNote ?? '') : spaceTab === 'kitchen' ? (d?.kitchenNote ?? '') : (d?.bathroomNote ?? ''))}
                  onChange={(e) => {
                    if (spaceTab.startsWith('custom-')) {
                      const i = parseInt(spaceTab.replace('custom-', ''), 10)
                      setCustomSpaceItemsEdit((prev) => { const n = [...prev]; n[i] = { ...n[i], description: e.target.value }; return n })
                    } else {
                      const key = spaceTab === 'living' ? 'livingRoomNote' : spaceTab === 'dining' ? 'diningNote' : spaceTab === 'kitchen' ? 'kitchenNote' : 'bathroomNote'
                      updateData({ [key]: e.target.value })
                    }
                  }}
                  placeholder="填写该空间的需求说明..."
                  className="mt-2 w-full min-h-[100px] rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400"
                />
              ) : (
                <div className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {currentSpaceNote?.trim() || '本区聚焦该空间的关键使用方式与容量预期，便于后续方案与设备位落地。'}
                </div>
              )}
            </div>
            <div className="md:col-span-2 space-y-3">
              {isEditing && updateData && !useMock ? (
                (() => {
                  if (spaceTab === 'living') {
                    const current = d?.livingRoomFeature ?? []
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(LIVING_LABELS).map(([id, label]) => {
                          const checked = current.includes(id)
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => updateData({ livingRoomFeature: checked ? current.filter((x) => x !== id) : [...current, id] })}
                              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${checked ? 'border-[#FF9C3E]/30 bg-[#FF9C3E]/10' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                            >
                              <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${checked ? 'bg-[#FF9C3E] border-[#FF9C3E]' : 'border-gray-200'}`} aria-hidden="true">
                                {checked ? <span className="w-2.5 h-2.5 rounded-sm bg-white" /> : null}
                              </span>
                              <span className="text-sm font-medium text-gray-800">{label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )
                  }
                  if (spaceTab === 'dining') {
                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-500 block mb-2">平时就餐人数</label>
                          <div className="flex flex-wrap gap-2">
                            {['1-2人', '3-4人', '5-6人', '6人以上'].map((opt) => (
                              <button key={opt} type="button" onClick={() => updateData({ diningCount: opt })} className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${d?.diningCount === opt ? 'border-[#FF9C3E] bg-[#FF9C3E]/10 text-[#C87800]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>{opt}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-2">节假日最多人数</label>
                          <div className="flex flex-wrap gap-2">
                            {['4-6人', '7-10人', '10人以上'].map((opt) => (
                              <button key={opt} type="button" onClick={() => updateData({ festivalDiningCount: opt })} className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${d?.festivalDiningCount === opt ? 'border-[#FF9C3E] bg-[#FF9C3E]/10 text-[#C87800]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>{opt}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  }
                  if (spaceTab === 'kitchen') {
                    return (
                      <div className="space-y-4">
                        <div><label className="text-xs text-gray-500 block mb-1">烹饪习惯</label><select value={d?.cookingHabit ?? ''} onChange={(e) => updateData({ cookingHabit: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value="">请选择</option>{Object.entries(COOKING_HABIT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                        <div><label className="text-xs text-gray-500 block mb-1">第二厨房</label><select value={d?.secondKitchen ?? ''} onChange={(e) => updateData({ secondKitchen: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value="">请选择</option>{Object.entries(SECOND_KITCHEN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                      </div>
                    )
                  }
                  if (spaceTab === 'bathroom') {
                    return (
                      <div><label className="text-xs text-gray-500 block mb-1">干湿分离</label><select value={d?.dryWetSeparation ?? ''} onChange={(e) => updateData({ dryWetSeparation: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value="">请选择</option>{Object.entries(DRY_WET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                    )
                  }
                  if (spaceTab.startsWith('custom-')) {
                    const customIdx = parseInt(spaceTab.replace('custom-', ''), 10)
                    const item = customSpaceItemsEdit[customIdx]
                    if (item == null) {
                      return (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                          该空间不存在，请切换到其他页或点击「添加空间」
                        </div>
                      )
                    }
                    return (
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-start rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                        <div className="flex-1 min-w-0">
                          <label className="text-xs text-gray-500 block mb-2">空间名称（与核心空间一致）</label>
                          <select value={item.name} onChange={(e) => setCustomSpaceItemsEdit((prev) => { const n = [...prev]; n[customIdx] = { ...n[customIdx], name: e.target.value }; return n })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                            <option value="">请选择</option>
                            {CORE_SPACE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <p className="mt-2 text-xs text-gray-500">需求说明请在左侧「需求说明」中填写</p>
                        </div>
                        <button type="button" onClick={() => { const nextList = customSpaceItemsEdit.filter((_, i) => i !== customIdx); setCustomSpaceItemsEdit(nextList); setSpaceTab(nextList.length === 0 ? 'living' : 'custom-0') }} className="shrink-0 p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600" title="删除" aria-label="删除"><Trash2 size={16} /></button>
                      </div>
                    )
                  }
                  return null
                })()
              ) : activeSpaceItems.length > 0 ? (
                activeSpaceItems.map((it, idx) => (
                  <div key={it} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                    <span className="w-8 h-8 rounded-2xl bg-[#FF9C3E]/10 text-[#C87800] flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div className="text-sm text-gray-700 leading-relaxed">{it}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  {spaceTab.startsWith('custom-') ? '暂无需求说明，进入编辑模式可在左侧填写' : `暂无，请先完成深度测评（${activeSpace.q}）`}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="text-sm font-semibold text-gray-900">其他说明</div>
            {isEditing ? (
              <textarea
                value={spaceOtherNote}
                onChange={(e) => setSpaceOtherNote(e.target.value)}
                placeholder="可补充该空间的其他偏好、禁忌或设备位要求..."
                className="mt-3 w-full min-h-[110px] rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FF9C3E]/20"
              />
            ) : (d?.spaceOtherNote?.trim() || spaceOtherNote.trim()) ? (
              <div className="mt-3 rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {d?.spaceOtherNote?.trim() || spaceOtherNote}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                暂无
                <div className="mt-1 text-xs text-gray-500">进入编辑模式后可补充说明</div>
              </div>
            )}
          </div>
        </div>
      </section>
      </div>

      {showRevisionTabs ? (
      <section
        className={`rounded-3xl border border-gray-100 bg-white shadow-sm p-6 md:p-8 min-h-[280px] ${
          requirementsDocPage === 'revisions' ? '' : 'hidden'
        }`}
      >
        <SectionTitle title="需求变更与修订记录" />

        {/* 第一板块：时间轴 — 客户每次修改并确认的快照节点 */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">修订时间轴</h3>
          <p className="text-xs text-gray-500 mb-4">
            从左到右按时间递进（最新在右侧）；每个节点只展示<strong>时间</strong>与<strong>快照</strong>，点击查看该次保存后的需求书快照。
          </p>
          {revisions.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm rounded-xl border border-dashed border-gray-200">
              暂无修订记录。有内容变更并完成编辑后，将自动登记修订与快照。
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <div className="relative px-2 pb-2">
                <div className="absolute left-0 right-0 top-4 h-px bg-amber-200/80" aria-hidden />
                <div className="flex items-start gap-6">
                  {[...revisionsPageSlice].reverse().map((r) => (
                    <div key={r.id} className="relative flex-shrink-0 w-[220px]">
                      <div className="flex flex-col items-center">
                        <span
                          className="mt-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white border border-amber-600/30"
                          aria-hidden
                        />
                        <div className="mt-3 text-xs text-gray-500 whitespace-nowrap">{r.date}</div>
                        <button
                          type="button"
                          onClick={() => setSnapshotModalEntry(r)}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-[#C87800] hover:bg-[#FFF4E0] transition-colors"
                        >
                          <Eye size={14} />
                          查看快照
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {revisions.length > REVISIONS_PAGE_SIZE ? (
            <RevisionTablePagination
              page={revisionTablePage}
              totalPages={revisionTotalPages}
              pageSize={REVISIONS_PAGE_SIZE}
              total={revisions.length}
              onPageChange={setRevisionTablePage}
            />
          ) : null}
        </div>

        {/* 第二板块：详细变更记录 — 每条可展开查看变更前/变更后 */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">详细变更记录</h3>
          <p className="text-xs text-gray-500 mb-4">
            每条记录包含更新人、更新概要；点击展开后会按模块拆分卡片，左右展示<strong>变更前</strong>与<strong>变更后</strong>，便于逐项对比。
          </p>
          {revisions.length === 0 ? null : (
            <div className="space-y-2">
              {revisionsPageSlice.map((r, idx) => {
                const fullIndex = (revisionTablePage - 1) * REVISIONS_PAGE_SIZE + idx
                const prevRevision = revisions[fullIndex + 1]

                const isExpanded = expandedRevisionId === r.id
                const beforeDetailText = r.changeDetailBefore?.trim() ? r.changeDetailBefore : undefined
                const afterDetailText = r.changeDetailAfter?.trim() ? r.changeDetailAfter : undefined
                const hasDetail = Boolean(beforeDetailText || afterDetailText || r.docSnapshotJson?.trim())

                // 只在展开时解析快照，避免无展开时的重复计算。
                const afterFd = isExpanded ? parseDocSnapshotJson(r.docSnapshotJson) : null
                const beforeFd = isExpanded && prevRevision?.docSnapshotJson?.trim()
                  ? parseDocSnapshotJson(prevRevision.docSnapshotJson)
                  : null
                const afterPayload = afterFd ? requirementPayloadFromFormData(afterFd) : null
                const beforePayload = beforeFd ? requirementPayloadFromFormData(beforeFd) : null

                const ALL_DIFF_LABELS_IN_ORDER = [
                  '项目概览',
                  '空间规划',
                  '智能家居',
                  '全屋设备',
                  '系统设备',
                  '收纳重点',
                  '其他需求说明',
                  '风水与禁忌',
                  '空间其他说明',
                  '客厅需求',
                  '餐厅需求',
                  '厨房需求',
                  '卫生间需求',
                  '核心空间配置',
                  '自定义核心空间',
                  '儿童成长',
                  '访客留宿',
                  '未来变动',
                  '成员画像',
                  '户型图',
                  '现场照片/视频',
                  '自定义空间需求',
                ] as const

                const listNormalize = (arr?: string[]) => (arr ?? []).map((x) => String(x ?? '').trim()).filter(Boolean)

                const hasAfterNonEmpty = (label: string): boolean => {
                  if (!afterPayload) return false
                  switch (label) {
                    case '项目概览':
                      return (
                        (afterPayload.projectLocation ?? '').trim().length > 0 ||
                        (afterPayload.projectType ?? '').trim().length > 0 ||
                        (afterPayload.projectArea ?? '').trim().length > 0 ||
                        (afterPayload.budgetStandard ?? '').trim().length > 0 ||
                        (afterPayload.timeline ?? '').trim().length > 0 ||
                        (afterPayload.houseUsage ?? '').trim().length > 0 ||
                        (afterPayload.lighting ?? '').trim().length > 0 ||
                        (afterPayload.ventilation ?? '').trim().length > 0 ||
                        (afterPayload.ceilingHeight ?? '').trim().length > 0 ||
                        (afterPayload.noise ?? '').trim().length > 0
                      )
                    case '空间规划':
                      return (
                        (afterPayload.coreSpaces ?? '').trim().length > 0 ||
                        listNormalize(afterPayload.customCoreSpaceOptions).length > 0 ||
                        (afterPayload.childGrowth ?? '').trim().length > 0 ||
                        (afterPayload.guestStay ?? '').trim().length > 0 ||
                        (afterPayload.futureChanges ?? '').trim().length > 0
                      )
                    case '智能家居':
                      return listNormalize(afterPayload.smartHomeOptions).length > 0
                    case '全屋设备':
                      return listNormalize(afterPayload.devices).length > 0
                    case '系统设备':
                      return listNormalize(afterPayload.comfortSystems).length > 0
                    case '收纳重点':
                      return listNormalize(afterPayload.storageFocus).length > 0
                    case '其他需求说明':
                      return (afterPayload.otherNeeds ?? '').trim().length > 0
                    case '风水与禁忌':
                      return (afterPayload.fengshui ?? '').trim().length > 0
                    case '空间其他说明':
                      return (afterPayload.spaceOtherNote ?? '').trim().length > 0
                    case '客厅需求':
                      return (afterPayload.livingRoomNote ?? '').trim().length > 0
                    case '餐厅需求':
                      return (afterPayload.diningNote ?? '').trim().length > 0
                    case '厨房需求':
                      return (afterPayload.kitchenNote ?? '').trim().length > 0
                    case '卫生间需求':
                      return (afterPayload.bathroomNote ?? '').trim().length > 0
                    case '核心空间配置':
                      return (afterPayload.coreSpaces ?? '').trim().length > 0
                    case '自定义核心空间':
                      return listNormalize(afterPayload.customCoreSpaceOptions).length > 0
                    case '儿童成长':
                      return (afterPayload.childGrowth ?? '').trim().length > 0
                    case '访客留宿':
                      return (afterPayload.guestStay ?? '').trim().length > 0
                    case '未来变动':
                      return (afterPayload.futureChanges ?? '').trim().length > 0
                    case '成员画像':
                      return (afterPayload.requirementsMembers ?? []).length > 0
                    case '户型图':
                      return (afterPayload.floorPlanImages ?? []).length > 0
                    case '现场照片/视频':
                      return (afterPayload.siteMedia ?? []).length > 0
                    case '自定义空间需求':
                      return (afterPayload.customSpaceItems ?? []).length > 0
                    default:
                      return false
                  }
                }

                const diffLabels = getDiffLabelsFromPayloads(
                  beforePayload ?? null,
                  afterPayload ?? null,
                  ALL_DIFF_LABELS_IN_ORDER,
                  hasAfterNonEmpty,
                )

                const renderTextValue = (value: string | undefined) => {
                  const v = String(value ?? '').trim()
                  return v ? (
                    <div className="whitespace-pre-wrap break-words text-xs text-gray-700 leading-relaxed max-h-28 overflow-y-auto font-sans">
                      {v}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">无</div>
                  )
                }

                const renderListColumn = ({
                  before,
                  after,
                  mode,
                }: {
                  before: string[]
                  after: string[]
                  mode: 'before' | 'after'
                }) => {
                  const beforeNorm = before
                  const afterNorm = after
                  const beforeSet = new Set(beforeNorm)
                  const afterSet = new Set(afterNorm)
                  if (mode === 'before') {
                    if (!beforeNorm.length) return <div className="text-xs text-gray-400">无</div>
                    return (
                      <div className="space-y-1">
                        {beforeNorm.map((it) => {
                          return (
                            <div
                              key={`b-${it}`}
                              className="text-xs leading-relaxed text-gray-800"
                            >
                              {it}
                            </div>
                          )
                        })}
                      </div>
                    )
                  }
                  if (!afterNorm.length) return <div className="text-xs text-gray-400">无</div>
                  return (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        {afterNorm.map((it) => {
                          const added = !beforeSet.has(it)
                          return (
                            <div
                              key={`a-${it}`}
                              className={`text-xs leading-relaxed ${
                                added ? 'text-emerald-700 font-semibold' : 'text-gray-800'
                              }`}
                            >
                            {added ? '+ ' : null}
                              {it}
                            </div>
                          )
                        })}
                      </div>

                      {/* 变更后不存在的：在右侧以删除样式展示 */}
                      {beforeNorm.length > 0 ? (
                        <div className="pt-1">
                          <div className="space-y-1">
                            {beforeNorm
                              .filter((it) => !afterSet.has(it))
                              .map((it) => (
                                <div
                                  key={`d-${it}`}
                                  className="text-xs leading-relaxed text-red-600 line-through"
                                >
                                  - {it}
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                }

                /** 空间项转为可比较字符串 */
                const spaceToKey = (s: { name?: string; description?: string }) =>
                  `${String(s?.name ?? '').trim()}|${String(s?.description ?? '').trim()}`
                const renderMembersColumn = (
                  members?: RequirementsMember[],
                  opts?: {
                    highlightIds?: Set<string>
                    nameClassNameWhenHighlighted?: string
                    /** 变更前成员 Map(id -> member)，用于在变更后列对同一成员的选项做红/绿对比 */
                    beforeMemberMap?: Map<string, RequirementsMember>
                  },
                ) => {
                  const list = members ?? []
                  if (!list.length) return <div className="text-xs text-gray-400">无</div>
                  const highlightIds = opts?.highlightIds ?? new Set<string>()
                  const nameClassWhenHighlighted = opts?.nameClassNameWhenHighlighted ?? 'text-emerald-700'
                  const beforeMemberMap = opts?.beforeMemberMap

                  return (
                    <div className="space-y-3">
                      {list.map((m) => {
                        const isNewMember = highlightIds.has(m.id)
                        const before = beforeMemberMap?.get(m.id)
                        const isFieldDiff = Boolean(before && !isNewMember)

                        const detailTextClass = isNewMember ? 'text-emerald-700' : 'text-gray-600'
                        const spaceTextClass = isNewMember ? 'text-emerald-700' : 'text-gray-700'
                        const subtleTextClass = isNewMember ? 'text-emerald-600' : 'text-gray-500'

                        const trim = (v?: string) => String(v ?? '').trim()
                        const nameChanged = isFieldDiff && trim(before!.name) !== trim(m.name)
                        const displayNameChanged = isFieldDiff && trim(before!.displayName) !== trim(m.displayName)
                        const ageChanged = isFieldDiff && trim(before!.age) !== trim(m.age)
                        const professionChanged = isFieldDiff && trim(before!.profession) !== trim(m.profession)
                        const otherNoteChanged = isFieldDiff && trim(before!.otherActivityNote) !== trim(m.otherActivityNote)
                        const beforeSpaceKeys = new Set((before?.spaces ?? []).map(spaceToKey))
                        const afterSpaceKeys = new Set((m.spaces ?? []).map(spaceToKey))
                        const afterSpaces = m.spaces ?? []
                        const removedSpaces = (before?.spaces ?? []).filter((s) => !afterSpaceKeys.has(spaceToKey(s)))

                        return (
                          <div key={m.id} className="space-y-1">
                            <div
                              className={`text-xs font-semibold leading-snug ${
                                isNewMember ? nameClassWhenHighlighted : 'text-gray-900'
                              }`}
                            >
                              {isNewMember ? '+ ' : null}
                              {isFieldDiff && nameChanged ? (
                                <span>
                                  <span className="text-red-600 line-through">- {trim(before!.name)}</span>
                                  {trim(before!.name) && trim(m.name) ? ' ' : null}
                                  <span className="text-emerald-700 font-semibold">+ {trim(m.name)}</span>
                                </span>
                              ) : (
                                m.name
                              )}
                              {isFieldDiff && displayNameChanged ? (
                                <span className="font-normal">
                                  {trim(before!.displayName) ? (
                                    <span className="text-red-600 line-through">（{trim(before!.displayName)}）</span>
                                  ) : null}
                                  {trim(m.displayName) ? (
                                    <span className="text-emerald-700">（{trim(m.displayName)}）</span>
                                  ) : null}
                                </span>
                              ) : m.displayName?.trim() ? (
                                <span className={`${subtleTextClass} font-normal`}>（{m.displayName.trim()}）</span>
                              ) : null}
                            </div>

                            {(m.age?.trim() || m.profession?.trim() || (isFieldDiff && (ageChanged || professionChanged))) ? (
                              <div className={`text-[11px] ${isNewMember ? detailTextClass : ''} leading-relaxed`}>
                                {isFieldDiff && ageChanged ? (
                                  <span>
                                    <span className="text-red-600 line-through">年龄：{trim(before!.age) || '无'}</span>
                                    {' '}
                                    <span className="text-emerald-700 font-medium">年龄：{trim(m.age) || '无'}</span>
                                  </span>
                                ) : m.age?.trim() ? (
                                  <span className={isNewMember ? detailTextClass : 'text-gray-600'}>年龄：{m.age.trim()}</span>
                                ) : null}
                                {isFieldDiff && (ageChanged || professionChanged) && (m.age?.trim() || m.profession?.trim()) ? ' · ' : null}
                                {!isFieldDiff && m.age?.trim() && m.profession?.trim() ? ' · ' : null}
                                {isFieldDiff && professionChanged ? (
                                  <span>
                                    <span className="text-red-600 line-through">身份/职业：{trim(before!.profession) || '无'}</span>
                                    {' '}
                                    <span className="text-emerald-700 font-medium">身份/职业：{trim(m.profession) || '无'}</span>
                                  </span>
                                ) : m.profession?.trim() ? (
                                  <span className={isNewMember ? detailTextClass : 'text-gray-600'}>身份/职业：{m.profession.trim()}</span>
                                ) : null}
                              </div>
                            ) : null}

                            {afterSpaces.length > 0 || (isFieldDiff && removedSpaces.length > 0) ? (
                              <div className={`text-xs ${isNewMember ? spaceTextClass : ''} leading-relaxed`}>
                                <div className={`text-[11px] ${subtleTextClass} mb-1`}>空间：</div>
                                <div className="space-y-1">
                                  {afterSpaces.map((s, i2) => {
                                    const added = isFieldDiff && !beforeSpaceKeys.has(spaceToKey(s))
                                    return (
                                      <div key={`${m.id}-s-${i2}`} className="flex gap-2">
                                        <span className="text-gray-400 shrink-0">{added ? '+' : '-'}</span>
                                        <span className={added ? 'text-emerald-700 font-medium' : ''}>
                                          {added ? ' ' : null}
                                          {s.name}
                                          {s.description?.trim() ? (
                                            <span className={subtleTextClass}>（{s.description.trim()}）</span>
                                          ) : null}
                                        </span>
                                      </div>
                                    )
                                  })}
                                  {isFieldDiff && removedSpaces.length > 0 ? (
                                    removedSpaces.map((s) => (
                                        <div key={`${m.id}-rem-${spaceToKey(s)}`} className="flex gap-2">
                                          <span className="text-red-600 shrink-0">-</span>
                                          <span className="text-red-600 line-through">
                                            {s.name}
                                            {s.description?.trim() ? (
                                              <span className="text-red-600">（{s.description.trim()}）</span>
                                            ) : null}
                                          </span>
                                        </div>
                                      ))
                                  ) : null}
                                </div>
                              </div>
                            ) : null}

                            {m.otherActivityNote?.trim() || (isFieldDiff && trim(before!.otherActivityNote)) ? (
                              <div className={`text-xs ${isNewMember ? detailTextClass : ''} leading-relaxed`}>
                                <span className={`text-[11px] ${subtleTextClass}`}>其他说明：</span>
                                {isFieldDiff && otherNoteChanged ? (
                                  <span>
                                    {trim(before!.otherActivityNote) ? (
                                      <span className="text-red-600 line-through">{trim(before!.otherActivityNote)}</span>
                                    ) : null}
                                    {trim(before!.otherActivityNote) && trim(m.otherActivityNote) ? ' ' : null}
                                    {trim(m.otherActivityNote) ? (
                                      <span className="text-emerald-700">{trim(m.otherActivityNote)}</span>
                                    ) : null}
                                  </span>
                                ) : (
                                  m.otherActivityNote?.trim()
                                )}
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  )
                }
                return (
                  <div
                    key={r.id}
                    className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedRevisionId(isExpanded ? null : r.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/80 transition-colors"
                    >
                      <span className="text-gray-400 shrink-0">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                      <span className="text-xs text-gray-500 w-[72px] shrink-0">{r.date}</span>
                      <span className="text-sm font-medium text-gray-800 shrink-0">{r.updater}</span>
                      <span className="text-sm text-gray-600 flex-1 min-w-0 truncate">{r.summary}</span>
                      {hasDetail && (
                        <span className="text-xs text-amber-600 shrink-0">
                          {isExpanded ? '收起' : '展开详情'}
                        </span>
                      )}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 space-y-4 text-sm">
                        {r.sectionNote?.trim() ? (
                          <div>
                            <span className="font-medium text-gray-600">涉及章节/备注：</span>
                            <span className="text-gray-700 ml-1">{r.sectionNote}</span>
                          </div>
                        ) : null}
                        {beforePayload && afterPayload ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {diffLabels.length ? (
                                diffLabels.map((lb) => (
                                  <span
                                    key={`lb-${lb}`}
                                    className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50/60 px-2.5 py-1 text-[11px] font-semibold text-[#C87800]"
                                  >
                                    {lb}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">本条无可识别的变更模块</span>
                              )}
                            </div>

                            <div className="space-y-3">
                              {diffLabels.map((lb) => {
                                const b = beforePayload
                                const a = afterPayload
                                const listBefore = () => {
                                  switch (lb) {
                                    case '智能家居':
                                      return listNormalize(b.smartHomeOptions)
                                    case '全屋设备':
                                      return listNormalize(b.devices)
                                    case '系统设备':
                                      return listNormalize(b.comfortSystems)
                                    case '收纳重点':
                                      return listNormalize(b.storageFocus)
                                    default:
                                      return []
                                  }
                                }
                                const listAfter = () => {
                                  switch (lb) {
                                    case '智能家居':
                                      return listNormalize(a.smartHomeOptions)
                                    case '全屋设备':
                                      return listNormalize(a.devices)
                                    case '系统设备':
                                      return listNormalize(a.comfortSystems)
                                    case '收纳重点':
                                      return listNormalize(a.storageFocus)
                                    default:
                                      return []
                                  }
                                }

                                if (['智能家居', '全屋设备', '系统设备', '收纳重点'].includes(lb)) {
                                  const beforeList = listBefore()
                                  const afterList = listAfter()
                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'before' })}
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'after' })}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '项目概览') {
                                  const getTrim = (v?: string) => String(v ?? '').trim()
                                  const fields = [
                                    { label: '项目城市', bv: getTrim(b.projectLocation), av: getTrim(a.projectLocation) },
                                    { label: '项目类型', bv: getTrim(b.projectType), av: getTrim(a.projectType) },
                                    { label: '实际面积（㎡）', bv: getTrim(b.projectArea), av: getTrim(a.projectArea) },
                                    { label: '预算范围', bv: getTrim(b.budgetStandard), av: getTrim(a.budgetStandard) },
                                    { label: '入住周期', bv: getTrim(b.timeline), av: getTrim(a.timeline) },
                                    { label: '房屋用途', bv: getTrim(b.houseUsage), av: getTrim(a.houseUsage) },
                                    { label: '采光', bv: getTrim(b.lighting), av: getTrim(a.lighting) },
                                    { label: '通风', bv: getTrim(b.ventilation), av: getTrim(a.ventilation) },
                                    { label: '层高', bv: getTrim(b.ceilingHeight), av: getTrim(a.ceilingHeight) },
                                    { label: '噪音', bv: getTrim(b.noise), av: getTrim(a.noise) },
                                  ]
                                  const active = fields.filter((x) => x.bv || x.av)
                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          <div className="space-y-1">
                                            {active.map((f) => (
                                              <div key={`b-${f.label}`} className="text-xs text-gray-800 leading-relaxed">
                                                {f.label}：{f.bv || '无'}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          <div className="space-y-1">
                                            {active.map((f) => {
                                              if (f.bv === f.av) {
                                                return (
                                                  <div key={`a-${f.label}`} className="text-xs text-gray-800 leading-relaxed">
                                                    {f.label}：{f.av}
                                                  </div>
                                                )
                                              }
                                              return (
                                                <div key={`a-${f.label}`} className="space-y-1">
                                                  {f.av ? (
                                                    <div className="text-xs text-emerald-700 font-semibold leading-relaxed">
                                                      + {f.label}：{f.av}
                                                    </div>
                                                  ) : null}
                                                  {f.bv ? (
                                                    <div className="text-xs text-red-600 line-through leading-relaxed">
                                                      - {f.label}：{f.bv}
                                                    </div>
                                                  ) : null}
                                                </div>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '成员画像') {
                                  const beforeMembers = b.requirementsMembers ?? []
                                  const afterMembers = a.requirementsMembers ?? []
                                  const beforeIds = new Set(beforeMembers.map((m) => m.id))
                                  const afterIds = new Set(afterMembers.map((m) => m.id))
                                  const addedIds = new Set(afterMembers.filter((m) => !beforeIds.has(m.id)).map((m) => m.id))
                                  const removedMembers = beforeMembers.filter((m) => !afterIds.has(m.id))
                                  const beforeMemberMap = new Map(beforeMembers.map((m) => [m.id, m]))

                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          {renderMembersColumn(beforeMembers)}
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          <div>
                                            {renderMembersColumn(afterMembers, {
                                              highlightIds: addedIds,
                                              nameClassNameWhenHighlighted: 'text-emerald-700',
                                              beforeMemberMap,
                                            })}
                                            {removedMembers.length ? (
                                              <div className="pt-3">
                                                <div className="space-y-2">
                                                  {removedMembers.map((m) => (
                                                    <div key={m.id} className="space-y-1">
                                                      <div className="text-xs font-semibold text-red-600 line-through leading-snug">
                                                        - {m.name}
                                                        {m.displayName?.trim() ? (
                                                          <span className="text-red-600 font-normal">（{m.displayName.trim()}）</span>
                                                        ) : null}
                                                      </div>
                                                      {m.spaces?.length ? (
                                                        <div className="text-[11px] text-red-600 leading-relaxed">
                                                          空间：{m.spaces.map((s) => s.name).join('、')}
                                                        </div>
                                                      ) : null}
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ) : null}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '户型图') {
                                  const beforeList = (b.floorPlanImages ?? []).map((x) => String(x.name ?? '').trim()).filter(Boolean)
                                  const afterList = (a.floorPlanImages ?? []).map((x) => String(x.name ?? '').trim()).filter(Boolean)
                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'before' })}
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'after' })}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '现场照片/视频') {
                                  const beforeList = (b.siteMedia ?? [])
                                    .map((x) => `${String(x.name ?? '').trim()}（${String(x.kind ?? '').trim() || 'image'}）`)
                                    .filter((s) => s.replace(/\s/g, '').length > 0)
                                  const afterList = (a.siteMedia ?? [])
                                    .map((x) => `${String(x.name ?? '').trim()}（${String(x.kind ?? '').trim() || 'image'}）`)
                                    .filter((s) => s.replace(/\s/g, '').length > 0)
                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'before' })}
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'after' })}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '自定义空间需求') {
                                  const toKey = (x: { name: string; description?: string }) =>
                                    `${String(x.name ?? '').trim()}|${String(x.description ?? '').trim()}`
                                  const beforeRaw = b.customSpaceItems ?? []
                                  const afterRaw = a.customSpaceItems ?? []
                                  const beforeKeys = new Set(beforeRaw.map(toKey))
                                  const afterKeys = new Set(afterRaw.map(toKey))
                                  const beforeList = beforeRaw.map((x) =>
                                    x.description?.trim() ? `${x.name}（${x.description.trim()}）` : String(x.name ?? '').trim(),
                                  ).filter(Boolean)
                                  const afterList = afterRaw.map((x) =>
                                    x.description?.trim() ? `${x.name}（${x.description.trim()}）` : String(x.name ?? '').trim(),
                                  ).filter(Boolean)
                                  // 由于展示字符串与 key 可能不完全一致，这里不做逐项 removed/added 精细标红，仅做列表对比。
                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'before' })}
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'after' })}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '自定义核心空间') {
                                  const beforeList = listNormalize(b.customCoreSpaceOptions)
                                  const afterList = listNormalize(a.customCoreSpaceOptions)
                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'before' })}
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'after' })}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '空间规划') {
                                  const getTrim = (v?: string) => String(v ?? '').trim()
                                  const beforeCustom = listNormalize(b.customCoreSpaceOptions)
                                  const afterCustom = listNormalize(a.customCoreSpaceOptions)
                                  const beforeCustomKey = JSON.stringify([...beforeCustom].sort())
                                  const afterCustomKey = JSON.stringify([...afterCustom].sort())
                                  const activeRows = [
                                    { label: '核心空间配置', bv: getTrim(b.coreSpaces), av: getTrim(a.coreSpaces), kind: 'text' as const },
                                    {
                                      label: '自定义核心空间',
                                      bv: beforeCustom.join('、'),
                                      av: afterCustom.join('、'),
                                      kind: 'list' as const,
                                      bvKey: beforeCustomKey,
                                      avKey: afterCustomKey,
                                    },
                                    { label: '儿童成长', bv: getTrim(b.childGrowth), av: getTrim(a.childGrowth), kind: 'text' as const },
                                    { label: '访客留宿', bv: getTrim(b.guestStay), av: getTrim(a.guestStay), kind: 'text' as const },
                                    { label: '未来变动', bv: getTrim(b.futureChanges), av: getTrim(a.futureChanges), kind: 'text' as const },
                                  ].filter((r) => r.bv || r.av)

                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          <div className="space-y-1">
                                            {activeRows.map((r) => (
                                              <div key={`b-${r.label}`} className="text-xs text-gray-800 leading-relaxed">
                                                {r.label}：{r.bv || '无'}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          <div className="space-y-1">
                                            {activeRows.map((r) => {
                                              if (r.kind === 'list') {
                                                const same = (r as any).bvKey === (r as any).avKey
                                                if (same) {
                                                  return (
                                                    <div key={`a-${r.label}`} className="text-xs text-gray-800 leading-relaxed">
                                                      {r.label}：{r.av}
                                                    </div>
                                                  )
                                                }
                                                return (
                                                  <div key={`a-${r.label}`} className="space-y-1">
                                                    {r.av ? (
                                                      <div className="text-xs text-emerald-700 font-semibold leading-relaxed">
                                                        + {r.label}：{r.av}
                                                      </div>
                                                    ) : null}
                                                    {r.bv ? (
                                                      <div className="text-xs text-red-600 line-through leading-relaxed">
                                                        - {r.label}：{r.bv}
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                )
                                              }

                                              if (r.bv === r.av) {
                                                return (
                                                  <div key={`a-${r.label}`} className="text-xs text-gray-800 leading-relaxed">
                                                    {r.label}：{r.av}
                                                  </div>
                                                )
                                              }

                                              return (
                                                <div key={`a-${r.label}`} className="space-y-1">
                                                  {r.av ? (
                                                    <div className="text-xs text-emerald-700 font-semibold leading-relaxed">
                                                      + {r.label}：{r.av}
                                                    </div>
                                                  ) : null}
                                                  {r.bv ? (
                                                    <div className="text-xs text-red-600 line-through leading-relaxed">
                                                      - {r.label}：{r.bv}
                                                    </div>
                                                  ) : null}
                                                </div>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                // 文本类：其它需求说明/风水/空间其他说明/客厅/餐厅/厨房/卫生间/核心空间/儿童成长/访客留宿/未来变动
                                const beforeText = (() => {
                                  switch (lb) {
                                    case '其他需求说明':
                                      return b.otherNeeds
                                    case '风水与禁忌':
                                      return b.fengshui
                                    case '空间其他说明':
                                      return b.spaceOtherNote
                                    case '客厅需求':
                                      return b.livingRoomNote
                                    case '餐厅需求':
                                      return b.diningNote
                                    case '厨房需求':
                                      return b.kitchenNote
                                    case '卫生间需求':
                                      return b.bathroomNote
                                    case '核心空间配置':
                                      return b.coreSpaces
                                    case '儿童成长':
                                      return b.childGrowth
                                    case '访客留宿':
                                      return b.guestStay
                                    case '未来变动':
                                      return b.futureChanges
                                    default:
                                      return ''
                                  }
                                })()
                                const afterText = (() => {
                                  switch (lb) {
                                    case '其他需求说明':
                                      return a.otherNeeds
                                    case '风水与禁忌':
                                      return a.fengshui
                                    case '空间其他说明':
                                      return a.spaceOtherNote
                                    case '客厅需求':
                                      return a.livingRoomNote
                                    case '餐厅需求':
                                      return a.diningNote
                                    case '厨房需求':
                                      return a.kitchenNote
                                    case '卫生间需求':
                                      return a.bathroomNote
                                    case '核心空间配置':
                                      return a.coreSpaces
                                    case '儿童成长':
                                      return a.childGrowth
                                    case '访客留宿':
                                      return a.guestStay
                                    case '未来变动':
                                      return a.futureChanges
                                    default:
                                      return ''
                                  }
                                })()

                                return (
                                  <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                    <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                      <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2 p-4">
                                      <div className="rounded-lg border border-gray-100 bg-white p-3">
                                        <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                        {renderTextValue(beforeText)}
                                      </div>
                                      <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                        <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                        {renderTextValue(afterText)}
                                        {beforeText?.trim() && String(beforeText).trim() !== String(afterText ?? '').trim() ? (
                                          <div className="pt-2">
                                            <div className="text-xs text-red-600 line-through whitespace-pre-wrap break-words font-sans leading-relaxed">
                                              - {String(beforeText ?? '').trim()}
                                            </div>
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-gray-100 bg-white p-3">
                              <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-sans leading-relaxed">
                                {beforeDetailText?.trim() || '（无记录）'}
                              </pre>
                            </div>
                            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                              <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-sans leading-relaxed">
                                {afterDetailText?.trim() || '（无记录）'}
                              </pre>
                            </div>
                          </div>
                        )}
                        {r.docSnapshotJson && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => setSnapshotModalEntry(r)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-[#C87800] hover:bg-[#FFF4E0] transition-colors"
                            >
                              <Eye size={14} />
                              查看该版需求书快照
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
      ) : null}

      {!snapshotEmbedded ? (
        <RequirementDocSnapshotModal
          entry={snapshotModalEntry}
          onClose={() => setSnapshotModalEntry(null)}
        />
      ) : null}

      {showSubmitModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSubmitModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">感谢您的配合</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                您的用户需求已提交，我们会根据这份信息为您生成后续方案与服务建议。
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false)
                  onBackHome()
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#EF6B00] text-white text-sm font-semibold hover:bg-[#D85F00] transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoChangesModal && (
        <div className="fixed inset-0 z-[145] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 cursor-default"
            aria-label="关闭"
            onClick={() => setShowNoChangesModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">没有做任何更新</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              与进入编辑时相比，需求书内容没有变化。您可继续修改，或直接退出编辑。
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNoChangesModal(false)}
                className="w-full py-3 rounded-2xl bg-[#EF6B00] text-white text-sm font-semibold hover:bg-[#D85F00] transition-colors"
              >
                继续编辑
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNoChangesModal(false)
                  setIsEditing(false)
                }}
                className="w-full py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                退出编辑
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinishRevisionModal && (
        <div className="fixed inset-0 z-[145] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 cursor-default"
            aria-label="关闭"
            onClick={() => setShowFinishRevisionModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">完成编辑</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              将保存修改并写入「需求变更与修订记录」。变更概要已自动识别，可按需微调。
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-500 block mb-1">日期（自动）</span>
                <span className="font-medium text-gray-800">
                  {(() => {
                    const n = new Date()
                    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
                  })()}
                </span>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1" htmlFor="rev-updater">
                  更新人
                </label>
                <input
                  id="rev-updater"
                  value={revisionUpdaterInput}
                  onChange={(e) => setRevisionUpdaterInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  placeholder="姓名或角色"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1" htmlFor="rev-summary">
                  变更概要（已根据本次修改自动识别）
                </label>
                <p className="text-[11px] text-gray-400 mb-1.5 leading-snug">
                  对比「点击编辑时」已保存内容与当前内容，列出变更模块；可微调下方文字。
                </p>
                <textarea
                  id="rev-summary"
                  value={revisionSummaryInput}
                  onChange={(e) => setRevisionSummaryInput(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-y min-h-[72px] bg-[#FAFAF9]"
                  readOnly={false}
                  placeholder="自动生成中…"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1" htmlFor="rev-section">
                  涉及章节 / 备注（已自动填入变更模块，可改）
                </label>
                <input
                  id="rev-section"
                  value={revisionSectionNoteInput}
                  onChange={(e) => setRevisionSectionNoteInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  placeholder="自动根据变更模块生成"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => confirmSaveRequirementWithRevision()}
                className="w-full py-3 rounded-2xl bg-[#EF6B00] text-white text-sm font-semibold hover:bg-[#D85F00] transition-colors"
              >
                确认保存并记录修订
              </button>
              <button
                type="button"
                onClick={() => setShowFinishRevisionModal(false)}
                className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-800"
              >
                取消，继续编辑
              </button>
            </div>
          </div>
        </div>
      )}

      {!snapshotEmbedded ? (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-5 md:px-10 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500 line-clamp-2">
              {revisions[0] ? (
                <>
                  最后修订：<span className="text-gray-700">{revisions[0].date}</span> · {revisions[0].updater} ·{' '}
                  {revisions[0].summary.length > 36 ? `${revisions[0].summary.slice(0, 36)}…` : revisions[0].summary}
                </>
              ) : useMock ? (
                <>示例数据 · 修订记录见上文表格</>
              ) : (
                <>有变更并完成编辑后，将自动记录修订，最新信息将显示在此处。</>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBackHome}
                className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                返回
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isEditing && updateData && !useMock) {
                    const editsPayload = buildRequirementDocEditsPayload()
                    const fullAfterPayload = d
                      ? requirementPayloadFromFormData({ ...d, ...editsPayload } as import('../../types').FormData)
                      : (editsPayload as RequirementDocPayloadShape)
                    const fpAfter = fingerprintRequirementDocPayload(fullAfterPayload)
                    const beforeFp =
                      baselineFingerprintRef.current ?? (d ? fingerprintFromSavedFormData(d) : null)
                    const labels = diffRequirementDocFingerprints(beforeFp, fpAfter)
                    if (labels.length === 0) {
                      setShowNoChangesModal(true)
                    } else {
                      setRevisionUpdaterInput(ownerDisplayName)
                      setRevisionSummaryInput(formatAutoRevisionSummary(labels))
                      setRevisionSectionNoteInput(labels.join('、'))
                      setShowFinishRevisionModal(true)
                    }
                  } else {
                    if (!isEditing && updateData && !useMock && d) {
                      baselineFingerprintRef.current = fingerprintFromSavedFormData(d)
                      setRequirementsDocPage('content')
                    }
                    setIsEditing((v) => !v)
                  }
                }}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ${
                  isEditing ? 'bg-[#EF6B00] text-white hover:bg-[#D85F00]' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                title={isEditing ? '完成编辑' : '编辑需求书'}
              >
                {isEditing ? '完成编辑' : '编辑'}
              </button>
              {!isEditing && !hasSubmitted ? (
                <button
                  type="button"
                  onClick={() => {
                    setHasSubmitted(true)
                    setShowSubmitModal(true)
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-2xl bg-[#FF9C3E] px-5 py-3 text-sm font-semibold text-white hover:brightness-95 active:scale-[0.99] transition"
                >
                  确认并提交
                  <ChevronRight size={18} className="ml-1" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RequirementDocSnapshotModal({
  entry,
  onClose,
}: {
  entry: RequirementDocRevisionEntry | null
  onClose: () => void
}) {
  if (!entry) return null
  const fd = parseDocSnapshotJson(entry.docSnapshotJson)
  if (!fd) {
    return createPortal(
      <div className="fixed inset-0 z-[10050] flex items-center justify-center px-4">
        <button
          type="button"
          className="absolute inset-0 bg-neutral-950/75 backdrop-blur-[3px]"
          aria-label="关闭"
          onClick={onClose}
        />
        <div className="relative z-[1] max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            该条为旧版存档，无完整版面快照。请在新修订保存后查看，或使用龙湖璟宸府演示数据体验。
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full py-2.5 rounded-2xl bg-gray-900 text-white text-sm font-semibold"
          >
            关闭
          </button>
        </div>
      </div>,
      document.body,
    )
  }
  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex justify-center overflow-y-auto overflow-x-hidden bg-neutral-950/72 backdrop-blur-[4px] py-4 px-2 sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="需求书快照"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-6xl flex flex-col rounded-3xl bg-[#FFFDF3] shadow-[0_25px_80px_rgba(0,0,0,0.35)] border border-stone-200/90 overflow-hidden min-h-[min(88vh,820px)] max-h-[min(94vh,900px)] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-5 py-4">
            <React.Fragment key={entry.id}>
              <RequirementsDoc
                snapshotEmbedded
                snapshotOnClose={onClose}
                snapshotRevisionLabel={`${entry.date} · ${entry.updater}`}
                data={fd}
                projectName={(fd.projectName || '项目').trim() || '项目'}
                ownerDisplayName={(fd.userName || '业主').trim() || '业主'}
                houseUsage={fd.houseUsage}
                onBackHome={onClose}
              />
            </React.Fragment>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** 变更记录表分页：范围说明 + 页码胶囊 + 圆形前后导航 */
function revisionPaginationSlots(current: number, total: number): (number | 'gap')[] {
  if (total <= 1) return [1]
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const want = new Set(
    [1, total, current, current - 1, current + 1].filter((p) => p >= 1 && p <= total),
  )
  const sorted = [...want].sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('gap')
    out.push(sorted[i])
  }
  return out
}

function RevisionTablePagination({
  page,
  totalPages,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  totalPages: number
  pageSize: number
  total: number
  onPageChange: (p: number) => void
}) {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const slots = revisionPaginationSlots(page, totalPages)

  return (
    <div className="mt-5 rounded-2xl border border-stone-100/90 bg-gradient-to-b from-[#FFFDF9] to-stone-50/50 px-3 py-3.5 sm:px-5 sm:py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 text-[13px] leading-snug text-stone-500">
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600/90 shadow-sm ring-1 ring-stone-100/80"
            aria-hidden
          >
            <ListChecks size={16} strokeWidth={2.25} />
          </span>
          <span>
            显示{' '}
            <span className="font-semibold tabular-nums text-stone-800">{start}</span>
            <span className="text-stone-400 mx-0.5">–</span>
            <span className="font-semibold tabular-nums text-stone-800">{end}</span>
            {' '}条，共{' '}
            <span className="font-semibold tabular-nums text-stone-800">{total}</span>
            {' '}条
          </span>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-1 sm:justify-end"
          aria-label="修订记录分页"
        >
          <button
            type="button"
            aria-label="上一页"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/90 bg-white text-stone-600 shadow-sm transition-all hover:border-amber-300/70 hover:bg-amber-50/90 hover:text-amber-950 hover:shadow-md disabled:pointer-events-none disabled:opacity-30 disabled:shadow-none disabled:hover:bg-white disabled:hover:border-stone-200"
          >
            <ChevronLeft size={18} strokeWidth={2.25} />
          </button>

          <div className="flex items-center gap-0.5 px-1">
            {slots.map((item, idx) =>
              item === 'gap' ? (
                <span
                  key={`gap-${idx}`}
                  className="px-1.5 text-[10px] font-medium tracking-widest text-stone-300 select-none"
                  aria-hidden
                >
                  ···
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  aria-label={`第 ${item} 页`}
                  aria-current={page === item ? 'page' : undefined}
                  onClick={() => onPageChange(item)}
                  className={`min-w-[2.125rem] h-9 rounded-xl px-2 text-sm font-semibold tabular-nums transition-all ${
                    page === item
                      ? 'bg-gradient-to-b from-[#FF9C3E] to-[#EF6B00] text-white shadow-[0_3px_10px_rgba(239,107,0,0.32)] ring-1 ring-orange-300/40 scale-[1.02]'
                      : 'text-stone-600 hover:bg-white hover:text-stone-900 hover:shadow-sm hover:ring-1 hover:ring-stone-100/90 active:scale-[0.97]'
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            aria-label="下一页"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/90 bg-white text-stone-600 shadow-sm transition-all hover:border-amber-300/70 hover:bg-amber-50/90 hover:text-amber-950 hover:shadow-md disabled:pointer-events-none disabled:opacity-30 disabled:shadow-none disabled:hover:bg-white disabled:hover:border-stone-200"
          >
            <ChevronRight size={18} strokeWidth={2.25} />
          </button>
        </nav>
      </div>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  )
}

function TabPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
        active ? 'bg-white shadow-sm border border-gray-100 text-gray-900' : 'text-gray-600 hover:bg-white/60'
      }`}
    >
      {children}
    </button>
  )
}

