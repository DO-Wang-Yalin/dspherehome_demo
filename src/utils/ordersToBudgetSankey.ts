import type {
  BudgetSankeyData,
  IncomeEntry,
  Milestone,
  Order as SankeyOrder,
  StatusGroup,
} from '../components/BudgetSankey'
import { getOrderStatusColor } from './orderStatus'
import type { OrderStatusColor } from './orderStatus'
import type { ProjectBudgetData } from '../types'

/** 将列表中的金额文案解析为「万元」，与列表展示同源（区间取中值，待定给占位值） */
export function parseOrderAmountToWan(amountStr: string): number {
  if (!amountStr || /待定/.test(amountStr)) return 0.5
  const nums =
    amountStr.match(/[\d,]+/g)?.map((s) => parseInt(s.replace(/,/g, ''), 10)).filter((n) => !Number.isNaN(n)) ??
    []
  if (nums.length === 0) return 0.5
  const yuan = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0]
  return Math.max(0.01, yuan / 10000)
}

const PHASE_TO_STATUS: Record<OrderStatusColor, StatusGroup> = {
  intention: '意向期',
  ordering: '订购期',
  delivery: '交付期',
  acceptance: '验收期',
  maintenance: '维保期',
  red: '验收期',
  gray: '意向期',
}

function safeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_')
}

export type DisplayOrder = {
  id: string
  title: string
  status: string
  date?: string
  amount: string
}

/**
 * 由当前订单列表（与筛选后列表同一批）生成 BudgetSankey 数据，保证与列表条目一一对应。
 */
