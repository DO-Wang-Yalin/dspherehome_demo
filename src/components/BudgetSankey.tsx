import React, { useState, useMemo, useCallback } from 'react'

// 轻量替代：ai-studio 无 antd，用 console 模拟 message
const message = {
  info: (content: string, _duration?: number) => {
    // eslint-disable-next-line no-console
    console.log(content)
  },
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type StatusGroup = '意向期' | '订购期' | '交付期' | '验收期' | '维保期'

export interface IncomeEntry {
  id: string
  date: string
  displayDate: string
  amount: number // 万元, 0 = date marker only
  status: StatusGroup
  isToday?: boolean
  isFuture?: boolean
  isUnpaid?: boolean
}

export interface Milestone {
  id: string
  name: string
  budgetMin: number
  budgetMax: number
  dueDate: string
}

export interface Order {
  id: string
  number: string
  title: string
  status: StatusGroup
  milestoneId: string
  budget: number // 万元
}

/** Optional data prop: when provided, Sankey uses this instead of built-in mock. */
export interface BudgetSankeyData {
  incomeEntries: IncomeEntry[]
  milestones: Milestone[]
  orders: Order[]
  totalBudget: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<StatusGroup, string> = {
  意向期: '#94A3B8',
  订购期: '#F59E0B',
  交付期: '#9333EA',
  验收期: '#F97316',
  维保期: '#22C55E',
}

const STATUS_LIST: StatusGroup[] = ['意向期', '订购期', '交付期', '验收期', '维保期']

// ─── Mock Data ────────────────────────────────────────────────────────────────

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

const MILESTONES: Milestone[] = [
  { id: 'ms02', name: 'MS02-空调设计', budgetMin: 2.8, budgetMax: 3.0, dueDate: '2025.06.28' },
  { id: 'ms06', name: 'MS06-室内拆除工程', budgetMin: 4.5, budgetMax: 5.0, dueDate: '2025.07.28' },
  { id: 'ms08', name: 'MS08-水电工程', budgetMin: 9.5, budgetMax: 12.5, dueDate: '2025.10.01' },
  { id: 'ms10', name: 'MS10-室内泥水工程', budgetMin: 14.0, budgetMax: 15.0, dueDate: '2025.12.05' },
  { id: 'ms11', name: 'MS11-油漆工程', budgetMin: 3.5, budgetMax: 4.0, dueDate: '2026.01.10' },
  { id: 'ms12', name: 'MS12-木工安装', budgetMin: 4.5, budgetMax: 5.0, dueDate: '2026.02.15' },
  { id: 'ms_final', name: '项目结算', budgetMin: 4.8, budgetMax: 5.5, dueDate: '2026.04.05' },
]

const ORDERS: Order[] = [
  { id: 'ord001', number: 'PSO-OD-LHJCF-00001', title: '设计服务', status: '维保期', milestoneId: 'ms02', budget: 3.0 },
  { id: 'ord006', number: 'PSO-OD-LHJCF-00006', title: '全星新墙构建', status: '验收期', milestoneId: 'ms06', budget: 2.5 },
  { id: 'ord009', number: 'PSO-OD-LHJCF-00009', title: '垃圾清运', status: '维保期', milestoneId: 'ms06', budget: 2.5 },
  { id: 'ord012', number: 'PSO-OD-LHJCF-00012', title: '水电布管', status: '验收期', milestoneId: 'ms08', budget: 3.5 },
  { id: 'ord014', number: 'PSO-OD-LHJCF-00014', title: '中央空调布管', status: '交付期', milestoneId: 'ms08', budget: 5.0 },
  { id: 'ord016', number: 'PSO-OD-LHJCF-00016', title: '地暖铺设', status: '交付期', milestoneId: 'ms08', budget: 4.0 },
  { id: 'ord021', number: 'PSO-OD-LHJCF-00021', title: '室内防水', status: '订购期', milestoneId: 'ms10', budget: 5.0 },
  { id: 'ord025', number: 'PSO-OD-LHJCF-00025', title: '瓷砖辅贴', status: '意向期', milestoneId: 'ms10', budget: 5.0 },
  { id: 'ord028', number: 'PSO-OD-LHJCF-00028', title: '石材安装', status: '意向期', milestoneId: 'ms10', budget: 5.0 },
  { id: 'ord026', number: 'PSO-OD-LHJCF-00026', title: '墙面基层处理', status: '意向期', milestoneId: 'ms11', budget: 2.0 },
  { id: 'ord029', number: 'PSO-OD-LHJCF-00029', title: '乳胶漆涂刷', status: '意向期', milestoneId: 'ms11', budget: 2.0 },
  { id: 'ord030', number: 'PSO-OD-LHJCF-00030', title: '定制衣柜', status: '意向期', milestoneId: 'ms12', budget: 2.5 },
  { id: 'ord031', number: 'PSO-OD-LHJCF-00031', title: '橱柜安装', status: '意向期', milestoneId: 'ms12', budget: 2.5 },
  { id: 'ord_remain', number: '余款返还', title: '余款返还', status: '意向期', milestoneId: 'ms_final', budget: 5.5 },
]

const TOTAL_BUDGET = 50 // 万元

// ─── Layout Config ────────────────────────────────────────────────────────────

const VB_W = 1500

const X = {
  dateDot: 172,
  incomeLeft: 188,
  incomeRight: 250,
  budgetLeft: 400,
  budgetRight: 444,
  msLeft: 594,
  msRight: 762,
  ordLeft: 912,
  ordRight: 1096,
  ordLabelLeft: 1106,
}

const CHART_TOP_MARGIN = 72
const CHART_BOTTOM_MARGIN = 50
const MS_GAP = 16
const ORD_GAP = 16
const INCOME_COLOR = '#FBBF24'
const TODAY_COLOR = '#F97316'
const INCOME_MIN_GAP = 16

// ─── Helpers ───────────────────────────────────────────────────────────────────

function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

function bandPath(
  x1: number,
  top1: number,
  bot1: number,
  x2: number,
  top2: number,
  bot2: number
): string {
  const mx = (x1 + x2) / 2
  return (
    `M${x1},${top1} C${mx},${top1} ${mx},${top2} ${x2},${top2}` +
    ` L${x2},${bot2} C${mx},${bot2} ${mx},${bot1} ${x1},${bot1} Z`
  )
}

// ─── Computed Layout ──────────────────────────────────────────────────────────

function useLayout(
  incomeEntries: IncomeEntry[],
  milestones: Milestone[],
  orders: Order[],
  totalBudget: number
) {
  return useMemo(() => {
    const SCALE = 18

    const msContentHeight = milestones.reduce((sum, ms) => sum + ms.budgetMax * SCALE, 0)
    const msGapsHeight = MS_GAP * (milestones.length - 1)
    const msTotalHeight = msContentHeight + msGapsHeight

    const sortedPaidIncome = [...incomeEntries]
      .filter((inc) => !inc.isFuture)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const futureIncomeTotal = incomeEntries.filter((inc) => inc.isFuture).reduce(
      (sum, inc) => sum + inc.amount,
      0
    )

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
    const incomeGapsHeight = INCOME_MIN_GAP * (sortedIncome.length - 1)
    const incomeTotalHeight = incomeNodesHeight + incomeGapsHeight

    const ordTotalHeight = msTotalHeight
    const budgetTotalHeight = msTotalHeight

    const maxColumnHeight = Math.max(
      incomeTotalHeight,
      msTotalHeight,
      ordTotalHeight,
      budgetTotalHeight
    )

    const VB_H = maxColumnHeight + CHART_TOP_MARGIN + CHART_BOTTOM_MARGIN
    const availableHeight = maxColumnHeight

    const msVerticalOffset = (availableHeight - msTotalHeight) / 2 + CHART_TOP_MARGIN

    let msCy = msVerticalOffset
    const msLayout = milestones.map((ms) => {
      const h = ms.budgetMax * SCALE
      const node = { ...ms, y: msCy, h }
      msCy += h + MS_GAP
      return node
    })

    const incomeVerticalOffset = (availableHeight - incomeTotalHeight) / 2 + CHART_TOP_MARGIN

    let incCy = incomeVerticalOffset
    const incomeLayout = sortedIncome.map((inc) => {
      const h = inc.amount * SCALE
      const centerY = incCy + h / 2
      const node = { ...inc, h, actualY: centerY, idealY: centerY, timeRatio: 0 }
      incCy += h + INCOME_MIN_GAP
      return node
    })

    const ordLayout = orders.map((ord) => {
      const ms = msLayout.find((m) => m.id === ord.milestoneId)!
      const siblings = orders.filter((o) => o.milestoneId === ord.milestoneId)
      const totalOrd = siblings.reduce((s, o) => s + o.budget, 0)
      const ordGaps = ORD_GAP * (siblings.length - 1)
      const ordScale = (ms.h - ordGaps) / totalOrd
      let offset = 0
      for (const sib of siblings) {
        if (sib.id === ord.id) break
        offset += sib.budget * ordScale + ORD_GAP
      }
      return { ...ord, y: ms.y + offset, h: ord.budget * ordScale }
    })

    const budgetTop = msLayout[0].y
    const budgetBot = msLayout[msLayout.length - 1].y + msLayout[msLayout.length - 1].h
    const budgetH = budgetBot - budgetTop

    const paidSoFar = incomeEntries.filter((i) => !i.isFuture && !i.isToday).reduce(
      (s, i) => s + i.amount,
      0
    )

    return {
      msLayout,
      ordLayout,
      budgetTop,
      budgetH,
      budgetBot,
      msScale: SCALE,
      paidSoFar,
      incomeLayout,
      VB_H,
      availableHeight,
      totalBudget,
    }
  }, [incomeEntries, milestones, orders, totalBudget])
}

// ─── Legend Component ─────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {STATUS_LIST.map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <span
            className="shrink-0 rounded-full inline-block"
            style={{ width: 8, height: 8, background: STATUS_COLORS[s] }}
          />
          <span className="text-gray-500" style={{ fontSize: 12 }}>
            {s}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface BudgetSankeyProps {
  /** When provided, use this data instead of built-in mock. */
  data?: BudgetSankeyData | null
  /** Optional subtitle (e.g. project name). */
  subtitle?: string
}

function BudgetSankey({ data, subtitle }: BudgetSankeyProps = {}) {
  const incomeEntries = data?.incomeEntries ?? INCOME_ENTRIES
  const milestones = data?.milestones ?? MILESTONES
  const orders = data?.orders ?? ORDERS
  const totalBudget = data?.totalBudget ?? TOTAL_BUDGET

  const [hovered, setHovered] = useState<string | null>(null)
  const layout = useLayout(incomeEntries, milestones, orders, totalBudget)
  const {
    msLayout,
    ordLayout,
    budgetTop,
    budgetH,
    budgetBot,
    msScale,
    paidSoFar,
    incomeLayout,
    VB_H,
    availableHeight,
    totalBudget: layoutTotalBudget,
  } = layout

  const isLit = useCallback(
    (id: string): boolean => {
      if (!hovered) return true
      if (hovered === id) return true
      if (hovered.startsWith('ms')) {
        const ord = ordLayout.find((o) => o.id === id)
        return id === hovered || (!!ord && ord.milestoneId === hovered)
      }
      if (hovered.startsWith('ord')) {
        const ord = ordLayout.find((o) => o.id === hovered)
        if (!ord) return false
        return id === hovered || id === ord.milestoneId
      }
      return true
    },
    [hovered, ordLayout]
  )

  const bandOpacity = useCallback(
    (id: string): number => {
      if (!hovered) return 0.28
      return isLit(id) ? 0.5 : 0.05
    },
    [hovered, isLit]
  )

  const incBandOpacity = !hovered ? 0.22 : 0.07

  const msBudgetSegments = useMemo(() => {
    let accum = 0
    return msLayout.map((ms) => {
      const top = budgetTop + (accum / layoutTotalBudget) * budgetH
      accum += ms.budgetMax
      const bot = budgetTop + (accum / layoutTotalBudget) * budgetH
      return { ...ms, segTop: top, segBot: bot }
    })
  }, [msLayout, budgetTop, budgetH, layoutTotalBudget])

  const incSegments = useMemo(() => {
    let accum = 0
    return incomeLayout
      .filter((i) => i.amount > 0)
      .map((inc) => {
        const top = budgetTop + (accum / layoutTotalBudget) * budgetH
        accum += inc.amount
        const bot = budgetTop + (accum / layoutTotalBudget) * budgetH
        return { inc, budgetTop: top, budgetBot: bot }
      })
  }, [budgetTop, budgetH, incomeLayout, layoutTotalBudget])

  const handleBudgetClick = useCallback(() => {
    message.info(`预计总预算：¥${layoutTotalBudget}w`, 3)
  }, [layoutTotalBudget])

  const handleOrderClick = useCallback((ord: Order) => {
    message.info(
      `${ord.number} · ${ord.title} · ${ord.status} · ¥${ord.budget}w（跳转订单详情，功能预留）`,
      3.5
    )
  }, [])

  const todayIncome = incomeLayout.find((inc) => inc.isToday)
  const todayY = todayIncome ? todayIncome.actualY : null

  const msPrimaryStatus = useCallback((msId: string): StatusGroup => {
    const priority: StatusGroup[] = ['意向期', '订购期', '交付期', '验收期', '维保期']
    const ords = orders.filter((o) => o.milestoneId === msId)
    for (const sp of priority) {
      if (ords.some((o) => o.status === sp)) return sp
    }
    return '意向期'
  }, [orders])

  const budgetGradientStops = useMemo(() => {
    let accum = 0
    return msLayout.map((ms) => {
      const ps = msPrimaryStatus(ms.id)
      const color = STATUS_COLORS[ps]
      const offsetStart = (accum / layoutTotalBudget) * 100
      accum += ms.budgetMax
      const offsetEnd = (accum / layoutTotalBudget) * 100
      return {
        offsetStart: `${offsetStart}%`,
        offsetEnd: `${offsetEnd}%`,
        color,
      }
    })
  }, [msLayout, msPrimaryStatus, layoutTotalBudget])

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-gray-800 leading-tight">项目预算桑基图</h2>
          <p className="text-gray-400 leading-snug mt-0.5" style={{ fontSize: 12 }}>
            {subtitle ?? 'LHJCF 家装工程'} · 总预算 {layoutTotalBudget}w
          </p>
        </div>
        <Legend />
      </div>

      {/* Scrollable chart area: 固定 SVG 宽度为 VB_W，确保横向滚动生效 */}
      <div className="w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: VB_W }}>
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            width={VB_W}
            style={{ display: 'block' }}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <linearGradient id="gradBudget" x1="0" y1="0" x2="0" y2="1">
                {budgetGradientStops.map((stop, index) => (
                  <stop
                    key={index}
                    offset={stop.offsetStart}
                    stopColor={stop.color}
                    stopOpacity="0.95"
                  />
                ))}
              </linearGradient>

              {msLayout.map((ms) => {
                const ps = msPrimaryStatus(ms.id)
                const c = STATUS_COLORS[ps]
                return (
                  <linearGradient
                    key={`fg-${ms.id}`}
                    id={`fg-${ms.id}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor={c} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={c} stopOpacity="0.4" />
                  </linearGradient>
                )
              })}

              {orders.map((ord) => {
                const c = STATUS_COLORS[ord.status]
                return (
                  <linearGradient
                    key={`ofg-${ord.id}`}
                    id={`ofg-${ord.id}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor={c} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={c} stopOpacity="0.38" />
                  </linearGradient>
                )
              })}

              {incomeLayout.filter((i) => i.amount > 0 && !i.isUnpaid).map((inc) => (
                <linearGradient
                  key={`ifg-${inc.id}`}
                  id={`ifg-${inc.id}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor={INCOME_COLOR} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={INCOME_COLOR} stopOpacity="0.2" />
                </linearGradient>
              ))}

              <linearGradient id="ifg-unpaid" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            <rect x={0} y={0} width={VB_W} height={VB_H} fill="#F9FAFB" />

            {/* Column headers per Figma: 列标题 15px / 500 / #6B7280 */}
            {[
              { cx: (X.dateDot + X.incomeRight) / 2 - 10, label: '入金' },
              { cx: (X.budgetLeft + X.budgetRight) / 2, label: '总预算' },
              { cx: (X.msLeft + X.msRight) / 2, label: '里程碑' },
              { cx: (X.ordLeft + X.ordRight) / 2, label: '订单' },
            ].map(({ cx, label }) => (
              <text
                key={label}
                x={cx}
                y={50}
                textAnchor="middle"
                fill="#6B7280"
                fontSize={15}
                fontWeight={500}
              >
                {label}
              </text>
            ))}

            {/* Timeline vertical line */}
            <line
              x1={X.dateDot}
              y1={CHART_TOP_MARGIN}
              x2={X.dateDot}
              y2={VB_H - CHART_BOTTOM_MARGIN}
              stroke="#E2E8F0"
              strokeWidth={1}
            />

            {incSegments.map(({ inc, budgetTop: bt, budgetBot: bb }) => {
              const incEntry = incomeLayout.find((i) => i.id === inc.id)!
              const iy = incEntry.actualY
              const halfH = (inc.amount * msScale) / 2
              const gradientId = inc.isUnpaid ? 'ifg-unpaid' : `ifg-${inc.id}`
              return (
                <path
                  key={`iflow-${inc.id}`}
                  d={bandPath(X.incomeRight, iy - halfH, iy + halfH, X.budgetLeft, bt, bb)}
                  fill={`url(#${gradientId})`}
                  opacity={incBandOpacity}
                />
              )
            })}

            {msBudgetSegments.map((seg) => (
              <path
                key={`mflow-${seg.id}`}
                d={bandPath(
                  X.budgetRight,
                  seg.segTop,
                  seg.segBot,
                  X.msLeft,
                  seg.y,
                  seg.y + seg.h
                )}
                fill={`url(#fg-${seg.id})`}
                opacity={bandOpacity(seg.id)}
                style={{ cursor: 'default' }}
                onMouseEnter={() => setHovered(seg.id)}
              />
            ))}

            {ordLayout.map((ord) => {
              const ms = msLayout.find((m) => m.id === ord.milestoneId)!
              const siblings = orders.filter((o) => o.milestoneId === ord.milestoneId)
              let prevBudget = 0
              for (const sib of siblings) {
                if (sib.id === ord.id) break
                prevBudget += sib.budget
              }
              const msTop = ms.y + (prevBudget / ms.budgetMax) * ms.h
              const msBot = ms.y + ((prevBudget + ord.budget) / ms.budgetMax) * ms.h

              return (
                <path
                  key={`oflow-${ord.id}`}
                  d={bandPath(X.msRight, msTop, msBot, X.ordLeft, ord.y, ord.y + ord.h)}
                  fill={`url(#ofg-${ord.id})`}
                  opacity={bandOpacity(ord.id)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(ord.id)}
                  onClick={() => handleOrderClick(ord)}
                />
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
                  {/* 未入金汇总节点不显示时间轴圆点与连接虚线（Figma 规范） */}
                  {!inc.isUnpaid && (
                    <>
                      <line
                        x1={X.dateDot + 6}
                        y1={y}
                        x2={X.incomeLeft - 2}
                        y2={y}
                        stroke={isPast ? INCOME_COLOR : '#CBD5E1'}
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        opacity={0.55}
                      />
                      <circle
                        cx={X.dateDot}
                        cy={y}
                        r={4.5}
                        fill={dotColor}
                        stroke="white"
                        strokeWidth={1.5}
                      />
                    </>
                  )}

                  {inc.amount > 0 && (
                    <>
                      <rect
                        x={X.incomeLeft}
                        y={y - barH / 2}
                        width={X.incomeRight - X.incomeLeft}
                        height={barH}
                        rx={3}
                        fill={barColor}
                        opacity={0.88}
                      />
                      <text
                        x={(X.incomeLeft + X.incomeRight) / 2}
                        y={y + 5}
                        textAnchor="middle"
                        fill={textColor}
                        fontSize={14}
                        fontWeight={600}
                      >
                        ¥{inc.amount}w
                      </text>
                    </>
                  )}

                  {inc.isToday ? (
                    <g>
                      <rect
                        x={12}
                        y={y - 12}
                        width={78}
                        height={24}
                        rx={12}
                        fill="none"
                        stroke={STATUS_COLORS['订购期']}
                        strokeWidth={1.2}
                      />
                      <text
                        x={51}
                        y={y + 5}
                        textAnchor="middle"
                        fill={STATUS_COLORS['订购期']}
                        fontSize={13}
                        fontWeight={600}
                      >
                        {inc.displayDate}
                      </text>
                      <rect
                        x={94}
                        y={y - 10}
                        width={38}
                        height={20}
                        rx={10}
                        fill={STATUS_COLORS['验收期']}
                      />
                      <text
                        x={113}
                        y={y + 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize={12}
                        fontWeight={700}
                      >
                        今日
                      </text>
                    </g>
                  ) : inc.isUnpaid ? (
                    <text x={12} y={y + 5} fill="#64748B" fontSize={13}>
                      {inc.displayDate}
                    </text>
                  ) : (
                    <text
                      x={12}
                      y={y + 5}
                      fill={isPast ? '#374151' : '#94A3B8'}
                      fontSize={13}
                    >
                      {inc.displayDate}
                    </text>
                  )}
                </g>
              )
            })}

            <g
              style={{ cursor: 'pointer' }}
              onClick={handleBudgetClick}
              onMouseEnter={() => setHovered('budget')}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                x={X.budgetLeft + 2}
                y={budgetTop + 2}
                width={X.budgetRight - X.budgetLeft}
                height={budgetH}
                rx={7}
                fill="rgba(0,0,0,0.06)"
              />
              <rect
                x={X.budgetLeft}
                y={budgetTop}
                width={X.budgetRight - X.budgetLeft}
                height={budgetH}
                rx={7}
                fill="url(#gradBudget)"
              />
              <text
                x={(X.budgetLeft + X.budgetRight) / 2}
                y={budgetTop - 8}
                textAnchor="middle"
                fill="#6B7280"
                fontSize={11}
                fontWeight={600}
              >
                ¥{layoutTotalBudget}w
              </text>
            </g>

            {msLayout.map((ms) => {
              const ps = msPrimaryStatus(ms.id)
              const c = STATUS_COLORS[ps]
              const lit = isLit(ms.id)
              const bw = X.msRight - X.msLeft
              const minH = 24
              const h = Math.max(minH, ms.h)

              return (
                <g
                  key={ms.id}
                  opacity={lit ? 1 : 0.25}
                  style={{ cursor: 'default' }}
                  onMouseEnter={() => setHovered(ms.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <rect
                    x={X.msLeft}
                    y={ms.y}
                    width={bw}
                    height={h}
                    rx={5}
                    fill={rgba(c, 0.1)}
                  />
                  <rect
                    x={X.msLeft}
                    y={ms.y}
                    width={4}
                    height={h}
                    rx={2}
                    fill={c}
                    opacity={0.75}
                  />
                  <rect
                    x={X.msLeft}
                    y={ms.y}
                    width={bw}
                    height={h}
                    rx={5}
                    fill="none"
                    stroke={rgba(c, 0.35)}
                    strokeWidth={1}
                  />

                  {h >= 18 && (
                    <text
                      x={X.msLeft + 10}
                      y={ms.y + Math.min(19, h * 0.55)}
                      fill="#1F2937"
                      fontSize={h > 32 ? 14 : 12.5}
                      fontWeight={600}
                    >
                      {ms.name}
                    </text>
                  )}
                  {h >= 34 && (
                    <text
                      x={X.msLeft + 10}
                      y={ms.y + 33}
                      fill="#6B7280"
                      fontSize={11.5}
                      fontWeight={400}
                    >
                      ¥{ms.budgetMin}~{ms.budgetMax}w
                    </text>
                  )}
                </g>
              )
            })}

            {ordLayout.map((ord) => {
              const c = STATUS_COLORS[ord.status]
              const lit = isLit(ord.id)
              const bw = X.ordRight - X.ordLeft
              const minH = 22
              const h = Math.max(minH, ord.h)

              return (
                <g
                  key={ord.id}
                  opacity={lit ? 1 : 0.2}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(ord.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleOrderClick(ord)}
                >
                  <rect
                    x={X.ordLeft}
                    y={ord.y}
                    width={bw}
                    height={h}
                    rx={4}
                    fill={rgba(c, 0.07)}
                  />
                  <rect
                    x={X.ordLeft}
                    y={ord.y}
                    width={bw}
                    height={h}
                    rx={4}
                    fill="none"
                    stroke={rgba(c, 0.3)}
                    strokeWidth={1}
                  />
                  <rect
                    x={X.ordRight - 4}
                    y={ord.y}
                    width={4}
                    height={h}
                    rx={2}
                    fill={c}
                    opacity={0.8}
                  />

                  <circle
                    cx={X.ordLeft + 11}
                    cy={ord.y + h / 2}
                    r={3.5}
                    fill={c}
                    opacity={0.7}
                  />

                  {h >= 14 && (
                    <text
                      x={X.ordLeft + 20}
                      y={ord.y + h / 2 + 4}
                      fill="#374151"
                      fontSize={11}
                      fontWeight={500}
                    >
                      {ord.number}
                    </text>
                  )}

                  <text
                    x={X.ordLabelLeft + 6}
                    y={ord.y + h / 2 + 4}
                    fill={lit ? '#4B5563' : '#9CA3AF'}
                    fontSize={12}
                  >
                    {ord.title}
                  </text>
                </g>
              )
            })}

            {todayY !== null && (
              <line
                x1={X.dateDot}
                y1={todayY}
                x2={X.msLeft}
                y2={todayY}
                stroke={TODAY_COLOR}
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.4}
              />
            )}
          </svg>
        </div>
      </div>

      <div className="px-5 py-2.5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <span className="text-gray-400" style={{ fontSize: 11 }}>
          横向滑动查看完整图表 · 点击节点查看详情
        </span>
        <span className="text-gray-400" style={{ fontSize: 11 }}>
          已入金 ¥{paidSoFar}w / 总预算 ¥{layoutTotalBudget}w
        </span>
      </div>
    </div>
  )
}

export default BudgetSankey
