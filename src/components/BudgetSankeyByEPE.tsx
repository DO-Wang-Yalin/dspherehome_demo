import React, { useState, useMemo, useCallback } from 'react'
import type {
  StatusGroup,
  IncomeEntry,
  Order,
  BudgetSankeyData,
} from './BudgetSankey'

// 复用 BudgetSankey 的 mock（与 BudgetSankey 默认一致，便于同数据双视图）
const INCOME_ENTRIES: IncomeEntry[] = [
  { id: 'inc1', date: '2025-05-28', displayDate: '2025.05.28', amount: 3.0, status: '维保期' },
  { id: 'inc2', date: '2025-07-01', displayDate: '2025.07.01', amount: 2.0, status: '维保期' },
  { id: 'inc3', date: '2025-07-28', displayDate: '2025.07.28', amount: 5.0, status: '验收期' },
  { id: 'inc4', date: '2025-08-12', displayDate: '2025.08.12', amount: 3.0, status: '验收期' },
  { id: 'inc5', date: '2025-09-10', displayDate: '2025.09.10', amount: 10.0, status: '交付期' },
  { id: 'inc6', date: '2025-10-01', displayDate: '2025.10.01', amount: 3.0, status: '订购期' },
  { id: 'inc7', date: '2025-11-25', displayDate: '2025.11.25', amount: 0, status: '订购期', isToday: true },
  { id: 'inc8', date: '2025-12-05', displayDate: '2025.12.05', amount: 5.0, status: '意向期', isFuture: true },
  { id: 'inc9', date: '2026-01-10', displayDate: '2026.01.10', amount: 10.0, status: '意向期', isFuture: true },
  { id: 'inc10', date: '2026-04-05', displayDate: '2026.04.05', amount: 9.0, status: '意向期', isFuture: true },
]

const ORDERS: Order[] = [
  { id: 'ord001', number: 'PSO-OD-LHJCF-00001', title: '设计服务', status: '维保期', milestoneId: 'ms02', budget: 2.0 },
  { id: 'ord001b', number: 'PSO-OD-LHJCF-00002', title: '效果图确认', status: '意向期', milestoneId: 'ms02', budget: 1.0 },
  { id: 'ord006', number: 'PSO-OD-LHJCF-00006', title: '全星新墙构建', status: '验收期', milestoneId: 'ms06', budget: 2.5 },
  { id: 'ord009', number: 'PSO-OD-LHJCF-00009', title: '垃圾清运', status: '维保期', milestoneId: 'ms06', budget: 2.5 },
  { id: 'ord012', number: 'PSO-OD-LHJCF-00012', title: '水电布管', status: '验收期', milestoneId: 'ms08', budget: 3.5 },
  { id: 'ord014', number: 'PSO-OD-LHJCF-00014', title: '中央空调布管', status: '交付期', milestoneId: 'ms08', budget: 5.0 },
  { id: 'ord016', number: 'PSO-OD-LHJCF-00016', title: '地暖铺设', status: '意向期', milestoneId: 'ms08', budget: 4.0 },
  { id: 'ord021', number: 'PSO-OD-LHJCF-00021', title: '室内防水', status: '订购期', milestoneId: 'ms10', budget: 5.0 },
  { id: 'ord025', number: 'PSO-OD-LHJCF-00025', title: '瓷砖辅贴', status: '意向期', milestoneId: 'ms10', budget: 5.0 },
  { id: 'ord028', number: 'PSO-OD-LHJCF-00028', title: '石材安装', status: '意向期', milestoneId: 'ms10', budget: 5.0 },
  { id: 'ord026', number: 'PSO-OD-LHJCF-00026', title: '墙面基层处理', status: '意向期', milestoneId: 'ms11', budget: 2.0 },
  { id: 'ord029', number: 'PSO-OD-LHJCF-00029', title: '乳胶漆涂刷', status: '意向期', milestoneId: 'ms11', budget: 2.0 },
  { id: 'ord030', number: 'PSO-OD-LHJCF-00030', title: '定制衣柜', status: '意向期', milestoneId: 'ms12', budget: 2.5 },
  { id: 'ord031', number: 'PSO-OD-LHJCF-00031', title: '橱柜安装', status: '意向期', milestoneId: 'ms12', budget: 2.5 },
  { id: 'ord_remain', number: '余款返还', title: '余款返还', status: '意向期', milestoneId: 'ms_final', budget: 5.5 },
]

