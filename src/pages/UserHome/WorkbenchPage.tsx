import React from 'react'
import {
  Home,
  FileText,
  PieChart,
  ShoppingCart,
  ScrollText,
  Settings,
  ChevronRight,
  Wrench,
  BarChart3,
  Package,
  Construction,
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
} from 'lucide-react'
import { DesignFeedbackApp } from '../DesignFeedback/DesignFeedbackApp'
import BudgetSankey from '../../components/BudgetSankey'
import BudgetSankeyByEPE from '../../components/BudgetSankeyByEPE'
import logoImg from '../../assets/img/logo.png'

type NavKey = 'home' | 'requirements' | 'budget' | 'orders' | 'contracts' | 'designFeedback'

export interface WorkbenchPageProps {
  userDisplayName?: string
  projectName?: string
  contractAccepted?: boolean
  contractSignatureData?: string
  contractCustomText?: string
  onExit?: () => void
  onGoToFirstPage?: () => void
  /** 返回项目列表（从项目页进入工作台时使用） */
  onBackToProjects?: () => void
  onGoToDesignFeedback?: () => void
  onViewOrderDetail?: (orderId: string) => void
}

export function WorkbenchPage({
  userDisplayName,
  projectName,
  contractAccepted,
  contractSignatureData,
  contractCustomText,
  onExit,
  onGoToFirstPage,
  onBackToProjects,
  onGoToDesignFeedback,
  onViewOrderDetail,
}: WorkbenchPageProps) {
  const [active, setActive] = React.useState<NavKey>('home')
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null)
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
  const currentProjectName = projectName?.trim() || '静安·云境公寓（示例项目）'
  const hasSignedContract = !!contractAccepted && !!contractSignatureData

  const navItems: Array<{ key: NavKey; label: string; icon: React.ElementType }> = [
    { key: 'home', label: '项目首页', icon: Home },
    { key: 'requirements', label: '项目需求书', icon: FileText },
    { key: 'budget', label: '项目预算', icon: PieChart },
    { key: 'orders', label: '项目订单', icon: ShoppingCart },
    { key: 'contracts', label: '项目合同', icon: ScrollText },
  ]

  const activeLabel = navItems.find((n) => n.key === active)?.label || '项目首页'

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
    <div className="min-h-screen bg-[#FFFDF3] text-gray-900 font-sans flex">
      {/* Sidebar */}
      <aside
        className="hidden md:flex shrink-0 flex-col bg-white border-r border-gray-100 py-6 relative"
        style={{ width: sidebarCollapsed ? 80 : sidebarWidth }}
      >
        <div className="px-5">
          <button
            type="button"
            onClick={onBackToProjects ?? onGoToFirstPage}
            className="flex items-center gap-3 px-2 text-left rounded-2xl hover:bg-black/5 transition-colors py-2 -my-2"
          >
            <img src={logoImg} alt="DSPHR Workspace" className="h-10 w-auto object-contain" />
          </button>
        </div>

        <nav className="mt-6 space-y-1 px-5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActive(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm transition-colors ${
                  isActive ? 'bg-[#FF9C3E]/10 text-gray-900' : 'text-gray-600 hover:bg-black/5'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={18} className={isActive ? 'text-[#FF9C3E]' : 'text-gray-400'} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
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
                  onClick={onGoToFirstPage}
                  className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center shrink-0 hover:bg-[#FF9C3E]/15 transition"
                  title="返回第一页"
                  aria-label="返回第一页"
                >
                  <Home size={18} />
                </button>
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1 text-xs font-medium text-white bg-slate-800 rounded-lg whitespace-nowrap opacity-0 pointer-events-none transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 z-50">
                  返回第一页
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
            {active === 'home' ? (
              <div className="space-y-8">
                {/* Current todo */}
                <section>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
                      <h2 className="text-lg font-semibold">当前待办</h2>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-gray-600 font-medium hover:text-gray-900 hover:underline underline-offset-4"
                    >
                      查看全部
                    </button>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#FF9C3E]/10 flex items-center justify-center text-[#FF9C3E] shrink-0">
                          <Wrench size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-[#C87800] bg-[#FF9C3E]/10 px-2 py-0.5 rounded-full">
                              待确认
                            </span>
                          </div>
                          <div className="text-base font-semibold truncate">00589#家具订单设计待确认</div>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            您的家具定制方案已出具，请尽快核对设计图纸及物料清单并确认。
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActive('designFeedback')}
                        className="md:w-[220px] w-full inline-flex items-center justify-center rounded-2xl bg-[#FF9C3E] text-white font-semibold py-3 hover:brightness-95 active:scale-[0.99] transition"
                      >
                        立即处理
                        <ChevronRight size={18} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Feature entry */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
                    <h2 className="text-lg font-semibold">功能入口</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    <FeatureCard
                      icon={<FileText size={18} />}
                      title="项目需求书"
                      desc="深度解析您的居住梦想，包含空间偏好、风格色彩及功能细节的完整定义。"
                      action="立即查看"
                      onClick={() => setActive('requirements')}
                    />
                    <FeatureCard
                      icon={<PieChart size={18} />}
                      title="项目预算"
                      desc="一键总览项目预算结构，按空间与品类拆解费用构成，支持在线确认。"
                      action="查看预算"
                      onClick={() => setActive('budget')}
                    />
                    <FeatureCard
                      icon={<Sparkles size={18} />}
                      title="设计反馈"
                      desc="集中查看设计方案与效果图，对关键空间逐条点评并同步给设计师。"
                      action="进入反馈"
                      onClick={() => setActive('designFeedback')}
                    />
                  </div>
                </section>
              </div>
            ) : active === 'requirements' ? (
              <RequirementsDoc
                projectName={currentProjectName}
                ownerDisplayName={displayName}
                onBackHome={() => setActive('home')}
              />
            ) : active === 'orders' ? (
              selectedOrderId ? (
                <OrderDetailView 
                  orderId={selectedOrderId} 
                  onBack={() => setSelectedOrderId(null)} 
                />
              ) : (
                <OrderManagementSection 
                  onGoToDesignFeedback={() => setActive('designFeedback')} 
                  onSelectOrder={(id) => setSelectedOrderId(id)}
                />
              )
            ) : active === 'budget' ? (
              <BudgetConfirmPanel />
            ) : active === 'contracts' ? (
              <ContractsSection
                projectName={currentProjectName}
                hasSigned={hasSignedContract}
                signatureData={contractSignatureData}
                customText={contractCustomText}
                onGoToContractStep={onGoToFirstPage}
              />
            ) : active === 'designFeedback' ? (
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-4 md:p-6">
                <DesignFeedbackApp onGoHome={() => setActive('home')} />
              </div>
            ) : (
              <ComingSoon title={activeLabel} onBackHome={() => setActive('home')} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

const ORDER_MOCK_DATA = [
    {
      id: 'PSO-OD_LHJCF-00471',
      projectId: 'PRJ7_X-B49-T4-LHJCF',
      title: '瓷砖铺贴-公卫、次卫、厨房墙地铺贴',
      status: 'S00-订单已交付',
      statusColor: 'emerald' as const,
      contains: '详细报价单、施工方案',
      date: '2025-10-24',
      amount: '¥57,500',
    },
    {
      id: 'PSO-OD_LHJCF-00567',
      projectId: 'PRJ7_X-B49-T4-LHJCF',
      title: '全屋-石材安装',
      status: 'S00-意向报价中',
      statusColor: 'gray' as const,
      contains: '意向利岩板、大金空调选型',
      date: '2025-10-26',
      amount: '待定',
    },
    {
      id: 'PSO-OD_LHJCF-00612',
      projectId: 'PRJ7_X-B49-T4-LHJCF',
      title: '橱柜柜体定制',
      status: 'S00-客户决策中',
      statusColor: 'gray' as const,
      contains: '工程进场筹备、材料下单',
      date: '2025-10-28',
      amount: '¥32,800',
    },
    {
      id: 'PSO-OD_LHJCF-00623',
      projectId: 'PRJ7_X-B49-T4-LHJCF',
      title: '一层、负一层-天花吊顶',
      status: 'S00-订单交付中',
      statusColor: 'blue' as const,
      contains: '单层泥水工程、基层处理',
      date: '2025-10-30',
      amount: '¥18,900',
    },
  ] as const

function OrderManagementSection({ 
  onGoToDesignFeedback,
  onSelectOrder 
}: { 
  onGoToDesignFeedback?: () => void,
  onSelectOrder?: (id: string) => void
}) {
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredOrders = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return [...ORDER_MOCK_DATA]
    return ORDER_MOCK_DATA.filter(
      (o) =>
        o.title.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const statusBarColors: Record<string, string> = {
    emerald: 'bg-emerald-500',
    gray: 'bg-gray-400',
    blue: 'bg-blue-500',
  }

  return (
    <div className="space-y-6">
      {/* 顶部：标题 */}
      <h1 className="text-xl font-semibold text-gray-900">订单管理</h1>

      {/* 搜索 */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索订单标题、订单编号"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* 订单列表 */}
      <div className="space-y-0 divide-y divide-gray-100 bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            onClick={() => onSelectOrder?.(order.id)}
            className="flex gap-4 py-5 px-4 hover:bg-gray-50/50 transition-colors group cursor-pointer"
          >
            {/* 左侧状态色条 */}
            <div className={`w-1 rounded-full shrink-0 self-stretch min-h-[60px] ${statusBarColors[order.statusColor]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium mb-1.5 ${
                      order.statusColor === 'emerald'
                        ? 'bg-emerald-50 text-emerald-700'
                        : order.statusColor === 'blue'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.status}
                  </span>
                  <div className="font-semibold text-gray-900 truncate">
                    {order.id} · {order.title}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 text-right">
                  <div className="text-base font-semibold text-gray-900 mt-1">
                    {order.amount}
                  </div>
                  {onGoToDesignFeedback && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onGoToDesignFeedback()
                      }}
                      className="mt-2 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FF9C3E] text-white hover:bg-[#EF6B00] transition-colors"
                    >
                      查看设计反馈
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type BudgetSankeyTab = 'flow' | 'epe'

function BudgetConfirmPanel() {
  const mockVersion = '3'
  const mockBumMin = 45
  const mockBumMax = 50
  const [sankeyTab, setSankeyTab] = React.useState<BudgetSankeyTab>('flow')

  const summary = {
    totalBudget: 50.0,
    won: 15.5,
    notWon: 34.5,
    totalIncome: 26.0,
    remainingIncome: 24.0
  };

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

function OrderDetailView({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  // Mock data based on the image
  const orderData = {
    id: orderId,
    title: '铝合金智能化幕墙采购与施工订单',
    status: 'S06-订单交付中',
    subStatus: 'S06-04 交付施工中',
    totalAmount: '250,000',
    coreRequirement: {
      tone: '“现代主义风格，要求高透明度视觉效果，避免可见拼缝。”',
      remarks: '客户对玻璃平整度有极高要求，需提供原片质检报告。'
    },
    quotations: [
      { ver: 'V2', title: '订购报价单', status: '方案价未完成 / 待内审', statusColor: 'bg-gray-100 text-gray-500', time: '2023-11-24 15:00' },
      { ver: 'V1', title: '订购报价单', status: '客户反馈调整 / 有评论', statusColor: 'bg-purple-50 text-purple-600', time: '2023-11-10 10:00' },
      { ver: 'V0', title: '意向报价单', status: '客户决策通过 / 已结案', statusColor: 'bg-emerald-50 text-emerald-600', time: '2023-10-20 09:00' },
    ]
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeftRight size={14} className="rotate-180" />
            返回列表
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{orderData.id}</h1>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100 uppercase">
                {orderData.status}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-100 uppercase">
                {orderData.subStatus}
              </span>
            </div>
          </div>
          <p className="text-lg font-medium text-gray-500">{orderData.title}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">订单概算总额</div>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-xs font-bold text-gray-900">¥</span>
            <span className="text-4xl font-bold text-gray-900 tabular-nums">{orderData.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* 需求核心 Card */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex relative">
        <div className="w-1.5 bg-blue-500 shrink-0" />
        <div className="p-6 sm:p-8 flex-1 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-1 flex items-start justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Bot size={20} />
            </div>
          </div>
          <div className="md:col-span-7 space-y-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">需求核心</div>
            <div className="space-y-2">
              <div className="text-[10px] text-gray-400 font-bold uppercase">设计基调</div>
              <p className="text-sm text-gray-900 leading-relaxed">
                以<span className="text-blue-600 font-semibold">{orderData.coreRequirement.tone}</span>为准。
              </p>
            </div>
          </div>
          <div className="md:col-span-4 space-y-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">关键备注</div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {orderData.coreRequirement.remarks}
            </p>
          </div>
        </div>
      </div>

      {/* 多轮报价进度管理 Section */}
      <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
              <BarChart3 size={18} />
            </div>
            <h2 className="text-base font-bold text-gray-900">多轮报价进度管理</h2>
          </div>
          <button className="inline-flex items-center gap-2 bg-[#1A1C1E] text-white px-5 py-2.5 rounded-2xl text-xs font-bold hover:bg-black transition-all active:scale-95">
            管理工作台
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-4">
          {orderData.quotations.map((q, idx) => (
            <div 
              key={idx}
              className="group relative flex items-center gap-6 p-5 rounded-[24px] border border-gray-50 hover:border-gray-200 hover:bg-gray-50/30 transition-all cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                q.ver === 'V2' ? 'bg-[#1A1C1E] text-white' : 
                q.ver === 'V1' ? 'bg-[#8B5CF6] text-white' : 
                'bg-[#10B981] text-white'
              }`}>
                <span className="text-[8px] font-bold opacity-60 uppercase">VER</span>
                <span className="text-lg font-bold">{q.ver}</span>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-gray-900">{q.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${q.statusColor}`}>
                    {q.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium tracking-tight">
                  最后更新：{q.time}
                </p>
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
            </div>
          ))}
        </div>
      </section>

      {/* 财务结算清单 Section */}
      <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
            <LayoutGrid size={18} />
          </div>
          <h2 className="text-base font-bold text-gray-900">财务结算清单</h2>
        </div>

        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
            <div className="animate-pulse">
              <Hourglass size={32} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">结算流程尚未开启</h3>
            <p className="text-xs text-gray-400 font-medium">
              结算单将在进入验收阶段（S07）后基于实际完成量生成。
            </p>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            云端连接正常
          </div>
          <div>同步节点: 东亚-01</div>
        </div>
        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          V4.5.0 PREMIUM
        </div>
      </div>
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
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">功能开发中，敬请期待；你可以先返回项目首页查看工作台概览。</p>
        <button
          type="button"
          onClick={onBackHome}
          className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#FF9C3E] text-white font-semibold px-6 py-3 hover:brightness-95 active:scale-[0.99] transition"
        >
          返回项目首页
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
          <h2 className="text-lg font-semibold">项目合同</h2>
        </div>
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
            onClick={onGoToContractStep}
            className="md:w-[180px] w-full inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            查看合同详情
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}

function RequirementsDoc({
  projectName,
  ownerDisplayName,
  onBackHome,
}: {
  projectName: string
  ownerDisplayName: string
  onBackHome: () => void
}) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editHint, setEditHint] = React.useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = React.useState(false)
  const [showSubmitModal, setShowSubmitModal] = React.useState(false)
  const [spaceTab, setSpaceTab] = React.useState<'living' | 'dining' | 'kitchen' | 'bathroom'>('living')
  const planInputId = React.useId()
  const mediaInputId = React.useId()
  const [planImages, setPlanImages] = React.useState<Array<{ name: string; url: string }>>([])
  const [mediaFiles, setMediaFiles] = React.useState<Array<{ name: string; url: string; kind: 'image' | 'video' }>>([])

  const houseUsage = '改善房'

  const infoRows: Array<{ label: string; value: string }> = [
    { label: '项目城市', value: '上海' },
    { label: '项目类型', value: '平层公寓' },
    { label: '实际面积', value: '100.0 ㎡' },
    { label: '预算范围', value: '10.1 万/㎡' },
    { label: '入住周期', value: '3-6个月' },
  ]

  const projectStatus = {
    lighting: '良好，半天有阳光',
    ventilation: '南北通透',
    ceilingHeight: '2.6-2.8米 (标准)',
    noise: '偶有噪音',
  }

  const statusCards: Array<{ icon: React.ElementType; title: string; value: string }> = [
    { icon: Sun, title: '采光', value: projectStatus.lighting },
    { icon: Wind, title: '通风', value: projectStatus.ventilation },
    { icon: Ruler, title: '层高', value: projectStatus.ceilingHeight },
    { icon: Volume2, title: '噪音', value: projectStatus.noise },
  ]

  const structureCards: Array<{ icon: React.ElementType; title: string; desc: string }> = [
    { icon: LayoutGrid, title: '信息架构', desc: '围绕“居住场景”组织需求，分层表达、便于决策。' },
    { icon: Sparkles, title: '设计定位', desc: '温润克制的高级感，材质与光影优先，细节耐看。' },
    { icon: ListChecks, title: '交付目标', desc: '可落地的空间方案 + 软硬装策略，明确优先级与取舍。' },
  ]

  const personas: Array<{
    name: string
    age: string
    profession: string
    height: string
    stylePersona?: string | null
    mainActivitiesAndSpaces: string[]
    accent: 'amber' | 'slate'
  }> = [
    {
      name: '父亲',
      age: '42岁',
      profession: '金融从业',
      height: '178cm',
      stylePersona: '理性秩序派',
      mainActivitiesAndSpaces: ['高效办公（书房/办公角）', '家庭放松（客厅）', '收纳管理（玄关/衣柜系统）'],
      accent: 'amber',
    },
    {
      name: '母亲',
      age: '39岁',
      profession: '品牌市场',
      height: '165cm',
      stylePersona: '氛围生活家',
      mainActivitiesAndSpaces: ['烹饪与备餐（厨房/轻食台）', '社交招待（餐厨/客厅）', '展示收纳（餐边/陈列区）'],
      accent: 'slate',
    },
    {
      name: '女儿',
      age: '8岁',
      profession: '小学生',
      height: '128cm',
      stylePersona: null,
      mainActivitiesAndSpaces: ['学习阅读（书桌/阅读角）', '游戏玩耍（客厅/儿童区）', '收纳整理（玩具/衣物储物）'],
      accent: 'amber',
    },
    {
      name: 'Mochi',
      age: '2岁',
      profession: '猫',
      height: '约25cm（肩高）',
      stylePersona: null,
      mainActivitiesAndSpaces: ['活动动线（猫墙/跑道）', '休息晒太阳（窗边/阳台）', '饮食如厕（喂食区/猫砂区）'],
      accent: 'slate',
    },
  ]

  const systemEquipments = [
    { key: 'fresh-air', title: '新风系统', desc: '全屋换气·除味净化', icon: Wind },
    { key: 'floor-heating', title: '全屋地暖', desc: '智能分区温控', icon: Thermometer },
    { key: 'central-ac', title: '中央空调', desc: '变频节能冷暖系统', icon: AirVent },
  ] as const

  const smartHomeOptions = [
    { key: 'wifi6', label: '全屋 Wi-Fi 6 覆盖', icon: Wifi, defaultChecked: true },
    { key: 'lighting-scene', label: '智能灯光场景控制', icon: Lightbulb, defaultChecked: true },
    { key: 'security', label: '全屋智能安防网', icon: ShieldCheck, defaultChecked: true },
    { key: 'curtain', label: '智能电动窗帘', icon: Blinds, defaultChecked: false },
    { key: 'voice-panel', label: '语音控制中控面板', icon: Mic, defaultChecked: true },
    { key: 'bgm', label: '背景音乐系统', icon: Music, defaultChecked: false },
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
      initial[o.key] = o.defaultChecked
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

  const fengshuiResult = '避开大众忌讳就行'
  const storageFocusResult = ['衣帽间/衣柜系统', '厨房餐储收纳', '展示性收纳（书籍、收藏品）']

  const spaceResultMap: Record<
    'living' | 'dining' | 'kitchen' | 'bathroom',
    { title: string; q: string; icon: React.ElementType; items: string[] }
  > = {
    living: {
      title: '客厅',
      q: 'Q2-13',
      icon: Sofa,
      items: ['影音娱乐', '社交会客', '冥想放松'],
    },
    dining: {
      title: '餐厅',
      q: 'Q2-12',
      icon: Utensils,
      items: ['平时就餐：3-4人', '节假日最多：7-10人'],
    },
    kitchen: {
      title: '厨房',
      q: 'Q2-10',
      icon: ChefHat,
      items: ['烹饪习惯：经常做饭（重油烟）', '第二厨房：需要中西分厨'],
    },
    bathroom: {
      title: '卫生间',
      q: 'Q2-15',
      icon: Bath,
      items: ['必须彻底干湿分离（洗手台外置）'],
    },
  }

  const activeSpace = spaceResultMap[spaceTab]

  React.useEffect(() => {
    return () => {
      planImages.forEach((x) => URL.revokeObjectURL(x.url))
      mediaFiles.forEach((x) => URL.revokeObjectURL(x.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPickPlanFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setPlanImages((prev) => {
      const next = [...prev]
      Array.from(files).forEach((f) => {
        if (!f.type.startsWith('image/')) return
        next.push({ name: f.name, url: URL.createObjectURL(f) })
      })
      return next
    })
  }

  const onPickMediaFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setMediaFiles((prev) => {
      const next = [...prev]
      Array.from(files).forEach((f) => {
        const kind: 'image' | 'video' | null = f.type.startsWith('video/')
          ? 'video'
          : f.type.startsWith('image/')
            ? 'image'
            : null
        if (!kind) return
        next.push({ name: f.name, url: URL.createObjectURL(f), kind })
      })
      return next
    })
  }

  const notifyReadonly = (message = '当前为只读状态，请点击底部“编辑”后再修改。') => {
    setEditHint(message)
    window.setTimeout(() => setEditHint(null), 1800)
  }

  const selectedSmartHome = smartHomeOptions.filter((o) => smartHomeSelected[o.key])
  const selectedSpecialDevices = specialDeviceOptions.filter((o) => specialDeviceSelected[o.key])

  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-gray-500">项目交付 · 需求书</div>
          <h1 className="mt-1 text-xl md:text-2xl font-semibold tracking-tight">项目需求书</h1>
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{projectName}</span>
            <span className="mx-2 text-gray-300">/</span>
            <span>业主：{ownerDisplayName}</span>
          </div>
          {!isEditing ? (
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
          {editHint ? (
            <div className="mt-2 text-xs font-semibold text-[#C87800]">{editHint}</div>
          ) : null}
        </div>
      </div>

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
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">{row.label}</div>
                  <div className="text-sm font-semibold text-gray-900">{row.value}</div>
                </div>
              ))}

              <div className="flex items-start justify-between gap-4">
                <div className="text-sm text-gray-600 pt-1">房屋用途</div>
                <div className="text-sm font-semibold text-gray-900">{houseUsage}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
              <div className="font-semibold">项目现状（Q2-5）</div>
            </div>

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
          </div>
        </div>
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
                  <div className="text-xs text-gray-500">支持上传图片并预览</div>
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
                  {!isEditing ? '进入编辑模式后可上传户型图' : '可在此上传户型图'}
                </div>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {planImages.map((img) => (
                  <a
                    key={img.url}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group block rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm"
                    title={img.name}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-28 object-cover group-hover:scale-[1.01] transition-transform" />
                    <div className="px-3 py-2 text-[11px] text-gray-600 truncate">{img.name}</div>
                  </a>
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
          <SectionTitle title="成员画像" />
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <Users size={14} className="text-gray-400" />
            <span className="font-semibold text-gray-400">Q2-6</span>
            <span className="text-gray-300">·</span>
            {personas.length} 位成员
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {personas.map((p) => (
            <div
              key={`${p.name}-${p.age}`}
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 shadow-sm px-3 py-2 text-xs"
            >
              <span className="w-6 h-6 rounded-full bg-[#FF9C3E]/10 text-[#C87800] flex items-center justify-center font-bold">
                {p.name.slice(0, 1)}
              </span>
              <span className="font-semibold text-gray-800">{p.name}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-600">{p.age}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {personas.map((p) => (
            <div key={`${p.name}-${p.age}`} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-base font-semibold truncate">{p.name}</div>
                    <span className="text-xs text-gray-400">·</span>
                    <div className="text-sm font-semibold text-gray-700 shrink-0">{p.age}</div>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {p.profession}
                    <span className="mx-2 text-gray-300">/</span>
                    身高 {p.height}
                  </div>

                  {p.stylePersona ? (
                    <div className="mt-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          p.accent === 'amber' ? 'bg-[#FF9C3E]/10 text-[#C87800]' : 'bg-[#EF6B00]/5 text-gray-700'
                        }`}
                      >
                        风格人设：{p.stylePersona}
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
              </div>
            </div>
          ))}
        </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {systemEquipments.map((x) => (
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
              ) : selectedSmartHome.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedSmartHome.map((o) => (
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
                  暂无选择结果
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
              ) : selectedSpecialDevices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {selectedSpecialDevices.map((o) => (
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
                  暂无选择结果
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
              <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 text-sm text-gray-700 leading-relaxed">
                {fengshuiResult}
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {storageFocusResult.map((it) => (
                  <div key={it} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3 text-sm font-semibold text-gray-800">
                    {it}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 个性化定制说明 */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900">个性化定制说明</div>
            </div>
            <div className="p-6">
              {isEditing ? (
                <textarea
                  value={customNeedsNote}
                  onChange={(e) => setCustomNeedsNote(e.target.value)}
                  placeholder="请输入其他补充需求..."
                  className="w-full min-h-[140px] rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FF9C3E]/20"
                />
              ) : customNeedsNote.trim() ? (
                <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {customNeedsNote}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  暂无
                  <div className="mt-1 text-xs text-gray-500">进入编辑模式后可补充说明</div>
                </div>
              )}
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
            <div className="flex items-center gap-2 rounded-2xl bg-[#FFFDF3] p-1 border border-gray-100">
              <TabPill active={spaceTab === 'living'} onClick={() => setSpaceTab('living')}>
                客厅
              </TabPill>
              <TabPill active={spaceTab === 'dining'} onClick={() => setSpaceTab('dining')}>
                餐厅
              </TabPill>
              <TabPill active={spaceTab === 'kitchen'} onClick={() => setSpaceTab('kitchen')}>
                厨房
              </TabPill>
              <TabPill active={spaceTab === 'bathroom'} onClick={() => setSpaceTab('bathroom')}>
                卫生间
              </TabPill>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 rounded-2xl border border-gray-100 bg-[#FFFDF3] p-5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#FF9C3E]">
                <activeSpace.icon size={18} />
              </div>
              <div className="mt-3 text-sm font-semibold text-gray-900">空间说明</div>
              <div className="mt-1 text-sm text-gray-600 leading-relaxed">
                本区聚焦该空间的关键使用方式与容量预期，便于后续方案与设备位落地。
              </div>
            </div>
            <div className="md:col-span-2 space-y-3">
              {activeSpace.items.map((it, idx) => (
                <div key={it} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                  <span className="w-8 h-8 rounded-2xl bg-[#FF9C3E]/10 text-[#C87800] flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div className="text-sm text-gray-700 leading-relaxed">{it}</div>
                </div>
              ))}
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
            ) : spaceOtherNote.trim() ? (
              <div className="mt-3 rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {spaceOtherNote}
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
                您的项目需求书已提交，我们会根据这份信息为您生成后续方案与服务建议。
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-[#EF6B00] text-white text-sm font-semibold hover:bg-[#D85F00] transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500">
            最后更新：刚刚 · 需求书为示例结构，可接入真实测评数据后自动生成。
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
              onClick={() => setIsEditing((v) => !v)}
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