export function buildBudgetSankeyFromDisplayOrders(orders: DisplayOrder[]): BudgetSankeyData | null {
  if (!orders.length) return null

  const sorted = [...orders].sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id.localeCompare(b.id))

  const milestones: Milestone[] = []
  const sankeyOrders: SankeyOrder[] = []
  const incomeEntries: IncomeEntry[] = []
  let total = 0

  sorted.forEach((o, i) => {
    const wan = parseOrderAmountToWan(o.amount)
    total += wan
    const msId = `ms_${safeId(o.id)}`
    const phase = getOrderStatusColor(o.status)
    const sg = PHASE_TO_STATUS[phase] ?? '意向期'

    milestones.push({
      id: msId,
      name: o.title.length > 28 ? `${o.title.slice(0, 26)}…` : o.title,
      budgetMin: wan,
      budgetMax: wan,
      dueDate: o.date || '—',
    })

    sankeyOrders.push({
      id: `ord_${safeId(o.id)}`,
      number: o.id,
      title: o.title,
      status: sg,
      milestoneId: msId,
      budget: wan,
    })

    const displayDate = o.date ? o.date.replace(/-/g, '.') : `·${i + 1}`
    incomeEntries.push({
      id: `inc_${safeId(o.id)}`,
      date: o.date || `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
      displayDate,
      amount: wan,
      status: sg,
      isToday: i === sorted.length - 1,
    })
  })

  return {
    incomeEntries,
    milestones,
    orders: sankeyOrders,
    totalBudget: Math.max(Number(total.toFixed(4)), 0.01),
  }
}

const EPC_RATIOS = { E: 0.1, P: 0.55, C: 0.35 } as const

/**
 * 基于项目预算数据生成 EPC 维度的 BudgetSankey 数据：
 * - 总预算取 EPC 区间中值（万）
 * - E/P/C 按线索阶段的默认占比分配
 * - 已成交 / 未成交按 epcWon 占比拆分
 * - 入金来自 epcDeposit，剩余部分视为「未入金」
 */
export function buildBudgetSankeyFromProjectBudget(
  budget: ProjectBudgetData,
): BudgetSankeyData | null {
  const rangeMin = Number.isFinite(budget.epcRangeMin) ? budget.epcRangeMin : 0
  const rangeMax = Number.isFinite(budget.epcRangeMax) ? budget.epcRangeMax : 0
  const mid = (rangeMin > 0 || rangeMax > 0) ? (rangeMin + rangeMax) / 2 : 0
  const totalBudget = mid > 0 ? mid : 0

  if (totalBudget <= 0) {
    return null
  }

  const clampedDeposit = Math.max(0, budget.epcDeposit || 0)
  const clampedWon = Math.max(0, budget.epcWon || 0)
  const deposit = Math.min(clampedDeposit, totalBudget)
  const remainingBudget = Math.max(0, Number((totalBudget - deposit).toFixed(4)))

  const incomeEntries: IncomeEntry[] = []

  function toDisplayDate(isoDate: string): string {
    const d = (isoDate || '').slice(0, 10)
    return d.replace(/-/g, '.') || '—'
  }

  if (deposit > 0) {
    const ledger = (budget.epcDepositEntries ?? []).filter((e) => e && e.amount > 0)
    const ledgerSum = ledger.reduce((s, e) => s + e.amount, 0)

    if (ledger.length > 0 && ledgerSum > 0) {
      const scale = deposit / ledgerSum
      const sorted = [...ledger].sort((a, b) => a.date.localeCompare(b.date))
      sorted.forEach((e, i) => {
        const amt = Number((e.amount * scale).toFixed(4))
        if (amt <= 0) return
        incomeEntries.push({
          id: `inc-dep-${i}-${e.date}`,
          date: e.date.slice(0, 10),
          displayDate: toDisplayDate(e.date),
          amount: amt,
          status: '订购期',
          isToday: i === sorted.length - 1,
        })
      })
    } else {
      const fallbackDate =
        budget.confirmedAt?.slice(0, 10) ||
        budget.adjustmentHistory?.[0]?.at?.slice(0, 10) ||
        new Date().toISOString().slice(0, 10)
      incomeEntries.push({
        id: 'inc-deposit',
        date: fallbackDate,
        displayDate: toDisplayDate(fallbackDate),
        amount: Number(deposit.toFixed(4)),
        status: '订购期',
        isToday: true,
      })
    }
  }

  if (remainingBudget > 0) {
    incomeEntries.push({
      id: 'inc-unpaid',
      date: new Date().toISOString().slice(0, 10),
      displayDate: '未入金',
      amount: remainingBudget,
      status: '意向期',
      isFuture: true,
    })
  }

  const closedRatio =
    totalBudget > 0 ? Math.max(0, Math.min(1, clampedWon / totalBudget)) : 0

  const milestones: Milestone[] = []
  const orders: SankeyOrder[] = []

  const epeMilestones: Record<'E' | 'P' | 'C', { id: string; name: string }> = {
    E: { id: 'ms02', name: '设计阶段预算' },
    P: { id: 'ms08', name: '主材设备预算' },
    C: { id: 'ms10', name: '施工阶段预算' },
  }

  ;(['E', 'P', 'C'] as const).forEach((key) => {
    const ratio = EPC_RATIOS[key]
    const catTotal = Number((totalBudget * ratio).toFixed(4))
    if (catTotal <= 0) return

    const closed = Number((catTotal * closedRatio).toFixed(4))
    const open = Math.max(0, Number((catTotal - closed).toFixed(4)))

    const milestone = epeMilestones[key]
    milestones.push({
      id: milestone.id,
      name: milestone.name,
      budgetMin: catTotal,
      budgetMax: catTotal,
      dueDate: '—',
    })

    if (closed > 0) {
      orders.push({
        id: `ord-${key}-closed`,
        number: `${key}-closed`,
        title: `${key} 已成交预算`,
        status: '验收期',
        milestoneId: milestone.id,
        budget: closed,
      })
    }

    if (open > 0) {
      orders.push({
        id: `ord-${key}-open`,
        number: `${key}-open`,
        title: `${key} 待成交预算`,
        status: '意向期',
        milestoneId: milestone.id,
        budget: open,
      })
    }
  })

  return {
    incomeEntries,
    milestones,
    orders,
    totalBudget: Number(totalBudget.toFixed(4)),
  }
}

/** 与桑基图 E/P/C 条同色，便于饼图与下方桑基一致 */
export const EPC_SANKEY_COLORS = { E: '#4887FF', P: '#7BC80E', C: '#EF6B00' } as const
export const EPC_SANKEY_LABELS = {
  E: 'E 高端设计',
  P: 'P 严选精品',
  C: 'C 匠心施工',
} as const

export type EpcAllocationSegment = {
  key: 'E' | 'P' | 'C'
  label: string
  wan: number
  pct: number
  color: string
}

/** 与 buildBudgetSankeyFromProjectBudget 同一口径：区间中值 × E/P/C 占比 */
export function getEpcAllocationFromProjectBudget(budget: ProjectBudgetData): {
  totalWan: number
  segments: EpcAllocationSegment[]
} | null {
  const rangeMin = Number.isFinite(budget.epcRangeMin) ? budget.epcRangeMin : 0
  const rangeMax = Number.isFinite(budget.epcRangeMax) ? budget.epcRangeMax : 0
  const mid = rangeMin > 0 || rangeMax > 0 ? (rangeMin + rangeMax) / 2 : 0
  if (mid <= 0) return null
  const totalWan = Number(mid.toFixed(2))
  const segments: EpcAllocationSegment[] = (['E', 'P', 'C'] as const).map((key) => ({
    key,
    label: EPC_SANKEY_LABELS[key],
    wan: Number((totalWan * EPC_RATIOS[key]).toFixed(2)),
    pct: EPC_RATIOS[key] * 100,
    color: EPC_SANKEY_COLORS[key],
  }))
  return { totalWan, segments }
}

function epcDonutSlicePath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number,
): string {
  const rad = Math.PI / 180
  const toXY = (r: number, deg: number) => {
    const a = (deg - 90) * rad
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }
  const large = endDeg - startDeg > 180 ? 1 : 0
  const o1 = toXY(rOuter, startDeg)
  const o2 = toXY(rOuter, endDeg)
  const i2 = toXY(rInner, endDeg)
  const i1 = toXY(rInner, startDeg)
  return `M ${o1.x} ${o1.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${o2.x} ${o2.y} L ${i2.x} ${i2.y} A ${rInner} ${rInner} 0 ${large} 0 ${i1.x} ${i1.y} Z`
}

/** 供 UI 渲染 EPC 饼图（与桑基图数据同源） */
export function buildEpcPiePaths(segments: EpcAllocationSegment[], totalWan: number) {
  if (totalWan <= 0 || !segments.length) return []
  let angle = 0
  const cx = 100
  const cy = 100
  const rOuter = 78
  const rInner = 48
  return segments.map((seg) => {
    const sweep = (seg.wan / totalWan) * 360
    const start = angle
    const end = angle + sweep
    angle = end
    const d = sweep >= 359.9 ? '' : epcDonutSlicePath(cx, cy, rInner, rOuter, start, end)
    return { ...seg, d, sweep }
  })
}