const TOTAL_BUDGET = 50

type EPECategory = 'E' | 'P' | 'C'
const EPE_LABELS: Record<EPECategory, string> = {
  E: 'E 高端设计',
  P: 'P 严选精品',
  C: 'C 匠心施工',
}
const EPE_COLORS: Record<EPECategory, string> = {
  E: '#4887FF',
  P: '#7BC80E',
  C: '#EF6B00',
}

const CLOSED_STATUSES: StatusGroup[] = ['维保期', '验收期', '交付期']
function isClosed(status: StatusGroup): boolean {
  return CLOSED_STATUSES.includes(status)
}

/** 按里程碑划分 E/P/C：设计→E，主材设备→P，施工→C */
function milestoneToEPE(milestoneId: string): EPECategory {
  if (milestoneId === 'ms02') return 'E'
  if (milestoneId === 'ms06' || milestoneId === 'ms08') return 'P'
  return 'C'
}

const VB_W = 950
const CHART_TOP_MARGIN = 72
const CHART_BOTTOM_MARGIN = 50
const EPE_GAP = 20
const DEAL_GAP = 12
const DEAL_ZERO_LINE_H = 4
const INCOME_MIN_GAP = 16
const INCOME_COLOR = '#FBBF24'
const TODAY_COLOR = '#F97316'

const X = {
  dateDot: 172,
  incomeLeft: 188,
  incomeRight: 250,
  budgetLeft: 400,
  budgetRight: 444,
  epeLeft: 520,
  epeRight: 660,
  dealLeft: 720,
  dealRight: 920,
  dealLabelLeft: 732,
}

const UNWON_GRAY = '#94A3B8'

function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

function bandPath(
  x1: number, top1: number, bot1: number,
  x2: number, top2: number, bot2: number
): string {
  const mx = (x1 + x2) / 2
  return (
    `M${x1},${top1} C${mx},${top1} ${mx},${top2} ${x2},${top2}` +
    ` L${x2},${bot2} C${mx},${bot2} ${mx},${bot1} ${x1},${bot1} Z`
  )
}

interface BudgetSankeyByEPEProps {
  data?: BudgetSankeyData | null
  subtitle?: string
}

function BudgetSankeyByEPE({ data, subtitle }: BudgetSankeyByEPEProps = {}) {
  const incomeEntries = data?.incomeEntries ?? INCOME_ENTRIES
  const orders = data?.orders ?? ORDERS
  const totalBudget = data?.totalBudget ?? TOTAL_BUDGET

  const [hovered, setHovered] = useState<string | null>(null)

  const layout = useMemo(() => {
    const SCALE = 18

    const sortedPaidIncome = [...incomeEntries]
      .filter((inc) => !inc.isFuture)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const futureIncomeTotal = incomeEntries
      .filter((inc) => inc.isFuture)
      .reduce((sum, inc) => sum + inc.amount, 0)
    const unpaidIncomeNode =
      futureIncomeTotal > 0
        ? {
            id: 'unpaid',
            date: '',
            displayDate: '未入金',
            amount: futureIncomeTotal,
            status: '意向期' as StatusGroup,
            isToday: false,
            isFuture: true,
            isUnpaid: true,
          }
        : null
    const sortedIncome = unpaidIncomeNode ? [...sortedPaidIncome, unpaidIncomeNode] : sortedPaidIncome

    const incomeNodesHeight = sortedIncome.reduce((sum, inc) => sum + inc.amount * SCALE, 0)
    const incomeGapsHeight = INCOME_MIN_GAP * Math.max(0, sortedIncome.length - 1)
    const incomeTotalHeight = incomeNodesHeight + incomeGapsHeight

    const epeBuckets: Record<EPECategory, { closed: number; open: number }> = {
      E: { closed: 0, open: 0 },
      P: { closed: 0, open: 0 },
      C: { closed: 0, open: 0 },
    }
    orders.forEach((ord) => {
      const epe = milestoneToEPE(ord.milestoneId)
      if (isClosed(ord.status)) epeBuckets[epe].closed += ord.budget
      else epeBuckets[epe].open += ord.budget
    })

    const epeTotal = (key: EPECategory) => epeBuckets[key].closed + epeBuckets[key].open
    const totalEPE = epeTotal('E') + epeTotal('P') + epeTotal('C') || totalBudget
    const budgetH = Math.max(incomeTotalHeight, totalBudget * SCALE)
    const availableHeight = budgetH
    const VB_H = availableHeight + CHART_TOP_MARGIN + CHART_BOTTOM_MARGIN
    const budgetTop = (availableHeight - budgetH) / 2 + CHART_TOP_MARGIN
    const budgetBot = budgetTop + budgetH

    const incomeVerticalOffset = (availableHeight - incomeTotalHeight) / 2 + CHART_TOP_MARGIN
    let incCy = incomeVerticalOffset
    const incomeLayout = sortedIncome.map((inc) => {
      const h = inc.amount * SCALE
      const centerY = incCy + h / 2
      incCy += h + INCOME_MIN_GAP
      return { ...inc, h, actualY: centerY }
    })

    const paidSoFar = incomeEntries
      .filter((i) => !i.isFuture && !i.isToday)
      .reduce((s, i) => s + i.amount, 0)

    let epeY = (availableHeight - budgetH) / 2 + CHART_TOP_MARGIN
    const epeLayout: { key: EPECategory; y: number; h: number; closed: number; open: number }[] = []
    ;(['E', 'P', 'C'] as const).forEach((key) => {
      const total = epeTotal(key)
      const height = Math.max(24, total * SCALE)
      epeLayout.push({
        key,
        y: epeY,
        h: height,
        closed: epeBuckets[key].closed,
        open: epeBuckets[key].open,
      })
      epeY += height + EPE_GAP
    })

    const DEAL_PAIR_GAP = 16
    const dealNodes: { id: string; y: number; h: number; label: string; epe: EPECategory; closed: boolean; amount: number; isZeroLine: boolean }[] = []
    let dealY = (availableHeight - budgetH) / 2 + CHART_TOP_MARGIN
    ;(['E', 'P', 'C'] as const).forEach((epe) => {
      const closedAmount = epeBuckets[epe].closed
      const openAmount = epeBuckets[epe].open
      const closedH = closedAmount > 0 ? Math.max(18, closedAmount * SCALE) : DEAL_ZERO_LINE_H
      const openH = openAmount > 0 ? Math.max(18, openAmount * SCALE) : DEAL_ZERO_LINE_H
      dealNodes.push({ id: `${epe}-closed`, y: dealY, h: closedH, label: '已成交', epe, closed: true, amount: closedAmount, isZeroLine: closedAmount === 0 })
      dealY += closedH + DEAL_GAP
      dealNodes.push({ id: `${epe}-open`, y: dealY, h: openH, label: '未成交', epe, closed: false, amount: openAmount, isZeroLine: openAmount === 0 })
      dealY += openH + DEAL_PAIR_GAP
    })

    const incSegments = (() => {
      let accum = 0
      return incomeLayout
        .filter((i) => i.amount > 0)
        .map((inc) => {
          const top = budgetTop + (accum / totalBudget) * budgetH
          accum += inc.amount
          const bot = budgetTop + (accum / totalBudget) * budgetH
          return { inc, budgetTop: top, budgetBot: bot }
        })
    })()

    const budgetToEPESegments: { key: EPECategory; segTop: number; segBot: number }[] = []
    const ratioSum = totalEPE > 0 ? totalEPE : totalBudget
    let accum = 0
    ;(['E', 'P', 'C'] as const).forEach((key) => {
      const part = totalEPE > 0 ? epeTotal(key) : totalBudget / 3
      const segTop = budgetTop + (accum / ratioSum) * budgetH
      accum += totalEPE > 0 ? epeTotal(key) : totalBudget / 3
      const segBot = budgetTop + (accum / ratioSum) * budgetH
      budgetToEPESegments.push({ key, segTop, segBot })
    })

    return {
      budgetTop,
      budgetH,
      budgetBot,
      msScale: SCALE,
      paidSoFar,
      incomeLayout,
      VB_H,
      totalBudget,
      incSegments,
      budgetToEPESegments,
      epeLayout,
      dealNodes,
      epeBuckets,
    }
  }, [incomeEntries, orders, totalBudget])

  const {
    budgetTop,
    budgetH,
    msScale,
    paidSoFar,
    incomeLayout,
    VB_H,
    totalBudget: layoutTotalBudget,
    incSegments,
    budgetToEPESegments,
    epeLayout,
    dealNodes,
    epeBuckets,
  } = layout

  const isLit = useCallback(
    (id: string): boolean => {
      if (!hovered) return true
      if (hovered === id) return true
      if (hovered.startsWith('epe-')) {
        const epe = hovered.replace('epe-', '') as EPECategory
        if (id.startsWith('deal-')) return id === `deal-${epe}-closed` || id === `deal-${epe}-open`
        if (id === 'budget') return true
      }
      if (hovered.startsWith('deal-')) {
        const [, epe] = hovered.split('-')
        if (id.startsWith('epe-')) return id === `epe-${epe}`
        if (id === 'budget') return true
      }
      if (hovered === 'budget') return true
      return true
    },
    [hovered]
  )

  const bandOpacity = useCallback(
    (id: string): number => {
      if (!hovered) return 0.28
      return isLit(id) ? 0.5 : 0.05
    },
    [hovered, isLit]
  )

  const incBandOpacity = !hovered ? 0.22 : 0.07

  const budgetGradientStops = useMemo(() => {
    const totalE = epeBuckets.E.closed + epeBuckets.E.open
    const totalP = epeBuckets.P.closed + epeBuckets.P.open
    const totalC = epeBuckets.C.closed + epeBuckets.C.open
    const sum = totalE + totalP + totalC || layoutTotalBudget
    
    let accum = 0
    const stops: { offset: string; color: string }[] = []
    
    ;(['E', 'P', 'C'] as const).forEach((key, idx) => {
      const total = key === 'E' ? totalE : key === 'P' ? totalP : totalC
      const start = (accum / sum) * 100
      accum += total
      const end = (accum / sum) * 100
      
      // 在每个阶段的中心点放置纯色停靠点，让颜色自然过渡
      if (idx === 0) stops.push({ offset: '0%', color: EPE_COLORS[key] })
      stops.push({ offset: `${(start + end) / 2}%`, color: EPE_COLORS[key] })
      if (idx === 2) stops.push({ offset: '100%', color: EPE_COLORS[key] })
    })
    return stops
  }, [epeBuckets, layoutTotalBudget])

  const todayIncome = incomeLayout.find((inc) => inc.isToday)
  const todayY = todayIncome ? todayIncome.actualY : null

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-gray-800 leading-tight">按 E/P/C 与成交状态</h2>
          <p className="text-gray-400 leading-snug mt-0.5" style={{ fontSize: 12 }}>
            {subtitle ?? 'LHJCF 家装工程'} · 总预算 {layoutTotalBudget}w · 入金→总预算→E/P/C 阶段→已成交/未成交
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {(['E', 'P', 'C'] as const).map((k) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="shrink-0 rounded-full inline-block w-2 h-2" style={{ background: EPE_COLORS[k] }} />
              <span className="text-gray-500" style={{ fontSize: 12 }}>{EPE_LABELS[k]}</span>
            </div>
          ))}
          <span className="text-gray-400 text-xs">已成交（彩色） · 未成交（灰色） · 连线呈现 E/P/C 到灰色的渐变</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: VB_W }}>
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            width={VB_W}
            style={{ display: 'block' }}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <linearGradient id="bep-gradBudget" x1="0" y1="0" x2="0" y2="1">
                {budgetGradientStops.map((stop, index) => (
                  <stop key={index} offset={stop.offset} stopColor={stop.color} stopOpacity="0.95" />
                ))}
              </linearGradient>
              {(['E', 'P', 'C'] as const).map((epe) => (
                <linearGradient key={epe} id={`bep-epe-${epe}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={EPE_COLORS[epe]} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={EPE_COLORS[epe]} stopOpacity="0.4" />
                </linearGradient>
              ))}
              {(['E', 'P', 'C'] as const).map((epe) => {
                const bucket = epeBuckets[epe]
                const total = bucket.closed + bucket.open
                const ratio = total > 0 ? (bucket.closed / total) * 100 : 50
                // 增加 12% 的过渡缓冲区，让渐变更自然
                const buffer = 12
                const s1 = Math.max(0, ratio - buffer)
                const s2 = Math.min(100, ratio + buffer)
                return (
                  <linearGradient key={`block-${epe}`} id={`bep-epe-block-${epe}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={EPE_COLORS[epe]} stopOpacity="0.25" />
                    <stop offset={`${s1}%`} stopColor={EPE_COLORS[epe]} stopOpacity="0.18" />
                    <stop offset={`${s2}%`} stopColor={UNWON_GRAY} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={UNWON_GRAY} stopOpacity="0.1" />
                  </linearGradient>
                )
              })}
              {(['E', 'P', 'C'] as const).map((epe) => (
                <React.Fragment key={epe}>
                  <linearGradient id={`bep-epe-deal-${epe}-closed`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={EPE_COLORS[epe]} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={EPE_COLORS[epe]} stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id={`bep-epe-deal-${epe}-open`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={EPE_COLORS[epe]} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={UNWON_GRAY} stopOpacity="0.5" />
                  </linearGradient>
                </React.Fragment>
              ))}
              {incomeLayout.filter((i) => i.amount > 0 && !i.isUnpaid).map((inc) => (
                <linearGradient key={`bep-ifg-${inc.id}`} id={`bep-ifg-${inc.id}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={INCOME_COLOR} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={INCOME_COLOR} stopOpacity="0.2" />
                </linearGradient>
              ))}
              <linearGradient id="bep-ifg-unpaid" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            <rect x={0} y={0} width={VB_W} height={VB_H} fill="#F9FAFB" />

            {[
              { cx: (X.dateDot + X.incomeRight) / 2 - 10, label: '入金' },
              { cx: (X.budgetLeft + X.budgetRight) / 2, label: '总预算' },
              { cx: (X.epeLeft + X.epeRight) / 2, label: 'E/P/C 阶段' },
              { cx: (X.dealLeft + X.dealRight) / 2, label: '已成交 / 未成交' },
            ].map(({ cx, label }) => (
              <text key={label} x={cx} y={50} textAnchor="middle" fill="#6B7280" fontSize={15} fontWeight={500}>
                {label}
              </text>
            ))}

            <line x1={X.dateDot} y1={CHART_TOP_MARGIN} x2={X.dateDot} y2={VB_H - CHART_BOTTOM_MARGIN} stroke="#E2E8F0" strokeWidth={1} />

            {incSegments.map(({ inc, budgetTop: bt, budgetBot: bb }) => {
              const incEntry = incomeLayout.find((i) => i.id === inc.id)!
              const iy = incEntry.actualY
              const halfH = (inc.amount * msScale) / 2
              const gradientId = inc.isUnpaid ? 'bep-ifg-unpaid' : `bep-ifg-${inc.id}`
              return (
                <path
                  key={`bep-iflow-${inc.id}`}
                  d={bandPath(X.incomeRight, iy - halfH, iy + halfH, X.budgetLeft, bt, bb)}
                  fill={`url(#${gradientId})`}
                  opacity={incBandOpacity}
                />
              )
            })}

            {budgetToEPESegments.map((seg) => {
              const epeNode = epeLayout.find((n) => n.key === seg.key)!
              return (
                <path
                  key={`bep-budget-epe-${seg.key}`}
                  d={bandPath(X.budgetRight, seg.segTop, seg.segBot, X.epeLeft, epeNode.y, epeNode.y + epeNode.h)}
                  fill={`url(#bep-epe-${seg.key})`}
                  opacity={bandOpacity(`epe-${seg.key}`)}
                  onMouseEnter={() => setHovered(`epe-${seg.key}`)}
                />
              )
            })}

            {epeLayout.map((epe) => {
              const closedTotal = epe.closed
              const openTotal = epe.open
              const total = closedTotal + openTotal || 1
              const closedRatio = total > 0 ? closedTotal / total : 0.5
              const dClosed = dealNodes.find((d) => d.epe === epe.key && d.closed)
              const dOpen = dealNodes.find((d) => d.epe === epe.key && !d.closed)
              if (!dClosed || !dOpen) return null
              const lineH = DEAL_ZERO_LINE_H
              const segClosed = closedTotal > 0
                ? { top: epe.y, bot: epe.y + closedRatio * epe.h, toY: dClosed.y, toH: dClosed.h }
                : { top: epe.y, bot: epe.y + lineH, toY: dClosed.y, toH: dClosed.h }
              const segOpen = openTotal > 0
                ? { top: epe.y + closedRatio * epe.h, bot: epe.y + epe.h, toY: dOpen.y, toH: dOpen.h }
                : { top: epe.y + epe.h - lineH, bot: epe.y + epe.h, toY: dOpen.y, toH: dOpen.h }
              return (
                <React.Fragment key={`bep-epe2deal-${epe.key}`}>
                  <path
                    d={bandPath(X.epeRight, segClosed.top, segClosed.bot, X.dealLeft, segClosed.toY, segClosed.toY + segClosed.toH)}
                    fill={`url(#bep-epe-deal-${epe.key}-closed)`}
                    opacity={bandOpacity(`deal-${epe.key}-closed`)}
                    onMouseEnter={() => setHovered(`deal-${epe.key}-closed`)}
                  />
                  <path
                    d={bandPath(X.epeRight, segOpen.top, segOpen.bot, X.dealLeft, segOpen.toY, segOpen.toY + segOpen.toH)}
                    fill={`url(#bep-epe-deal-${epe.key}-open)`}
                    opacity={bandOpacity(`deal-${epe.key}-open`)}
                    onMouseEnter={() => setHovered(`deal-${epe.key}-open`)}
                  />
                </React.Fragment>
              )
            })}

            {incomeLayout.map((inc) => {
              const y = inc.actualY
              const isPast = !inc.isFuture && !inc.isToday
              const dotColor = inc.isToday ? TODAY_COLOR : isPast ? INCOME_COLOR : '#CBD5E1'
              const barColor = inc.isUnpaid ? '#E2E8F0' : isPast ? INCOME_COLOR : '#E2E8F0'
              const textColor = inc.isUnpaid ? '#64748B' : isPast ? '#111827' : '#94A3B8'
              const barH = inc.amount * msScale
              return (
                <g key={inc.id}>
                  {!inc.isUnpaid && (
                    <>
                      <line x1={X.dateDot + 6} y1={y} x2={X.incomeLeft - 2} y2={y} stroke={isPast ? INCOME_COLOR : '#CBD5E1'} strokeWidth={1} strokeDasharray="3 3" opacity={0.55} />
                      <circle cx={X.dateDot} cy={y} r={4.5} fill={dotColor} stroke="white" strokeWidth={1.5} />
                    </>
                  )}
                  {inc.amount > 0 && (
                    <>
                      <rect x={X.incomeLeft} y={y - barH / 2} width={X.incomeRight - X.incomeLeft} height={barH} rx={3} fill={barColor} opacity={0.88} />
                      <text x={(X.incomeLeft + X.incomeRight) / 2} y={y + 5} textAnchor="middle" fill={textColor} fontSize={14} fontWeight={600}>¥{inc.amount}w</text>
                    </>
                  )}
                  {!inc.isToday && !inc.isUnpaid && <text x={12} y={y + 5} fill={isPast ? '#374151' : '#94A3B8'} fontSize={13}>{inc.displayDate}</text>}
                  {inc.isUnpaid && <text x={12} y={y + 5} fill="#64748B" fontSize={13}>{inc.displayDate}</text>}
                </g>
              )
            })}

            <g style={{ cursor: 'pointer' }} onMouseEnter={() => setHovered('budget')} onMouseLeave={() => setHovered(null)}>
              <rect x={X.budgetLeft + 2} y={budgetTop + 2} width={X.budgetRight - X.budgetLeft} height={budgetH} rx={7} fill="rgba(0,0,0,0.06)" />
              <rect x={X.budgetLeft} y={budgetTop} width={X.budgetRight - X.budgetLeft} height={budgetH} rx={7} fill="url(#bep-gradBudget)" />
              <text x={(X.budgetLeft + X.budgetRight) / 2} y={budgetTop - 8} textAnchor="middle" fill="#6B7280" fontSize={11} fontWeight={600}>¥{layoutTotalBudget}w</text>
            </g>

            {epeLayout.map((epe) => {
              const bucket = epeBuckets[epe.key]
              const total = bucket.closed + bucket.open
              const ratio = total > 0 ? bucket.closed / total : 0.5
              // 动态调整文字位置：如果成交多，文字往上走；未成交多，文字往下走
              const labelYOffset = ratio > 0.6 ? -10 : ratio < 0.4 ? 10 : 4
              
              return (
                <g
                  key={`epe-${epe.key}`}
                  opacity={hovered === null || hovered === `epe-${epe.key}` ? 1 : 0.3}
                  onMouseEnter={() => setHovered(`epe-${epe.key}`)}
                >
                  <rect x={X.epeLeft} y={epe.y} width={X.epeRight - X.epeLeft} height={epe.h} rx={5} fill={`url(#bep-epe-block-${epe.key})`} stroke={rgba(UNWON_GRAY, 0.2)} strokeWidth={1} />
                  <rect x={X.epeLeft} y={epe.y} width={4} height={epe.h} rx={2} fill={EPE_COLORS[epe.key]} opacity={0.8} />
                  <text x={X.epeLeft + 10} y={epe.y + epe.h / 2 + labelYOffset} fill="#1F2937" fontSize={12} fontWeight={600}>{EPE_LABELS[epe.key]}</text>
                  <text x={X.epeLeft + 10} y={epe.y + epe.h / 2 + labelYOffset + 14} fill="#6B7280" fontSize={11}>已成交 ¥{epe.closed}w / 未成交 ¥{epe.open}w</text>
                </g>
              )
            })}

            {dealNodes.map((d) => {
              const baseColor = d.closed ? EPE_COLORS[d.epe] : UNWON_GRAY
              const dealColor = d.closed ? rgba(baseColor, 0.45) : rgba(baseColor, 0.4)
              const dealFill = d.closed ? rgba(baseColor, 0.18) : rgba(baseColor, 0.12)
              return (
                <g
                  key={`deal-${d.id}`}
                  opacity={hovered === null || hovered === `deal-${d.epe}-${d.closed ? 'closed' : 'open'}` ? 1 : 0.3}
                  onMouseEnter={() => setHovered(`deal-${d.epe}-${d.closed ? 'closed' : 'open'}`)}
                >
                  {d.isZeroLine ? (
                    <line x1={X.dealLeft} y1={d.y + d.h / 2} x2={X.dealRight} y2={d.y + d.h / 2} stroke={dealColor} strokeWidth={1.5} strokeDasharray="3 2" />
                  ) : (
                    <>
                      <rect x={X.dealLeft} y={d.y} width={X.dealRight - X.dealLeft} height={d.h} rx={4} fill={dealFill} stroke={dealColor} strokeWidth={1} />
                      <rect x={X.dealLeft} y={d.y} width={4} height={d.h} rx={2} fill={baseColor} opacity={d.closed ? 0.85 : 0.7} />
                      <text x={X.dealLabelLeft} y={d.y + d.h / 2 - 2} fill="#374151" fontSize={11} fontWeight={500}>{d.label}</text>
                      <text x={X.dealLabelLeft} y={d.y + d.h / 2 + 12} fill="#6B7280" fontSize={10}>{EPE_LABELS[d.epe].slice(0, 2)} · ¥{d.amount}w</text>
                    </>
                  )}
                </g>
              )
            })}

            {todayY !== null && (
              <line x1={X.dateDot} y1={todayY} x2={X.budgetRight} y2={todayY} stroke={TODAY_COLOR} strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
            )}
          </svg>
        </div>
      </div>

      <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <span className="text-gray-400" style={{ fontSize: 11 }}>入金→总预算→E/P/C 阶段→已成交/未成交</span>
        <span className="text-gray-400" style={{ fontSize: 11 }}>已入金 ¥{paidSoFar}w / 总预算 ¥{layoutTotalBudget}w</span>
      </div>
    </div>
  )
}

export default BudgetSankeyByEPE
